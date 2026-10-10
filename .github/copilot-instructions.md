- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements: Static engineering portfolio, Markdown projects, Cloudflare Pages with GitHub integration.
- [x] Scaffold the Project: Astro, strict TypeScript, static output, project content collection.
- [x] Customize the Project: Responsive catalog, filters, Markdown case studies, about/contact, local assets.
- [x] Install Required Extensions: Skipped; no extensions are required.
- [x] Compile the Project: Strict typecheck and static build pass.
- [x] Create and Run Task: Portfolio: Dev server task with Windows portable Node fallback.
- [x] Launch the Project: http://127.0.0.1:4321/; desktop/mobile screenshots and browser tests verified.
- [x] Ensure Documentation is Complete: README, project template, asset sources, GitHub CI, and deployment instructions.

Use Astro static output and Markdown content collections. Keep personal details in src/config.ts and projects in src/content/projects. Do not introduce server dependencies or store credentials in the repository. Run npm run build and npm test before completing changes. Keep public assets local and maintain accessible, responsive layouts.

The current design has a full-width photographic opener above a charcoal catalog with main photos as subdued tile backgrounds and category filters. The opener background is illustrative, configured in src/config.ts under hero; do not present it as a photo of the owner's work. Projects have final/prototype PNG placeholders; replace assets rather than generating over real photos. Optional gallery/video fields support extra media (Cyr wheel has four photos and a poster-only video slot). Project photos, years, and status remain optional; never invent unknown metadata. The original 14 drafts are based on read-only E:\Designs evidence; Business Cards uses E:\Deadbug\BusinessCards\BusinessCards, and Cyr Wheel is an owner-confirmed build/media draft. Provenance and open questions are in docs/project-sources.md. Do not copy source credentials, keys, or private firmware into the portfolio. Treat engineering considerations as unconfirmed until the owner provides actual decisions/results.