# Engineering Portfolio

A modern, static engineering portfolio built with Astro, TypeScript, and Markdown. Project cards, category filters, case-study pages, and navigation are generated from your content. Local fonts and images keep the deployed site self-contained. No server, database, paid service, or Cloudflare adapter is required.

The portfolio uses a full-width photographic opener, a compact charcoal theme, and a category-filtered catalog with main photos as tile backgrounds. The opener's circuit-board photo is illustrative; project images include supplied JPGs and remaining labeled PNG placeholders. There are 16 entries: 13 design-based case studies from `E:\Designs`, the PCB Business Cards from `E:\Deadbug\BusinessCards\BusinessCards`, a Cyr Wheel build/media draft, and SMS-Questions from `E:\Projects\SMS-Questions` with an owner-confirmed Android/Wi-Fi/Proxmox deployment. SMS-Questions uses an original local architecture illustration rather than a photo of the deployed hardware; its asset source and offline generator are documented in `docs/assets.md`. Source files were inspected read-only; they are not copied into this repository or automatically synchronized.

**The portfolio name is Scott Nette; contact details still need configuring.** Review the case-study drafts against your actual build history before publishing. Unknown dates, completion claims, and measured outcomes are intentionally omitted. `Design documented` means source design files exist, not that hardware passed testing. The source map and open questions are in `docs/project-sources.md`.

## Run locally

Install Node.js 22.22.0 (or a supported newer version), then:

```sh
npm ci
npm run dev
```

Open the URL printed by Astro, normally `http://127.0.0.1:4321`. Changes reload automatically. Stop the server with Ctrl+C. In VS Code, the **Portfolio: Dev server** task also starts the site. Its temporary Node fallback is for this machine; install Node for regular development.

```sh
npm run build
npm test
npm run preview
```

The build runs a strict typecheck and produces the deployable `dist/` directory. Tests verify filter behavior, generated case studies, links, metadata, and local assets. Run the build before the tests.

For browser and accessibility tests:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright builds and starts a separate production preview on port 4322 and checks desktop/mobile layouts, navigation, filters, case studies, images, and accessibility. Test screenshots are saved under `test-results/` and are not committed.

## Personalize it

Edit `src/config.ts`: your name, initials, role, introduction, biography, disciplines, and optional email, GitHub, LinkedIn, location, and resume URL. Use full `https://` URLs for social profiles. Put a resume PDF in `public/` and set `resume: '/resume.pdf'`. Empty optional values hide those links rather than create broken placeholders. The home page now uses only the short introduction, not the old promotional tagline sections.

The visual system lives in `src/styles/global.css`. Colors are CSS variables at the top; layouts, fonts, and responsive breakpoints are in the same file. Change the favicon in `public/favicon.svg` if desired. The source Astro components generate the HTML, bundled CSS, and browser JavaScript automatically.

The opener's photo shading is controlled separately in the `<style>` block of `src/pages/index.astro`: `.opening-hero` defines `--hero-overlay-opacity: .55`. Lower values make the dark overlay more transparent and the photo brighter; higher values darken it. This does not change project-tile opacity.

## Add a project

1. Duplicate `docs/project-template.md` into `src/content/projects/your-project-slug.md`. Use unique, lowercase, hyphenated filenames. The filename becomes `/projects/your-project-slug/`; avoid changing it after publishing unless you add a redirect.
2. Photos are optional. Put them in `public/images/` when ready; use reasonably compressed WebP, JPEG, PNG, or AVIF files. A cover image must use a local `/images/` path and include descriptive `imageAlt` text. Without an image, the card remains text-first and the case study has no empty photo frame.
3. Edit the YAML fields at the top and write the case study in Markdown below the closing `---`.
4. Set `draft: false` when ready. Check with `npm run build` and `npm test`, then push to GitHub.

No manual HTML or navigation edits are needed. A new category automatically becomes a filter. Search covers titles, summaries, tags, tools, categories, and years; multiple search words all have to match. Filter selections can be shared through the URL. All projects remain readable without JavaScript.

### Metadata

