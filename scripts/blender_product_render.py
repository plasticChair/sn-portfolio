"""Batch-render OBJ products in Blender 4.2+; run with blender --background.

Example:
    blender --background --factory-startup --python scripts/blender_product_render.py -- \
        models --output renders --save-blend
"""

import argparse
from contextlib import contextmanager
import importlib
import math
import os
from pathlib import Path
import sys
import tempfile


def positive_int(value: str) -> int:
    number = int(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("Must be a positive integer.")
    return number


def bounded_float(lower: float, upper: float):
    def parse(value: str) -> float:
        number = float(value)
        if not math.isfinite(number) or not lower <= number <= upper:
            raise argparse.ArgumentTypeError(f"Must be between {lower} and {upper}.")
        return number

    return parse


def plastic_color(value: str) -> tuple[float, float, float, float]:
    hexadecimal = value.removeprefix("#")
    if len(hexadecimal) != 6 or any(character not in "0123456789abcdefABCDEF"
                                     for character in hexadecimal):
        raise argparse.ArgumentTypeError("Use a six-digit RGB color, such as '#3C4148'.")
    try:
        channels = [int(hexadecimal[index:index + 2], 16) / 255 for index in (0, 2, 4)]
    except ValueError as error:
        raise argparse.ArgumentTypeError("Color must contain hexadecimal digits.") from error
    linear = [channel / 12.92 if channel <= 0.04045
              else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
    return (*linear, 1.0)


def argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="+", type=Path, help="OBJ files or directories.")
    parser.add_argument("--output", required=True, type=Path, help="Destination directory.")
    parser.add_argument("--recursive", action="store_true", help="Include nested directories.")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing renders.")
    parser.add_argument("--save-blend", action="store_true", help="Also save an editable scene.")
    parser.add_argument("--scene-only", action="store_true",
                        help="Save an editable scene with imported materials, without rendering.")
    parser.add_argument("--keep-materials", action="store_true",
                        help="Keep imported OBJ/MTL materials; fill missing slots with plastic.")
    parser.add_argument("--color", type=plastic_color, default=plastic_color("#3C4148"))
    parser.add_argument("--roughness", type=bounded_float(0.0, 1.0), default=0.7)
    parser.add_argument("--bevel", type=bounded_float(0.0, 0.01), default=0.001,
                        help="Edge bevel as a fraction of the longest dimension; 0 disables it.")
    parser.add_argument("--azimuth", type=bounded_float(-360.0, 360.0), default=45.0,
                        help="Camera angle around Z, in degrees from +X toward +Y.")
    parser.add_argument("--elevation", type=bounded_float(5.0, 85.0), default=35.0)
    parser.add_argument("--margin", type=bounded_float(0.01, 0.3), default=0.08,
                        help="Minimum empty fraction at each image edge.")
    parser.add_argument("--up-axis", choices=("Z", "Y", "X"), default="Z",
                        help="Up direction in the source OBJ; output scenes are Z-up.")
    parser.add_argument("--resolution", nargs=2, type=positive_int, default=(1600, 1200),
                        metavar=("WIDTH", "HEIGHT"))
    parser.add_argument("--samples", type=positive_int, default=128)
    return parser


def render_jobs(inputs: list[Path], output: Path, recursive: bool) -> list[tuple[Path, Path]]:
    jobs = {}
    seen_sources = set()
    for supplied in inputs:
        source = supplied.resolve()
        if source.is_file() and source.suffix.lower() == ".obj":
            candidates = [(source, Path(source.name))]
        elif source.is_dir():
            entries = source.rglob("*") if recursive else source.iterdir()
            candidates = [(entry, entry.relative_to(source)) for entry in entries
                          if entry.is_file() and entry.suffix.lower() == ".obj"]
        else:
            raise ValueError(f"Not an OBJ file or directory: {supplied}")
        for model, relative in sorted(candidates):
            model = model.resolve()
            if model in seen_sources:
                continue
            destination = (output / relative.with_suffix(".png")).resolve()
            destination_key = str(destination).casefold()
            if destination_key in jobs:
                other = jobs[destination_key][0]
                raise ValueError(f"Output collision: {other} and {model}. Use separate outputs.")
            jobs[destination_key] = (model, destination)
            seen_sources.add(model)
    if not jobs:
        raise ValueError("No OBJ files found. Use --recursive to include subdirectories.")
    return list(jobs.values())


def bounds(points) -> tuple[tuple[float, ...], tuple[float, ...]]:
    if not points:
        raise ValueError("The OBJ contains no usable mesh vertices.")
    minimum = tuple(min(point[axis] for point in points) for axis in range(3))
    maximum = tuple(max(point[axis] for point in points) for axis in range(3))
    if not all(math.isfinite(value) for point in points for value in point):
        raise ValueError("The OBJ contains non-finite coordinates.")
    if max(maximum[axis] - minimum[axis] for axis in range(3)) <= 0:
        raise ValueError("The OBJ has zero size.")
    return minimum, maximum


def camera_frame(points, azimuth: float, elevation: float, aspect: float, margin: float):
    """Return target, outward direction, and horizontal orthographic scale."""
    bounds(points)
    if aspect <= 0 or not 0 < margin < 0.5:
        raise ValueError("Camera aspect must be positive and margin between 0 and 0.5.")
    azimuth, elevation = math.radians(azimuth), math.radians(elevation)
    outward = (math.cos(elevation) * math.cos(azimuth),
               math.cos(elevation) * math.sin(azimuth), math.sin(elevation))
    right = (-math.sin(azimuth), math.cos(azimuth), 0.0)
    up = (-math.sin(elevation) * math.cos(azimuth),
          -math.sin(elevation) * math.sin(azimuth), math.cos(elevation))
    basis = (right, up, outward)
    extents = []
    for direction in basis:
        projected = [sum(point[axis] * direction[axis] for axis in range(3))
                     for point in points]
        extents.append((min(projected), max(projected)))
    center = [(minimum + maximum) / 2 for minimum, maximum in extents]
    target = tuple(sum(center[index] * basis[index][axis] for index in range(3))
                   for axis in range(3))
    width = extents[0][1] - extents[0][0]
    height = extents[1][1] - extents[1][0]
    scale = max(width, height * aspect) / (1 - 2 * margin)
    return target, outward, scale


def mesh_points(objects, bpy, evaluated: bool = False):
    points = []
    graph = bpy.context.evaluated_depsgraph_get() if evaluated else None
    for obj in objects:
        mesh_object = obj.evaluated_get(graph) if evaluated else obj
        mesh = mesh_object.to_mesh() if evaluated else obj.data
        try:
            points.extend(tuple(mesh_object.matrix_world @ vertex.co) for vertex in mesh.vertices)
        finally:
            if evaluated:
                mesh_object.to_mesh_clear()
    return points


def make_material(bpy, name: str, color, roughness: float):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Metallic"].default_value = 0.0
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["IOR"].default_value = 1.46
    return material


@contextmanager
def material_import_source(source: Path):
    library = source.with_suffix(".mtl")
    if not library.is_file():
        yield source
        return
    with source.open("rb") as original:
        declarations = [line.split() for line in original if line.split()[:1] == [b"mtllib"]]
    if len(declarations) != 1 or len(declarations[0]) != 2:
        yield source
        return
    declared = source.parent / declarations[0][1].decode("utf-8", errors="surrogateescape")
    if declared.is_file():
        yield source
        return
    with tempfile.TemporaryDirectory(prefix="portfolio-obj-") as directory:
        staged = Path(directory) / source.name
        relative_library = os.path.relpath(library, directory).replace(os.sep, "/")
        with source.open("rb") as original, staged.open("wb") as temporary:
            for line in original:
                if line.split()[:1] == [b"mtllib"]:
                    line = f'mtllib "{relative_library}"\n'.encode("utf-8", errors="surrogateescape")
                temporary.write(line)
        print(f"MATERIAL LIBRARY {declared.name} missing; using {library}", flush=True)
        yield staged


def prepare_model(bpy, mathutils, source: Path, options):
    forward_axis = "Y" if options.up_axis == "Z" else "NEGATIVE_Z"
    with material_import_source(source) as imported:
        bpy.ops.wm.obj_import(filepath=str(imported), forward_axis=forward_axis,
                              up_axis=options.up_axis, use_split_objects=True, use_split_groups=True)
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not any(obj.data.polygons for obj in objects):
        raise ValueError("The OBJ has no renderable faces.")
    product = bpy.data.collections.new("Product")
    bpy.context.scene.collection.children.link(product)
    for obj in objects:
        for collection in obj.users_collection:
            collection.objects.unlink(obj)
        product.objects.link(obj)
    minimum, maximum = bounds(mesh_points(objects, bpy))
    scale = 2.0 / max(maximum[axis] - minimum[axis] for axis in range(3))
    offset = (-(minimum[0] + maximum[0]) * scale / 2,
              -(minimum[1] + maximum[1]) * scale / 2, -minimum[2] * scale)
    transform = mathutils.Matrix.Translation(offset) @ mathutils.Matrix.Scale(scale, 4)
    plastic = make_material(bpy, "Matte plastic", options.color, options.roughness)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        world_matrix = obj.matrix_world.copy()
        obj.parent = None
        obj.matrix_world = transform @ world_matrix
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.select_set(False)
        if options.keep_materials:
            if not obj.data.materials:
                obj.data.materials.append(plastic)
            for index, material in enumerate(obj.data.materials):
                if material is None:
                    obj.data.materials[index] = plastic
        else:
            obj.data.materials.clear()
            obj.data.materials.append(plastic)
        needs_smoothing = not obj.data.has_custom_normals
        if needs_smoothing:
            for face in obj.data.polygons:
                face.use_smooth = True
        if options.bevel:
            bevel = obj.modifiers.new("Subtle edge highlights", "BEVEL")
            bevel.width = options.bevel * 2
            bevel.segments = 3
            bevel.limit_method = "ANGLE"
            bevel.angle_limit = math.radians(30)
            bevel.use_clamp_overlap = True
            bevel.harden_normals = True
        if needs_smoothing:
            sharp = obj.modifiers.new("Preserve CAD edges", "EDGE_SPLIT")
            sharp.split_angle = math.radians(30)
            sharp.use_edge_angle = True
        if options.bevel:
            normal = obj.modifiers.new("Weighted face normals", "WEIGHTED_NORMAL")
            normal.keep_sharp = True
    bpy.context.view_layer.update()
    points = mesh_points(objects, bpy, evaluated=True)
    minimum, _ = bounds(points)
    for obj in objects:
        obj.location.z -= minimum[2]
    bpy.context.view_layer.update()
    return mesh_points(objects, bpy, evaluated=True)


def area_light(bpy, mathutils, name: str, location, target, power: float, size: float, color):
    light = bpy.data.lights.new(name, "AREA")
    light.energy = power
    light.shape = "DISK"
    light.size = size
    light.color = color
    obj = bpy.data.objects.new(name, light)
    bpy.data.collections["Studio"].objects.link(obj)
    obj.location = location
    obj.rotation_euler = (mathutils.Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def setup_studio(bpy, mathutils, points, options, destination: Path):
    scene = bpy.context.scene
    studio = bpy.data.collections.new("Studio")
    scene.collection.children.link(studio)
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = options.samples
    scene.cycles.use_denoising = True
    scene.cycles.use_adaptive_sampling = True
    scene.render.resolution_x, scene.render.resolution_y = options.resolution
    scene.render.resolution_percentage = 100
    scene.render.pixel_aspect_x = scene.render.pixel_aspect_y = 1.0
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = False
    scene.render.filepath = str(destination)
    scene.render.use_file_extension = True
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0
    scene.world = bpy.data.worlds.new("Light-gray studio environment")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.7, 0.7, 0.7, 1.0)
    background.inputs["Strength"].default_value = 0.5
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.0001))
    ground = bpy.context.object
    ground.name = "Studio ground"
    for collection in ground.users_collection:
        collection.objects.unlink(ground)
    studio.objects.link(ground)
    ground.data.materials.append(make_material(bpy, "Light-gray ground", (0.6, 0.6, 0.6, 1), 0.85))
    target, outward, scale = camera_frame(points, options.azimuth, options.elevation,
                                          options.resolution[0] / options.resolution[1], options.margin)
    camera_data = bpy.data.cameras.new("Orthographic product camera")
    camera_data.type = "ORTHO"
    camera_data.sensor_fit = "HORIZONTAL"
    camera_data.ortho_scale = scale
    camera_data.clip_start = 0.01
    camera_data.clip_end = 100
    camera = bpy.data.objects.new(camera_data.name, camera_data)
    studio.objects.link(camera)
    camera.location = mathutils.Vector(target) + mathutils.Vector(outward) * 8
    camera.rotation_euler = (mathutils.Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera
    horizontal = math.hypot(outward[0], outward[1])
    front = (outward[0] / horizontal, outward[1] / horizontal)
    right = (-front[1], front[0])

    def position(front_distance, side_distance, height):
        return (front[0] * front_distance + right[0] * side_distance,
                front[1] * front_distance + right[1] * side_distance, height)

    light_target = (0, 0, 0.7)
    area_light(bpy, mathutils, "Key softbox", position(3, -3, 5), light_target,
               650, 4, (1.0, 0.96, 0.92))
    area_light(bpy, mathutils, "Fill softbox", position(2, 4, 3), light_target,
               250, 5, (0.93, 0.96, 1.0))
    area_light(bpy, mathutils, "Rim softbox", position(-3, 1, 4), light_target,
               850, 3, (1.0, 1.0, 1.0))
    bpy.context.view_layer.update()
    object_utils = importlib.import_module("bpy_extras.object_utils")
    for point in points:
        projected = object_utils.world_to_camera_view(scene, camera, mathutils.Vector(point))
        tolerance = 0.00001
        if not (options.margin - tolerance <= projected.x <= 1 - options.margin + tolerance
                and options.margin - tolerance <= projected.y <= 1 - options.margin + tolerance
                and camera_data.clip_start < projected.z < camera_data.clip_end):
            raise RuntimeError("Camera fit failed; a mesh vertex lies outside the safe frame.")


def save_editable_scene(bpy, blend_path: Path):
    bpy.ops.object.select_all(action="DESELECT")
    product = bpy.data.collections["Product"]
    if product.objects:
        obj = product.objects[0]
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == "VIEW_3D":
                space = area.spaces.active
                space.shading.color_type = "MATERIAL"
                space.region_3d.view_perspective = "CAMERA"
                space.region_3d.view_camera_zoom = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))


