"""Geometry and CLI checks runnable without installing Blender's Python modules."""

import importlib.util
import itertools
import math
import os
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "blender_product_render.py"
SPEC = importlib.util.spec_from_file_location("product_render", SCRIPT)
render = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(render)


class CameraTests(unittest.TestCase):
    def assert_framed(self, points, azimuth=45, elevation=35, aspect=4 / 3, margin=0.08):
        target, outward, scale = render.camera_frame(points, azimuth, elevation, aspect, margin)
        azimuth, elevation = math.radians(azimuth), math.radians(elevation)
        right = (-math.sin(azimuth), math.cos(azimuth), 0)
        up = (-math.sin(elevation) * math.cos(azimuth),
              -math.sin(elevation) * math.sin(azimuth), math.cos(elevation))
        horizontal_coordinates, vertical_coordinates = [], []
        for point in points:
            offset = [point[axis] - target[axis] for axis in range(3)]
            horizontal = 0.5 + sum(offset[axis] * right[axis] for axis in range(3)) / scale
            vertical = 0.5 + sum(offset[axis] * up[axis] for axis in range(3)) / (scale / aspect)
            horizontal_coordinates.append(horizontal)
            vertical_coordinates.append(vertical)
            self.assertGreaterEqual(horizontal + 1e-12, margin)
            self.assertLessEqual(horizontal - 1e-12, 1 - margin)
            self.assertGreaterEqual(vertical + 1e-12, margin)
            self.assertLessEqual(vertical - 1e-12, 1 - margin)
        self.assertAlmostEqual(min(horizontal_coordinates) + max(horizontal_coordinates), 1)
        self.assertAlmostEqual(min(vertical_coordinates) + max(vertical_coordinates), 1)
        self.assertAlmostEqual(sum(value ** 2 for value in outward), 1)

    def test_varied_products_and_image_aspects(self):
        for dimensions in ((2, 2, 2), (100, 1, 0.1), (0.01, 0.02, 20), (2, 3, 0)):
            points = list(itertools.product(*[(offset, offset + size)
                                              for offset, size in zip((20, -40, 15), dimensions)]))
            for aspect in (4 / 3, 3 / 4, 16 / 9, 1):
                for azimuth, elevation in ((45, 35), (-135, 5), (210, 85)):
                    with self.subTest(dimensions=dimensions, aspect=aspect, angle=azimuth):
                        self.assert_framed(points, azimuth, elevation, aspect)

    def test_separated_parts_and_asymmetric_shape(self):
        self.assert_framed([(0, 0, 0), (1, 0, 1), (50, -30, 10), (51, -29, 12)])

    def test_invalid_meshes(self):
        for points in ([], [(1, 1, 1)], [(0, 0, 0), (math.nan, 1, 1)],
                       [(0, 0, 0), (math.inf, 1, 1)]):
            with self.subTest(points=points), self.assertRaises(ValueError):
                render.bounds(points)

    def test_invalid_camera_parameters(self):
        points = [(0, 0, 0), (1, 1, 1)]
        for aspect, margin in ((0, 0.08), (1, 0), (1, 0.5)):
            with self.assertRaises(ValueError):
                render.camera_frame(points, 45, 35, aspect, margin)


