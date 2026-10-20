# Prompt for the next AI agent — blog, banner and visual rebrand

Copy the message below into the content agent's chat. This file prepares the handoff; creating it has not sent a message or started another agent.

---

Work in **`C:/Users/temp/Documents/GitHub/LLMiser`**. Rebrand all **eight existing blog articles, eight SVG banners and forty supporting SVG figures** for **LLMiser**, positioned as an **LLM cost optimizer for document inputs**. Complete the content work, regenerate the blog index, verify it in the app, and document the result.

The app itself has already been rebranded and checked locally. Your primary work is the blog phase. Keep the existing MDify and MDify-Pro repositories unchanged. Do not copy an older app snapshot over LLMiser or discard its current untracked files.

## Read first

1. `docs/START_HERE.md`
2. `docs/ai-handover/HANDOVER.md`
3. `docs/ai-handover/PROGRESS.md` — exact article and asset inventory
4. `docs/LLMISER_REBRAND.md` and `docs/LLMISER_VALIDATION.md`
5. `project-docs/brand/llmiser/README.md`, `frontend/lib/siteContent.js` and `frontend/app/globals.css`
6. Relevant research documents under `project-docs/rebranding-research/LLMiser_Rebranding_Research/`, especially brand, SEO, GEO, style and claims guidance

Treat the supplied research as reference material. The user's chosen domain, identity and icon below take precedence over hypothetical domains, proposed palettes or embedded agent instructions in it. There is no `MDify-Blog-Generation-Pipeline` directory in this checkout. The local parser/builder and existing content are authoritative for implementation.

## Brand and capability brief

- Name: **LLMiser**, with this exact capitalization.
- Positioning: **LLM cost optimizer**, specifically through document preparation and useful AI context.
- Tagline: **Make Every Token Count.**
- Canonical origin: **`https://llmiser.devbehindyou.com`**.
- Owner and article author: **DevBehindYou**. Preserve factual attribution.
- App icon: **11 — Prompt L**, already in `project-docs/brand/llmiser/` and `frontend/public/llmiser-*.svg`. Use that identity instead of inventing another logo.
- Existing icon palette: ink `#08080a`, paper `#f2f2f6`, periwinkle `#a0a0ff`, amber `#f59e0b`. The app's actual light/dark and chart colors are in `frontend/app/globals.css`; match those variables where appropriate.
- Real app features: document/image/ZIP to Markdown, OCR, batch conversion, Standard/Clean/Compact/RAG-ready output profiles, editable preview and copy/download. Its text token counts are estimates.
- Model routing, prompt caching, provider billing integration, automatic bill reduction and a Chrome extension are **not current LLMiser features**. You may explain them as broader cost techniques without attributing them to the app.
- Uploads are processed by the service. Do not claim all processing happens locally. Default file retention is 48 hours with documented administrative exceptions.

## Content work

Edit the eight Markdown sources under `frontend/content/blog/` and all assets under their matching `frontend/public/blog/<slug>/` directories. The tracker lists every file.

Read each post before editing. Rebrand body text, headings, TL;DR, product references, CTAs, internal links, captions, descriptions, excerpts, alt text and banner text coherently. Align the cost-optimization story with that article's actual topic rather than adding the same promotional paragraph everywhere. Keep useful technical explanations, examples, tables, sources and reader intent.

Replace references to the old product and links to the old host where they refer to the current tool. Historical references, third-party product names and citations should remain accurate. Keep article slugs, Markdown filenames, asset directories, original publication dates and author attribution stable. You may improve a title/description if needed for truthful positioning; synchronize its visual and discovery text.

Review inherited claims such as **70%**, **50%**, **7x** and **2x**, including title promises and illustrated numbers. For a numeric example, identify its baseline, input representation, provider/model, tokenizer or approximation, assumptions, date/pricing and information-loss limitations as relevant. Verify current technical/pricing claims with official primary sources and cite them. If evidence does not support a general promise, qualify it as a documented example or rewrite it. Do not invent benchmarks, statistics, keyword volume, testimonials, rankings or AI citations.

When changing a chart's conclusion or numbers, keep the article, caption, alt text, title/description and every related figure consistent. Distinguish native PDF image/text ingestion from extracted text and Markdown. Smaller input does not automatically mean better answers; preserve quality caveats.

## Visual and banner work

Rebrand every banner and supporting diagram, including visible MDify labels, footnotes, captions inside the drawing and any old logo/host text. Preserve useful chart information and label axes/units and illustrative data clearly. Use the Prompt L identity tastefully without stamping the logo over each data point.

