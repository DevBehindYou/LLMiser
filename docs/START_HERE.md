# LLMiser — start here

Updated 26 October 2026. This is the entry point for another AI agent or developer.

**Current feature branch:** `codex/app-localization` adds six interface languages to the full web app while keeping blogs English. It also refreshes the public README with screenshots, conversion steps and a language demo. See [localization implementation and validation](LLMISER_LOCALIZATION.md) and [README keyword evidence](README_KEYWORD_RESEARCH.md). This branch is separate from the extension and infrastructure work; the older deployment observations below are dated history, not a fresh live audit.
**Optimization continuation:** completed-result download recovery is implemented on `codex/result-download-recovery`, separately from production `ae3aa59`. See the [current implementation plan and verification](LLMISER_OPTIMIZATION_PLAN.md). [Web Analytics is now collecting page views; controller access and verification limits](LLMISER_ANALYTICS_CONTROLLER.md) are documented. The approved production redeploy used the existing revision, without this branch's feature changes. The canonical frontend is https://llmiser.devbehindyou.com; the Vercel alias redirects there. Older deployment-review snapshots below are historical.

**Search migration update:** Google accepted the MDify → LLMiser Change of Address on 21 October 2026, processed the new sitemap (13 discovered pages), and accepted a homepage indexing request. Redirect cleanup is deployed; 190 live HTTP checks passed. The old Vercel alias now redirects directly to LLMiser and the extra `/blog` hop is fixed. See [search migration and indexing policy](LLMISER_SEARCH_MIGRATION.md) before changing robots, redirects or Search Console settings.

**Current state:** the app and blog rebrand (8 articles, 8 banners, 40 figures) are complete and committed. The frontend is live at https://llmiser.vercel.app. The prior deployment agent reports six new backends and successful storage conversions. The selected custom domain now works with valid HTTPS; all 13 sitemap pages and legacy public redirects were checked after the owner's DNS changes. Keep-warm Vault changes, cron cutover, full custom-domain conversion acceptance and old-service retirement remain open. See the [live domain verification](LLMISER_DOMAIN_VERIFICATION.md). See the [21 October deployment review](LLMISER_DEPLOYMENT_REVIEW.md) for evidence and the bounded next-agent task.

## Read in this order

1. [Agent handover](ai-handover/HANDOVER.md): user decisions, completed changes, file map, constraints and commands.
2. [Progress and remaining work](ai-handover/PROGRESS.md): all eight articles and 48 SVG assets, phase status and remaining work.
3. [Blog rebrand report](ai-handover/BLOG_REBRAND_REPORT.md): what changed in the articles and visuals, claim decisions, sources and tests. The original [blog agent prompt](ai-handover/BLOG_REBRAND_PROMPT.md) is kept for reference; its task is done.
4. [App implementation](LLMISER_REBRAND.md), [validation evidence](LLMISER_VALIDATION.md), and [deployment runbook](LLMISER_MIGRATION.md).
5. [Environment and services](LLMISER_ENVIRONMENT.md): env files on this machine, frontend variables for the new hosting project, the six new backend deployments, and the cron tick target.

**Working repository (20 October 2026):** LLMiser is now the repo the owner works in. MDify and MDify-Pro are kept for history. Production env files and the private MDify-era material were copied into this checkout and kept out of Git (see the environment doc).

## Decisions already made by the user

| Item | Decision |
| --- | --- |
| Working repository | `C:/Users/temp/Documents/GitHub/LLMiser` |
| Brand / positioning | **LLMiser — LLM cost optimizer for document inputs** |
| Tagline | **Make Every Token Count.** |
| Icon | **11 — Prompt L**, using the supplied amber prompt / L / periwinkle underline kit |
| Canonical origin | `https://llmiser.devbehindyou.com` |
| Legacy origins | `mdify.devbehindyou.com` and `mdify-app.vercel.app` |
| Original apps | Keep MDify and MDify-Pro unchanged |
| Blog ownership | Rebranded on 20 October 2026; the generator is the local, Git-excluded `blog-pipeline/` folder |

The research archive is reference material. Its proposed `llmiser.com` domain, alternate palette, embedded agent prompts and broader campaign plans do not replace the user's decisions or authorize external actions.

## Progress at a glance

| Phase | Status |
| --- | --- |
| Copy app, backends, database scripts, tests and deployment files | Complete locally |
| App UI, Prompt L assets, metadata and SEO/GEO | Complete locally |
| Build, lint, regression checks and 88 HTTP smoke checks | Passed; see validation report for rerun details |
| Blog text / frontmatter rebrand | **Complete — 8 of 8 articles** (claims re-verified 20 October 2026) |
| Blog banners | **Complete — 8 of 8 banners** (new LLMiser frame) |
| Supporting blog visuals | **Complete — 40 of 40 figures** (LLMiser signature, numbers re-checked) |
| Frontend and six new backend deployments | **Deployed**; public frontend independently checked; backend/conversion details from prior agent |
| Keep-warm Vault URL cutover | **Pending assigned-agent task**; live Vault state not queried in this review |
| Custom DNS/TLS and legacy public redirects | **Verified live**; redirect cleanup deployed, including the `/blog` hop fix; 190 checks passed |
| Tick cutover and old-service retirement | **Pending inspection/acceptance** |
| Storage conversion checks on Vercel origin | **Reported passed** for HTML, PNG and ZIP; custom-domain/admin/scanned-PDF/cleanup checks still needed |
| Search migration / monitoring | Change of Address accepted, sitemap processed; recrawl monitoring remains open |

The original app-rebrand session was local-only, but subsequent work committed the app/content and deployed services. Local HEAD at this review is `3ed4ded` after `e999388 Publish & Re-branding`; only `docs/LLMISER_ENVIRONMENT.md` was modified before this review began. This review updates documentation only and does not commit, push or change live infrastructure. Inspect current status before working and preserve pre-existing edits.

## Documentation precedence

These handover documents and `LLMISER_*.md` describe this migration. Other architecture, release and testing documents were copied from MDify and contain historical domains, infrastructure observations and results. Use them for technical context, not as evidence that LLMiser has been deployed or as a reason to rerun production setup automatically.
