# LLMiser — start here

Updated 20 October 2026. This is the entry point for another AI agent or developer.

**Current state:** the app rebrand, SEO/GEO implementation and blog rebrand (8 articles, 8 banners, 40 figures) are complete and verified locally. Production deployment and domain activation are still pending.

## Read in this order

1. [Agent handover](ai-handover/HANDOVER.md): user decisions, completed changes, file map, constraints and commands.
2. [Progress and remaining work](ai-handover/PROGRESS.md): all eight articles and 48 SVG assets, phase status and remaining work.
3. [Blog rebrand report](ai-handover/BLOG_REBRAND_REPORT.md): what changed in the articles and visuals, claim decisions, sources and tests. The original [blog agent prompt](ai-handover/BLOG_REBRAND_PROMPT.md) is kept for reference; its task is done.
4. [App implementation](LLMISER_REBRAND.md), [validation evidence](LLMISER_VALIDATION.md), and [deployment runbook](LLMISER_MIGRATION.md).
5. [Environment and services](LLMISER_ENVIRONMENT.md): env files on this machine, frontend variables for the new hosting project, why the backends need no changes, and the cron tick target.

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
| Deployment, credentials, DNS, TLS and real old-host redirects | **Pending** |
| Live conversion/storage checks and search monitoring | **Pending** |

No commit, push, deployment, DNS change, Search Console submission or real hosting redirect activation was performed in the app-rebrand session. The copied app files are currently mostly untracked in Git, on top of LLMiser's original license-only commit. Inspect `git status` before working; do not assume untracked files are disposable.

## Documentation precedence

These handover documents and `LLMISER_*.md` describe this migration. Other architecture, release and testing documents were copied from MDify and contain historical domains, infrastructure observations and results. Use them for technical context, not as evidence that LLMiser has been deployed or as a reason to rerun production setup automatically.
