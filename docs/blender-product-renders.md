# Blender product renders

`scripts/blender_product_render.py` creates one studio PNG per OBJ file using Blender 4.2 or newer (4.5 LTS is a suitable starting point). It runs locally, independently of Astro. Blender includes its own Python, `bpy`, and `mathutils`; no pip packages are needed. This is an offline asset tool, not a website or deployment dependency.

## Default scene

- Orthographic three-quarter camera: 45-degree azimuth, 35-degree elevation, 1600 x 1200 output.
- Automatic framing using every evaluated mesh vertex, including modifiers and separated parts. At least 8% of each image edge stays clear of the model, including in portrait output. Blender's own camera projection is checked before rendering.
- Neutral light-gray ground plane and environment with contact shadows, not a transparent background.
- Three large area-light softboxes: warm-neutral key, weaker cool-neutral fill, and rear rim. Their positions follow the camera azimuth to maintain the lighting arrangement when the view changes.
- Charcoal matte plastic: nonmetallic Principled BSDF, roughness 0.7, IOR 1.46. Use `--color` for a different plastic color.
- Small, non-destructive edge bevels for highlights. Imported custom normals are preserved; meshes without them get smooth shading with sharp edges retained.
- Cycles CPU rendering, 128 samples, adaptive sampling, denoising, AgX color management, RGB PNG output.

All mesh parts within one OBJ are treated as one product. Separate OBJ files produce separate images; the script does not assemble multiple files into one product. Export a complete assembly as one OBJ in Fusion when that is what you want to show.

The working scene is centered, uniformly scaled so the longest dimension is 2 Blender units, and placed on the ground. Relative dimensions and part positions stay intact; source OBJ/MTL files are never modified. The normalized scene is for imagery, not dimensional verification. The script replaces its working scene and therefore requires background mode; do not run it inside an unsaved interactive Blender session.

## Run on Windows

The Windows launcher detects Microsoft Store Blender automatically, including its version-dependent installation directory. It uses Windows' supported package-context command so there is no need to change permissions under `WindowsApps` or run as administrator. The Store installation on this machine is Blender 5.2.2 LTS, verified with an actual render.

From the portfolio directory in PowerShell, render your folder:

```powershell
.\scripts\render_products.ps1 -InputPath 'C:\Users\super\Pictures\Portfolio\Renders' -SaveBlend
```

The output defaults to a new `StudioRenders` folder beside the input models. Each model gets a PNG and, with `-SaveBlend`, an editable scene. The original OBJ and MTL files remain unchanged. The launcher waits for its own render process and writes a uniquely named render log in the output directory.

For a fast preview of one model:

```powershell
.\scripts\render_products.ps1 -InputPath 'C:\Users\super\Pictures\Portfolio\Renders\FinderCompass.obj' -OutputPath 'C:\Users\super\Pictures\Portfolio\Renders\StudioRenders\Previews' -Width 800 -Height 600 -Samples 32 -SaveBlend
```

The launcher also accepts `-Color '#D9DDE2'`, `-Azimuth 135`, `-Elevation 30`, `-UpAxis Y`, `-Recursive`, `-KeepMaterials`, and `-Overwrite`. Use `-BlenderPath` for a regular, non-Store executable if it is not on PATH. Store Blender is discovered through `Get-AppxPackage` and its application manifest on every run; do not hardcode its protected, versioned path. Direct execution of the Store executable can fail with `Access is denied` outside its package context, even when the file exists.

For a regular Blender installation, the Python script can also be called directly. Use the path for your installed version:

```powershell
$blender = 'C:\Program Files\Blender Foundation\Blender 4.5\blender.exe'
& $blender --background --factory-startup --python-exit-code 1 --python .\scripts\blender_product_render.py -- 'E:\Models\product.obj' --output 'E:\ProductRenders' --save-blend
```

For a whole folder, including subdirectories:

```powershell
& $blender --background --factory-startup --python-exit-code 1 --python .\scripts\blender_product_render.py -- 'E:\Models' --output 'E:\ProductRenders' --recursive --save-blend
```

The `--` separates Blender options from script options. Paths containing spaces must be quoted. Use `--python-exit-code 1` so script errors produce a failing process exit code.

`product.obj` produces `product.png` and, with `--save-blend`, `product.blend`. Folder inputs preserve relative subdirectories in the output. Existing PNGs or requested blend scenes are skipped unless `--overwrite` is supplied. Duplicate input files are deduplicated; different models targeting the same filename are rejected before rendering. An individual import/render error is reported and the batch continues; any failures cause a nonzero exit code.

Keep input models and draft renders outside `public/` so they are not deployed accidentally. When a render is approved, add only the intended PNG to the project's image directory and update its alt text/caption to say it is a CAD render, not a photograph of built hardware. This script does not replace existing portfolio photos or placeholders automatically.

## Adjustments

Append these options after the script's `--`:

| Option | Purpose |
| --- | --- |
| `--color '#D9DDE2'` | Light plastic, specified in sRGB hex; default is `#3C4148` |
| `--roughness 0.8` | More matte surface; valid range 0 to 1 |
| `--azimuth 135 --elevation 30` | Change the three-quarter view; azimuth is measured from +X toward +Y |
| `--up-axis Y` | Correct a model exported Y-up; default is Z, and X is also accepted |
| `--resolution 1200 1600` | Portrait output, automatically reframed |
| `--samples 32 --resolution 800 600` | Faster preview; use more samples for final images |
| `--margin 0.12` | More space around the product; minimum empty fraction per edge |
| `--bevel 0` | Disable artificial edge rounding for already-rounded or delicate geometry |
| `--bevel 0.0005` | Smaller bevel, as a fraction of the longest model dimension |
| `--keep-materials` | Preserve OBJ/MTL materials; use matte plastic only for empty material slots |
| `--save-blend` | Save the studio scene for manual material or lighting edits |
| `--overwrite` | Explicitly replace existing output images/scenes |

The default bevel is 0.001 of the longest dimension (0.1%). It is clamped to avoid overlapping edges, but inspect thin walls and small details; disable it when it changes the design's appearance. OBJ exports are triangulated geometry, so sufficient Fusion export refinement is important for smooth curves. Shading cannot recover geometry absent from a coarse mesh.

By default all imported materials are replaced with the chosen matte plastic. For mixed plastic/metal/rubber products, use `--keep-materials` with an accompanying MTL file or edit the exported blend scene. Material assignments and realistic color still need visual review against the actual product.

## Verification

Pure-Python tests cover landscape/portrait orthographic framing, extreme proportions, disconnected parts, invalid geometry, color conversion, recursive discovery, and output collisions. From the portfolio directory, with an available Python 3.10+ interpreter:

```powershell
python -m unittest discover -s tests -p 'test_blender_product_render.py' -v
```

To also render a temporary two-part OBJ and verify PNG dimensions, blend output, and unchanged source geometry:

```powershell
$env:BLENDER_BIN = $blender
python -m unittest discover -s tests -p 'test_blender_product_render.py' -v
```

That test command assumes an executable that can be launched directly, such as a regular Blender installation. Store executables need the package launch context; use the preview launcher command above to validate a supplied model instead. The package-context process does not automatically inherit custom environment variables from the invoking terminal.

All ten Python tests, including the real two-part Blender smoke render, passed in the Store package context with Blender 5.2.2 LTS. `FinderCompass.obj` was also rendered and visually inspected at 800 x 600. Blender 5.2 reports deprecation warnings for `Material.use_nodes` and `World.use_nodes` planned for removal in Blender 6.0; they do not affect these renders. Compatibility with Blender 6.0 has not been verified.