def main() -> int:
    parser = argument_parser()
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    options = parser.parse_args(arguments)
    if options.scene_only:
        options.save_blend = True
        options.keep_materials = True
    try:
        jobs = render_jobs(options.inputs, options.output, options.recursive)
    except ValueError as error:
        parser.error(str(error))
    try:
        bpy = importlib.import_module("bpy")
        mathutils = importlib.import_module("mathutils")
    except ImportError:
        parser.error("Run this script with Blender, not your system Python. See --help.")
    if bpy.app.version < (4, 2, 0):
        parser.error("Blender 4.2 or newer is required.")
    if not bpy.app.background:
        parser.error("Use Blender --background; this script replaces the working scene.")
    failures = 0
    for source, destination in jobs:
        blend_path = destination.with_suffix(".blend")
        if not options.overwrite and ((not options.scene_only and destination.exists())
                                     or (options.save_blend and blend_path.exists())):
            print(f"SKIP existing output: {destination}", flush=True)
            continue
        try:
            action = "SCENE" if options.scene_only else "RENDER"
            target = blend_path if options.scene_only else destination
            print(f"{action} {source} -> {target}", flush=True)
            bpy.ops.wm.read_factory_settings(use_empty=True)
            points = prepare_model(bpy, mathutils, source, options)
            setup_studio(bpy, mathutils, points, options, destination)
            destination.parent.mkdir(parents=True, exist_ok=True)
            if not options.scene_only:
                bpy.ops.render.render(write_still=True)
            if options.save_blend:
                save_editable_scene(bpy, blend_path)
        except Exception as error:
            failures += 1
            print(f"FAILED {source}: {error}", file=sys.stderr, flush=True)
    print(f"Finished: {len(jobs)} input(s), {failures} failure(s).", flush=True)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())