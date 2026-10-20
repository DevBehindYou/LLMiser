# LLMiser agent handover

Updated 20 October 2026. Start with [../START_HERE.md](../START_HERE.md).

## What we are doing and why

The user requested a full app rebrand from MDify to **LLMiser**, presented as an **LLM cost optimizer**, with the **11 — Prompt L** icon. All implementation work belongs in `C:/Users/temp/Documents/GitHub/LLMiser`. The intended new host is `https://llmiser.devbehindyou.com`, with public MDify URLs redirected to equivalent new paths after deployment.

The app optimizes document preparation: conversion to editable Markdown, Clean/Compact profiles, relevant-context selection and output review. It does not implement a model proxy, API billing integration, model routing, prompt caching or a browser extension. Blog education may discuss these broader techniques, but must distinguish them from LLMiser capabilities.

The first agent was explicitly told to leave blog content to the user's Claude workflow. That boundary was respected. The latest request is to document the work and prepare a prompt for another AI agent to rebrand the blogs, figures and banners. This documentation update does not itself rewrite those files or dispatch another agent.

## Sources and repository boundaries

- App baseline: all 354 tracked files from public MDify at `ce56f5c`, with LLMiser's existing LICENSE retained. The public app had newer conversion fixes and real article routes than the MDify-Pro app snapshot.
- LLMiser's Git HEAD is `78161e6 Initial commit` at handover time. `ce56f5c` identifies the copy source, not a commit already in LLMiser history. Most copied/rebranded files are untracked. Preserve them and inspect status before any Git operation.
- MDify and MDify-Pro source files were not edited. MDify remained clean; MDify-Pro already had local handover/brand changes when this work began.
- Brand reference: `project-docs/brand/llmiser/`, copied from the supplied MDify-Pro kit. The retained `make-icons.mjs` also contains unrelated icon-generation work; inspect it before running it.
- Research: `project-docs/rebranding-research/LLMiser_Rebranding_Research/`, plus the companion DOCX in its parent. Original archive: `C:/Users/temp/Downloads/LLMiser_Rebranding_Research_Package.zip`.
- The private `MDify-Blog-Generation-Pipeline` directory is **not present in LLMiser**. Some inherited comments/README files still refer to it. Use the local parser, builder and existing posts as the actual content contract. Do not sync from or edit the source repositories to recover it.

## What is complete

1. Copied the Next.js app, N/O/Z conversion services, database migrations, CI, tests and deployment configuration. Only example environment files were copied; credentials, caches and local deployment identity were excluded.
2. Rebranded app chrome, mobile navigation, API examples, consent/legal brand names, backend user-facing strings, GitHub links and exported ZIP filenames. Header/footer components are now `LLMiserHeader.js` and `LLMiserFooter.js`.
3. Installed the exact Prompt L dark/light SVGs, PNG sizes, maskable icons, ICO, manifest and theme-aware favicons. Old icon URLs serve the selected new icon for compatibility.
4. Rebuilt `frontend/public/og-card.png`, the shared 1200 × 630 social card, with the new descriptor and icon.
5. Centralized messaging and SEO constants. Updated titles, social metadata, sitemap, crawler rules, JSON-LD and `llms.txt`. Article canonicals, publisher and breadcrumb branding already use LLMiser while article content is unchanged.
6. Replaced the app's blanket 70% savings promise with conditional claims and measurement instructions. Existing blog claims remain for the content agent to review.
7. Moved static use-case copy into server components and added server-rendered homepage explanations/FAQs. Kept the converter interactive and overlays lazy-loaded. Removed visible prototype layout labels.
8. Added 308 host redirects for known public paths, preserving paths and queries, plus the old admin-route alias. Added API/admin noindex headers. Updated the checked-in scheduler target without applying it live.
9. Verified the final local build and UI. Production setup remains pending.

## Where to work

Paths below are relative to the LLMiser repository root.