| Field | Purpose |
| --- | --- |
| `title`, `summary` | Card, case-study header, search, and page metadata |
| `category` | Any discipline name; automatically creates its filter |
| `year` | Optional confirmed year, a number such as `2026`; omit when unknown |
| `status` | Optional `Complete`, `In progress`, `Prototype`, or `Design documented`; shown on the case study |
| `tags` | Technologies used in search and shown on the case study, not piled onto catalog cards |
| `image`, `imageAlt` | Optional local cover photo; alt text is required when an image is supplied |
| `imagePosition` | Optional CSS position, e.g. `35% center` |
| `tileImagePosition` | Optional catalog-only image position; overrides `imagePosition` on the tile without moving the case-study cover |
| `gallery` | Optional additional `{ src, alt, caption }` photos, shown in a responsive gallery |
| `video`, `videoPoster`, `videoCaption` | Optional local MP4/WebM, cover image, and caption; a poster without `video` creates a non-playing placeholder |
| `featured` | Optional ordering priority; all cards keep the same width |
| `order` | Lower values first, after featured projects; year and title break ties |
| `draft` | Excludes a project from cards, routes, and sitemap |
| `demo` | Marks sample content visibly; use `false` for your real work |
| `role`, `duration`, `tools` | Project details in the sidebar |
| `outcomes` | Optional list of `{ value, label }` highlights |
| `links` | Optional list of `{ label, url }` resources using HTTP(S) URLs |

For example:

```yaml
outcomes:
  - value: "0.2 mm"
    label: "Measured repeatability"
links:
  - label: "Source code"
    url: "https://github.com/YOUR-USERNAME/YOUR-PROJECT"
```

Only publish outcomes you can support. Markdown supports headings, lists, code blocks, tables, links, and local images. Level-two headings automatically populate the case-study contents navigation. For local video, embed a standard HTML `<video controls preload="metadata" src="/videos/my-project.mp4"></video>` after adding the file to `public/videos/`. Do not commit very large videos; link to a video host instead.

### Replace the photo placeholders

Every project has its own directory under `public/images/projects/`, named after its Markdown filename. For Heated Gloves, replace:

| File | Placement |
| --- | --- |
| `public/images/projects/heated-gloves/final.png` | Main image: subdued catalog tile background, case-study header, and social preview |
| `public/images/projects/heated-gloves/prototype.png` | Prototype/internal PCB photo between the hardware description and engineering challenges |

JPG/JPEG, PNG, WebP, and AVIF are supported. Keep photos in their actual format and match the extension in the project's frontmatter `image`, Markdown `<img src>`, gallery, and poster paths. Do not merely rename a JPEG to `.png`. Existing PNG placeholders can remain until replaced. Landscape photos around 1600 px wide are a useful starting point; compress large files before committing.

Main photos fit inside wide tile and case-study frames without cropping or stretching. Empty space around square and portrait images matches the site's `--bg` charcoal background. Tile photos sit beneath a gradient that is lighter over the upper image area and darkens behind the text. White pixels already inside an uploaded image are not recolored; only the surrounding frame is styled.

In `src/styles/global.css`, the `:root` variables `--tile-image-opacity: .99` and `--tile-image-hover-opacity: 1` control normal and hover/focus photo opacity. Higher values show more of the photo. `.has-image .project-link::before` controls the dark gradient overlay. `object-fit: contain` and `background: var(--bg)` control image fitting and padding; `.case-image img` applies these settings to case-study covers. These controls do not affect the opener's separate overlay setting.

Update `imageAlt` at the top of the project's Markdown and the prototype `<img>`'s `alt` text in the body when replacing the images. Change captions as needed. If you prefer JPEG/WebP/AVIF, update the frontmatter `image` or the prototype `src` to the new filename instead. No layout changes are needed.

For new entries, copy the project template, replace `your-project-slug` in its paths, and run `node scripts/generate-photo-placeholders.mjs`. The generator uses Astro's Sharp tooling to create only missing PNG placeholders, including configured gallery images and video posters in the project's own image directory. It **never overwrites existing photos**. These are committed assets; generation is not part of the deployment build.

### Render Fusion OBJ models

`scripts/blender_product_render.py` is a standalone Blender 4.2+ batch renderer with matte plastic, a light-gray studio ground/background, three large softbox area lights, and an automatically fitted orthographic three-quarter camera. It produces PNGs and optional editable blend scenes without changing source models or replacing portfolio images. See [Blender product renders](docs/blender-product-renders.md) for Windows commands, camera/material options, and validation instructions. This offline tool is not required to run or deploy the site.

### Cyr wheel photos and video

The Cyr wheel's image directory is `public/images/projects/cyr-wheel/`:

