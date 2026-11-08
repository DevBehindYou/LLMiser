# M01 visual ledger

Spec: `visuals.mjs` (kit.mjs + visuals/campaign-parts.mjs). Rendered privately to `visuals/` with `scripts/campaign/render-private.mjs` (inspectSvg: no problems). Not written to frontend/public.

| File | Kind | Alt text (as in draft) | Caption | Data source | Review |
| --- | --- | --- | --- | --- | --- |
| banner.svg | Banner 1200x400 | Banner reading Share the code, not the .env. A file tree with .env, a log and a backup crossed out, source, tests and manifests kept and packed into a sharing copy. | n/a | Illustration of the article task, Prompt L mark from kit | Rendered dark/light 375px: hook and art legible, no clipping |
| seven-removals.svg | Card grid (checklist overview) | Seven numbered cards ... plus a card listing what to keep. | The seven removals, each with the file that represented it ... Illustration. | fixtures/inventory.json categories | PASS geometry, inspected both themes |
| keep-or-remove.svg | Decision | A decision diagram ... keep it, then scan it ... | Keeping a file isn't the end of the review ... Illustration. | Article guidance | First render wrapped "it?" onto its own line; question shortened to "Task works without it?", re-inspected |
| fixture-comparison.svg | Source-to-output comparison | Two columns. Original folder ... Reviewed copy: 13 files with no fake values. | Local run of LLMiser's archive code on a synthetic project, 8 November 2026 ... | fixtures/out-original/PROJECT_INDEX.md and combined.md, out-sharing | Every listed path and count matches the run outputs (see qa.md). Warning items use a triangle shape and bold weight, not color alone |
| final-check.svg | Checklist with limitation | Checklist: run the tests ... Rotate any secret that leaked. | A final pass before you send the copy anywhere. Illustration. | Article guidance | First render orphaned "it." in the note; note shortened, re-inspected |

## Rendered inspection

- Tool: `scripts/campaign/preview.mjs` (Playwright Chromium, two 375px columns, dark and light tokens from globals.css, bundled fonts loaded: LLMiser Inter, JetBrains Mono, Patrick Hand).
- Screenshot: `visuals/preview/contact-375.jpg` (device scale 2). Geometry report: `visuals/preview/geometry.json`, 0 issues on all five SVGs after fixes.
- Smallest text at 375px: about 6.3 CSS px (the kit's 11-unit signature line), same as the published articles. Body labels render at 7.7 to 9 px. This matches the existing house standard but is small on phones. Recorded as a campaign-wide observation, not an M01-only defect.
- Desktop width was not separately screenshotted. Figures are 600-unit SVGs scaled to the column, so desktop renders at or near native size.
