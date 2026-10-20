# LLMiser rebrand implementation

## Scope and source

- User-selected identity: LLMiser, positioned as an LLM cost optimizer for document inputs.
- User-selected origin: `https://llmiser.devbehindyou.com`.
- User-selected asset: 11 — Prompt L from MDify-Pro's brand folder. Dark/light SVGs, raster sizes, maskable icons, ICO and manifest are included.
- Baseline: all 354 tracked files from public MDify commit `ce56f5c`, except the destination's pre-existing LICENSE was retained. This includes newer conversion fixes and article routes absent from the private app snapshot.
- No source files in MDify or MDify-Pro were edited. No environment secrets, generated build folders, local agent configuration or deployment identity were copied.
- The supplied archive and icon kit are retained under `project-docs`. Their suggested domains, agent instructions and campaign tasks are reference material. The user's current scope takes precedence.

## App and search changes

- Rebranded desktop/mobile chrome, admin interface, consent text, legal brand mentions, download filenames, API examples, backend titles and GitHub links.
- Renamed header/footer components and admin route. Local browser preferences use LLMiser keys. Existing server cookies, signing namespaces, API headers, storage bucket defaults and SQL identifiers remain compatible.
- Installed the exact Prompt L icon kit. Legacy icon URLs serve the new icon for older external references.
- Rebuilt the 1200 × 630 social image with no fixed savings claim. Explicit `sharp` development dependency makes image generation reproducible.
- Centralized brand metadata and cost positioning. Replaced blanket 70% claims in app copy with conditional explanations, model-specific measurement steps and clearly identified estimates.
- Moved static use-case content out of the client bundle into server components. Homepage explanatory content and FAQ are also server-rendered, while the converter remains interactive and lazy-loads overlays.
- Updated sitemap/canonicals, Open Graph/Twitter cards, JSON-LD, crawler rules, `llms.txt`, install manifest and noindex response headers for API/admin paths.
- Updated the scheduler template to use the new frontend origin while retaining existing schedule names and authentication contracts.
- Permanent host-specific redirects preserve known public routes and query strings. Deployment and activation steps are in `LLMISER_MIGRATION.md`.

## Blog preservation

Article Markdown, frontmatter, titles, descriptions, published dates, generated article data and illustrations are copied unchanged from the baseline. Only shared surrounding app branding and SEO canonical/publisher/breadcrumb information change. Existing article claims and MDify references are deliberately left for the user's Claude editing workflow.

## Compatibility decisions

Do not globally replace the remaining lowercase `mdify` operational names. `mdify-pro-files`, `x-mdify-admin`, `x-mdify-cron-secret`, the admin cookie/signing namespace, SQL migrations, RPC names and cleanup environment variables are infrastructure contracts. Renaming them would require a coordinated database/service migration outside this rebrand.

Historical architecture/testing docs retain their original context. The new README and this document describe the LLMiser changes. The application has no new model-routing, billing or browser-extension capability.

## Validation

See `LLMISER_VALIDATION.md` for executed checks and limits. Hosted conversion, DNS, TLS, old-domain redirects and search indexing require a configured deployment and are not implied by local build success.

## Handoff update — 20 October 2026

The user requested documentation for another AI agent, which will rebrand the blogs, visuals and banners. This documentation-only follow-up leaves the protected blog sources and assets unchanged. Start at [START_HERE.md](START_HERE.md), then read the [handover](ai-handover/HANDOVER.md), [progress tracker](ai-handover/PROGRESS.md) and [ready-to-copy prompt](ai-handover/BLOG_REBRAND_PROMPT.md).

The byte-preservation statements above describe the completed app phase. The next content phase is expected to change those files intentionally. Preserve the original hash snapshot as history and record new validation separately.