- `final.jpg`: completed wheel, used on the tile and page header.
- `prototype.jpg`: early build stage, in the middle of the case study.
- `fabrication.jpg` and `detail.jpg`: two additional build/detail photos in a responsive gallery.
- `final.jpg` is reused as the video-area poster until a dedicated poster is supplied. The footage from `video-poster.mp4` is copied to `public/videos/cyr-wheel/demo.mp4` and connected through the `video` frontmatter field; the original file remains unchanged.

Gallery descriptions and captions are in `gallery` at the top of `src/content/projects/cyr-wheel.md`. To use three photos rather than four, remove one gallery entry.

When footage is ready, put a reasonably compressed MP4 in `public/videos/cyr-wheel/` and add this frontmatter field:

```yaml
video: "/videos/cyr-wheel/demo.mp4"
```

The video placeholder automatically becomes a native player with controls and mobile inline playback. Until a source is configured, the page does not request a missing video or show non-working playback controls. WebM is also supported. Avoid committing very large videos; use a hosted resource link for longer footage. Add captions/subtitles where needed for accessibility.

`portfolio.about.image` and `portfolio.about.imageAlt` can provide your own about-page photo. Change `portfolio.hero.image` to your own workshop photo for the opener, or set it to an empty string for a text-only opening. `portfolio.hero.focus` controls its supporting line. Other demo photos remain unreferenced and are not used for social previews.

## GitHub and Cloudflare Pages

### Create the GitHub repository

Create an empty repository in GitHub without a generated README, then run these commands in the project directory, replacing the remote URL:

```sh
git init
git add .
git commit -m "Add engineering portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If the directory is already a Git repository, skip `git init` and keep your existing remote/branch setup. Authenticate directly in GitHub or your terminal; never put credentials or tokens in repository files. `node_modules/`, `dist/`, temporary files, and `.env` files are ignored; commit the lockfile.

The included GitHub Actions workflow runs the typecheck, build, and tests on pushes and pull requests. Cloudflare deploys directly from GitHub; no Cloudflare API token is needed for this workflow. Cloudflare's deployment and GitHub CI are independent: use branch protection with the **Build and test** check if you want tests to gate merges to `main`.

### Connect Cloudflare Pages

1. Open Cloudflare **Workers & Pages > Create application > Pages > Import an existing Git repository**. Choose Git integration, not Direct Upload or a Workers project.
2. Authorize GitHub and choose your repository.
3. Use the settings below, then select **Save and Deploy**.

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave blank for this repository layout |
| Environment variable `NODE_VERSION` | `22.22.0` |
| Environment variable `SITE_URL` | `https://your-domain.com` |

Set `SITE_URL` to your real canonical domain with `https://` and no path. It controls canonical links, social-image URLs, sitemap, and robots metadata. The fallback `https://example.com` is only a development placeholder. If you do not attach your domain immediately, use the production `https://YOUR-PROJECT.pages.dev` URL and update it later. After changing environment variables, trigger a new deployment.

Every push to `main` now rebuilds production automatically. Other branches and pull requests can receive preview URLs. No `wrangler.toml`, SSR adapter, Pages Function, or separate build server is needed.

### Attach your existing domain

In the Pages project, open **Custom domains > Set up a domain** and enter the domain first.

- For an apex domain (`your-domain.com`), add the domain as a zone in the same Cloudflare account and change its nameservers at your registrar to the values Cloudflare provides. You can keep the domain registered where it is. Review existing DNS records first, especially email MX/TXT records.
- For a subdomain (`portfolio.your-domain.com` or `www.your-domain.com`), you can keep an external DNS provider. After associating the subdomain in Pages, add a CNAME for that name pointing to `YOUR-PROJECT.pages.dev`.
- If DNS is already managed by Cloudflare, it can add the required record automatically. Wait for the domain and TLS certificate to become active.

Do not only add a CNAME without first associating the domain in Pages; Cloudflare warns this can produce a 522 error. Choose one canonical domain, set `SITE_URL` to it, and use Cloudflare redirect rules for alternate hostnames if needed. Do not remove DNS records used by email or other services.

Official guides: [Astro on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/), [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Before publishing

- Replace the placeholder name and add your contact details.
- Review the design-based project drafts, confirm your role and actual results, and add dates/status only where known.
- Add your own project photos when available; photo-free entries are fully supported.
- Set `SITE_URL` to your actual domain in Cloudflare.
- Run the build, unit/static tests, and browser tests.
- Check the preview deployment on a phone and confirm your email and project resource links.

Image and font sources are documented in `docs/assets.md`. This project is not connected to your GitHub or Cloudflare account yet; account authorization and DNS changes must be done by you.