class InputTests(unittest.TestCase):
    def test_defaults_and_color_conversion(self):
        options = render.argument_parser().parse_args(["part.obj", "--output", "renders"])
        self.assertEqual(options.resolution, (1600, 1200))
        self.assertEqual(options.up_axis, "Z")
        self.assertEqual(options.roughness, 0.7)
        self.assertEqual(render.plastic_color("#FFFFFF"), (1, 1, 1, 1))
        self.assertAlmostEqual(render.plastic_color("808080")[0], 0.2158605)

    def test_invalid_numeric_options(self):
        import argparse

        for value in ("nan", "inf", "-0.1", "2"):
            with self.assertRaises(argparse.ArgumentTypeError):
                render.bounded_float(0, 1)(value)
        with self.assertRaises(argparse.ArgumentTypeError):
            render.positive_int("0")
        for value in ("#FFFF", "#ZZZZZZ", "-10000", "+10000"):
            with self.assertRaises(argparse.ArgumentTypeError):
                render.plastic_color(value)

    def test_folder_discovery_case_and_relative_output(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            nested = root / "models" / "nested"
            nested.mkdir(parents=True)
            (nested.parent / "part.OBJ").touch()
            (nested / "assembly.obj").touch()
            (nested.parent / "notes.txt").touch()
            jobs = render.render_jobs([nested.parent], root / "renders", recursive=True)
            self.assertEqual(len(jobs), 2)
            self.assertIn((nested / "assembly.obj", root / "renders" / "nested" / "assembly.png"), jobs)
            self.assertEqual(len(render.render_jobs([nested.parent], root / "renders", False)), 1)

    def test_deduplicate_sources_and_reject_output_collisions(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first, second = root / "one" / "part.obj", root / "two" / "part.obj"
            first.parent.mkdir()
            second.parent.mkdir()
            first.touch()
            second.touch()
            self.assertEqual(len(render.render_jobs([first, first], root / "renders", False)), 1)
            with self.assertRaisesRegex(ValueError, "collision"):
                render.render_jobs([first, second], root / "renders", False)

    def test_missing_or_empty_inputs(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with self.assertRaisesRegex(ValueError, "No OBJ"):
                render.render_jobs([root], root / "renders", False)
            with self.assertRaisesRegex(ValueError, "Not an OBJ"):
                render.render_jobs([root / "missing.obj"], root / "renders", False)

    def test_renamed_material_library_only_changes_temporary_reference(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model = root / "renamed.obj"
            content = b"mtllib original.mtl\ng Part\nv 0 0 0\n"
            model.write_bytes(content)
            model.with_suffix(".mtl").write_text("newmtl Plastic\nKd 1 0 0\n", encoding="ascii")
            with render.material_import_source(model) as imported:
                self.assertNotEqual(imported, model)
                declaration = imported.read_text().splitlines()[0].split(maxsplit=1)[1].strip('"')
                self.assertEqual((imported.parent / declaration).resolve(), model.with_suffix(".mtl"))
                self.assertTrue(imported.read_bytes().endswith(b"g Part\nv 0 0 0\n"))
            self.assertFalse(imported.exists())
            self.assertEqual(model.read_bytes(), content)
            (root / "original.mtl").touch()
            with render.material_import_source(model) as imported:
                self.assertEqual(imported, model)


BLENDER = os.environ.get("BLENDER_BIN") or shutil.which("blender")


@unittest.skipUnless(BLENDER, "Blender unavailable; set BLENDER_BIN to run the render smoke test.")
class BlenderSmokeTests(unittest.TestCase):
    def test_scene_only_preserves_materials_parts_and_sources(self):
        with tempfile.TemporaryDirectory(prefix="materials with spaces ") as directory:
            root = Path(directory)
            model = root / "renamed.obj"
            content = ("mtllib old-name.mtl\n"
                       "v 0 0 0\nv 1 0 0\nv 0 1 0\nv 3 0 0\nv 4 0 0\nv 3 1 0\n"
                       "g Left\nusemtl RedPlastic\nf 1 2 3\n"
                       "g Right\nusemtl GrayMetal\nf 4 5 6\n")
            material_content = "newmtl RedPlastic\nKd 1 0 0\nnewmtl GrayMetal\nKd 0.5 0.5 0.5\n"
            model.write_text(content, encoding="ascii")
            model.with_suffix(".mtl").write_text(material_content, encoding="ascii")
            result = subprocess.run([BLENDER, "--background", "--factory-startup",
                                     "--python-exit-code", "1", "--python", str(SCRIPT), "--",
                                     str(model), "--output", str(root / "scenes"), "--scene-only"],
                                    capture_output=True, text=True, timeout=180)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            scene = root / "scenes" / "renamed.blend"
            self.assertTrue(scene.exists(), result.stdout + result.stderr)
            self.assertFalse(scene.with_suffix(".png").exists())
            expression = ("import bpy; product=bpy.data.collections['Product']; "
                          "materials={material.name for obj in product.objects "
                          "for material in obj.data.materials}; "
                          "assert materials == {'RedPlastic','GrayMetal'}, materials; "
                          "color=bpy.data.materials['RedPlastic'].node_tree.nodes.get('Principled BSDF')"
                          ".inputs['Base Color'].default_value; "
                          "assert color[0]>0.99 and color[1]<0.001 and color[2]<0.001, tuple(color); "
                          "assert len(product.objects)==2; "
                          "assert len([obj for obj in bpy.data.collections['Studio'].objects "
                          "if obj.type=='LIGHT' and obj.data.type=='AREA'])==3; "
                          "assert bpy.context.scene.camera.data.type=='ORTHO'; "
                          "print('EDITABLE_OK')")
            reopened = subprocess.run([BLENDER, "--background", str(scene), "--python-exit-code",
                                       "1", "--python-expr", expression],
                                      capture_output=True, text=True, timeout=180)
            self.assertEqual(reopened.returncode, 0, reopened.stdout + reopened.stderr)
            self.assertIn("EDITABLE_OK", reopened.stdout)
            self.assertEqual(model.read_text(encoding="ascii"), content)
            self.assertEqual(model.with_suffix(".mtl").read_text(encoding="ascii"), material_content)

    def test_render_multipart_obj(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            model = root / "two-parts.obj"
            vertices = []
            cube_faces = ((1, 2, 4, 3), (5, 7, 8, 6), (1, 5, 6, 2),
                          (3, 4, 8, 7), (1, 3, 7, 5), (2, 6, 8, 4))
            for part, offset in enumerate((0, 3)):
                vertices.append(f"o Part{part}")
                vertices.extend(f"v {horizontal + offset} {depth} {height}"
                                for horizontal, depth, height in itertools.product((0, 1), repeat=3))
                vertices.extend("f " + " ".join(str(index + part * 8) for index in face)
                                for face in cube_faces)
            model.write_text("\n".join(vertices) + "\n", encoding="ascii")
            result = subprocess.run([BLENDER, "--background", "--factory-startup",
                                     "--python-exit-code", "1", "--python", str(SCRIPT), "--",
                                     str(model), "--output", str(root / "renders"), "--save-blend",
                                     "--resolution", "64", "48", "--samples", "1"],
                                    capture_output=True, text=True, timeout=180)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            image = root / "renders" / "two-parts.png"
            self.assertTrue(image.exists(), result.stdout + result.stderr)
            header = image.read_bytes()[:24]
            self.assertEqual(header[:8], b"\x89PNG\r\n\x1a\n")
            self.assertEqual(struct.unpack(">II", header[16:24]), (64, 48))
            self.assertTrue(image.with_suffix(".blend").exists())
            self.assertEqual(model.read_text(encoding="ascii"), "\n".join(vertices) + "\n")


if __name__ == "__main__":
    unittest.main()