| Area | Files / directories | Role |
| --- | --- | --- |
| Brand and messaging | `frontend/lib/siteContent.js` | Domain, name, positioning, tagline, limits, FAQ and site JSON-LD |
| Global metadata / theme | `frontend/app/layout.js`, `frontend/app/globals.css` | Icons, title template, social card and theme tokens |
| Homepage | `frontend/app/page.js`, `frontend/app/ConverterClient.js` | Server copy and interactive converter shell |
| Conversion UI | `frontend/components/converter/`, `frontend/viewmodels/` | Upload, queue, profiles, preview, copy/download |
| App chrome | `frontend/components/LLMiserHeader.js`, `LLMiserFooter.js`, `AppIcon.js` | Shared rebranded interface |
| Cost explanation | `frontend/app/usecase/page.js`, `UseCaseClient.js` | Server copy and client navigation/modals |
| Blog sources | `frontend/content/blog/*.md` | **Next agent's primary editing target** |
| Blog SVG assets | `frontend/public/blog/<slug>/*.svg` | **Eight banners and forty figures to rebrand** |
| Blog parser / builder | `frontend/lib/blog.mjs`, `frontend/scripts/build-blog-index.mjs` | Frontmatter and SVG validation; index generation |
| Generated posts | `frontend/lib/blogPosts.generated.json` | Regenerate from Markdown; never hand-edit |
| Blog renderers | `frontend/components/BlogModal.js`, `BlogVisual.js`, `frontend/app/blog/` | Dialog, listing and dedicated articles |
| Article SEO | `frontend/lib/articleSeo.mjs` | Canonical, metadata, BlogPosting and breadcrumbs |
| Discovery | `frontend/app/sitemap.js`, `robots.js`, `frontend/public/llms.txt` | Public discovery; update blog summaries if titles/descriptions change |
| Redirects / private headers | `frontend/next.config.js` | Effective only on hosts routed to this deployment |
| App brand assets | `frontend/public/llmiser-*.svg`, PNGs, `site.webmanifest`, `project-docs/brand/llmiser/` | Already selected; reuse rather than redesign |
| Social generator | `frontend/scripts/build-brand-images.mjs` | `npm run brand:images` rebuilds the shared raster card, not blog assets |
| Services | `backendN/`, `backendO/`, `backendZ/` | Document/PDF, OCR and ZIP/archive roles |
| Data / scheduling | `supabase/`, especially `cron.sql` | Schema, queue, cleanup and updated target template |
| CI / tests | `.github/workflows/checks.yml`, `frontend/test/`, `tests/` | Regression and integration checks |

## Compatibility constraints

Do not globally replace lowercase `mdify` infrastructure strings. `mdify-pro-files`, `x-mdify-admin`, `x-mdify-cron-secret`, `MDIFY_CRON_SECRET`, the admin cookie/signing namespace, Vault/schedule names, SQL identifiers/migration filenames and RPCs intentionally remain compatible. Their presence is not unfinished blog work. Historical references and deliberate migration aliases are also valid.

The admin route is `/llmiser-controller`; `/mdify-controller` is a permanent compatibility alias. Authorization remains necessary independently of robots/noindex.

## Evidence and limits

The app phase passed build and lint. The 221 frontend cases passed across the original run and focused reruns: 218 initially, two Git-fixture permission failures rerun outside the sandbox, and one copy assertion corrected to avoid treating a CSS percentage as marketing. Eight focused SEO/migration cases passed. Local HTTP smoke tests passed 88 checks across 13 public pages. Desktop/mobile, both themes, matching favicons and browser errors were checked.

All 58 protected blog-related files were byte-identical after app rebranding: eight posts, their README, one generated index and 48 SVGs. `docs/blog-preservation.json` records **pre-blog-rebrand** hashes. Preserve this historical snapshot. Intentional next-phase edits will differ; it is not a permanent no-edit rule or evidence validating later edits.

Python backend suites and external database/edge integration checks were not rerun for branding-only backend strings. No production deployment, credentials migration, DNS/TLS setup, scheduler activation, live conversion/storage verification or search-indexing confirmation occurred. Local previews are temporary; restart them rather than assuming a server is still running.

See [../LLMISER_VALIDATION.md](../LLMISER_VALIDATION.md) for exact evidence and screenshots. Do not report those results as proof of new blog edits.

## Commands

Use Node.js 22. From `frontend`:

```sh
npm ci
npm run blog:index
npm run blog:check
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/blog.test.mjs test/domainMigration.test.mjs test/seo.test.mjs
npm test
npm run lint
npm run sql:check
npm run build
npm start -- -p 3101
node scripts/check-rebrand.mjs http://localhost:3101
```

Regenerate the index after Markdown/asset edits, then check it. Build-time fonts need network access. In the Codex Windows sandbox, temporary Git fixture tests and localhost requests may need host-level execution; prior permission failures were environmental. Keep SVG validation enabled.

## Blog rebrand — 20 October 2026

All eight articles, eight banners and forty figures were rebranded for LLMiser, with every price, token and research claim re-checked against primary sources. The visuals were regenerated from their specs, now kept in the local, Git-excluded `blog-pipeline/` folder (copied from MDify-Pro's private pipeline, which itself was not changed). Article pages now show the banner and render bold TL;DR keywords and caption links. Details, decisions, sources and test results: [BLOG_REBRAND_REPORT.md](BLOG_REBRAND_REPORT.md). The original pipeline note in "Sources and repository boundaries" above is superseded for the blog.

## Next work and ownership

Blog work is done (see above). For future articles or price updates, follow `blog-pipeline/README.md`, rebuild visuals from the specs and keep [PROGRESS.md](PROGRESS.md) and the report current. Preserve slugs, original publish dates, topic identity and truthful capability boundaries. Verify technical/numeric claims with current primary sources.

Deployment remains a separate phase in [../LLMISER_MIGRATION.md](../LLMISER_MIGRATION.md). Checked-in rules alone cannot redirect a domain still attached to the old project. No overall completion percentage is claimed: local app work is complete, content and launch remain open.
