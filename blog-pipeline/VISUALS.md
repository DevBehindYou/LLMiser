# Brand, banners and supporting visuals

Read `visuals/kit.mjs` and a current `Blogs/{slug}/visuals.mjs` before drawing. Preserve the approved Prompt L identity. Do not regenerate icons with the private brand helper: its historical workflow also targets another project.

## Current visual sources

- Brand kit: `../project-docs/brand/llmiser/svg/` and `png/`.
- Runtime colors: `../frontend/app/globals.css`.
- Font variables: `../frontend/app/fonts.css`. Inter body, Patrick Hand editorial hooks, JetBrains Mono labels/code.
- Existing banner/figure implementation: `visuals/kit.mjs`.
- Public reference artwork: `../frontend/public/blog/`.

Dark background #08080a, text #f2f2f6, amber #f59e0b. Light background #f0eee9, dark text #18181b. Prompt L uses periwinkle #a0a0ff. Runtime values and kit win over old screenshot colors.

Figures use kit semantic series: amber for retained content, violet for extra context, pink for waste. Use text labels and shapes as well as color. Keep text in readable ink colors. Never choose a bar length from an invented savings number.

## Deliverables per article

- One 1200 × 400 SVG banner via `banner()`: short specific hook, Prompt L identity, illustration of the actual task. The current kit uses a fixed ink ground and paper illustration card.
- At least four useful figures, usually 600 units wide via `figure()`: process, source/output comparison, decision and checklist are suitable without invented statistics.
- Descriptive alt text and captions; label diagrams as illustrative and cite actual data.
- A visual source ledger: claim, supporting sample/source, exact figure, review status.
- Inspect light/dark rendering and 375px width. Check text wrapping, source labels, truncation and readability. No assumed validation from file existence.

Build only the assigned slug:
```powershell
node blog-pipeline/visuals/build.mjs reserved-slug
```

The builder executes local JS specs and removes old SVGs absent from that slug's spec. Review the spec and output folder first. Do not run `--all` or overwrite existing articles during a new support task.

## Social variants

Suggested working canvases: 1200×630 link card, 1080×1350 carousel, 1000×1500 pin. These are production starting sizes, not verified current platform limits. Check the destination before export. Export resolved fonts/colors to PNG/JPEG for platforms that do not support SVG/CSS variables. Record exports in `Posts/{slug}/visuals/`. Never imply these exports replace the app's shared OG card.

Retain one clear idea and one descriptive label per panel. Put full explanation and accessible text in the post too. Use real sanitized screenshots when demonstrating behavior; label mockups/illustrations. Do not crop away errors to imply success. No fabricated analytics, testimonials or model savings.