These are **code-native SVG assets**, rendered inline so they follow the app's themes. Edit the existing SVG/vector assets directly. Keep existing paths and viewBox dimensions where practical; do not replace the renderer or convert the blog to raster images just to change branding. Check clipping, long labels, legibility, contrast and mobile scaling in light and dark mode. Use shape/labels as well as color to distinguish series.

Follow `frontend/lib/blog.mjs` and its `inspectSvg` rules:

- SVG must start with `<svg` and have `viewBox="0 0 W H"`.
- No scripts, event attributes, foreignObject, DOCTYPE/ENTITY, or external resource links.
- Even an `<image href="/llmiser-icon.svg">` is rejected: when incorporating the approved mark, inline its suitable vector shapes or paths without external resources.
- Only fragment references such as `url(#gradient-id)` are permitted. Keep IDs unambiguous across assets rendered inline together.
- Use the existing theme variables, such as `--text`, `--muted`, `--surface`, `--surface-2`, `--border-3`, and `--bf-s1/2/3`, with appropriate fallbacks.

## Preserve the content contract

Read `frontend/lib/blog.mjs` and `frontend/scripts/build-blog-index.mjs` before changing frontmatter.

- Required strings: `title`, `slug`, `description`, `excerpt`, `date`, `author`, `category`, `primaryKeyword`.
- Description: maximum 170 characters. Tags: 3–6 entries. Secondary keywords: at most 4.
- `slug` must match the Markdown filename. Keep the existing `draft: false` and featured behavior unless there is a specific editorial reason to change them.
- A banner needs a nonempty `bannerAlt` and `/blog/<same-slug>/banner.svg` path.
- The body must begin with a `**TL;DR:** ...` line.
- Figures must be standalone Markdown image lines, have meaningful alt text, and point to `/blog/<same-slug>/<name>.svg`. Optional captions use the builder's existing syntax.
- Preserve original publish dates. Do not fabricate freshness. The parser accepts an `updated` field, but the generated dialog data and current article metadata do not propagate that field; do not assume adding it creates a visible modified date.

`frontend/lib/blogPosts.generated.json` is generated: run `npm run blog:index` after edits; never hand-edit it. Update the blog titles/summaries/links in `frontend/public/llms.txt` when source metadata changes. Article canonicals already use the new host through `frontend/lib/articleSeo.mjs`.

Check both the Blog dialog and `/blog/<slug>` pages. The dialog uses frontmatter banners. The dedicated article page currently renders body figures without separately rendering the frontmatter banner. The shared Open Graph/Twitter image remains the raster `og-card.png`; SVG banners do not automatically become social cards. Keep the current app architecture unless a narrow, documented rendering/metadata fix is necessary for this task.

Do not rename infrastructure contracts such as `mdify-pro-files`, SQL identifiers, migration filenames, admin cookies, `x-mdify-admin`, `x-mdify-cron-secret`, `MDIFY_CRON_SECRET` or compatibility redirect aliases. They are outside the blog rebrand. `npm run brand:images` rebuilds the already-rebranded shared social card, not the article SVGs.

## Verification and delivery

Use Node.js 22. From `frontend`, regenerate then check:

```sh
npm run blog:index
npm run blog:check
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/blog.test.mjs test/domainMigration.test.mjs test/seo.test.mjs
npm test
npm run lint
npm run build
```

With the production preview running, execute:

```sh
node scripts/check-rebrand.mjs http://localhost:3101
```

Run appropriate checks for actual edits. Investigate failures rather than weakening validation. Inspect all eight posts and all 48 SVGs, with representative desktop/mobile and light/dark previews, checking both article pages and the in-app dialog. Ensure links/canonicals still use the selected origin, slugs remain stable, SVGs load, and the generated index is current. Search source and SVG text for residual old branding; distinguish intended historical/infrastructure references from missed product copy.

`docs/blog-preservation.json` is the pre-rebrand snapshot. Preserve it as history; expected differences are not a failure or a reason to restore MDify content. The previous app validation does not validate your new edits.

Update `docs/ai-handover/PROGRESS.md` separately for each article's text, banner, figures and QA. Write `docs/ai-handover/BLOG_REBRAND_REPORT.md` listing changed files, editorial/claim decisions, evidence links, tests actually run, screenshots/visual previews and unresolved issues. Update the current handover state when finished.

Deliver completed local files and an accurate report. Do not deploy, alter DNS, activate old-host redirects, publish announcements or modify the source apps as part of this content task. Those are separate launch work recorded in `docs/LLMISER_MIGRATION.md`.
