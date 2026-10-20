# Progress and remaining work

Updated 20 October 2026, after the blog rebrand. Status describes this local checkout, not a live deployment.

## Phase status

| Workstream | Status | Evidence / next action |
| --- | --- | --- |
| Source copy and compatibility | Complete locally | MDify `ce56f5c` baseline; infrastructure contracts preserved |
| App UI, icon and domain constants | Complete locally | Prompt L assets, LLMiser chrome and selected canonical origin |
| SEO/GEO and cost messaging | Complete locally | Metadata, JSON-LD, sitemap, robots, llms.txt and server copy |
| Redirect implementation | Complete locally | 308 rules verified by local HTTP; host activation still pending |
| App validation | Complete for this phase | [Validation report](../LLMISER_VALIDATION.md); 88 HTTP checks |
| Agent handover | Complete | [Handover](HANDOVER.md), this tracker and [blog prompt](BLOG_REBRAND_PROMPT.md) |
| Blog text and frontmatter | **Complete: 8/8** | [Blog rebrand report](BLOG_REBRAND_REPORT.md) |
| Blog banners | **Complete: 8/8** | New LLMiser banner frame, rebuilt from specs |
| Supporting blog figures | **Complete: 40/40** | Rebuilt with the LLMiser signature; numbers re-verified |
| Generated index and discovery sync after blog edits | Complete | `npm run blog:index`, `blog:check` OK; `llms.txt` blog list updated |
| Validation of the blog rebrand | Complete locally | 221/221 tests, lint, build, 88 HTTP checks, dialog and article pages in both themes and at 375 px |
| Article page banner and inline Markdown | Complete locally | `/blog/{slug}` now renders the banner, bold TL;DR keywords and caption links |
| Commit/push/release | Not performed | Files remain mostly untracked; review and preserve existing work |
| Hosting, secrets, DNS and TLS | Pending | [Migration runbook](../LLMISER_MIGRATION.md) |
| Real legacy-host redirects and scheduler activation | Pending | Requires configured deployment/hosting changes |
| Live conversion/storage checks | Pending | Test normal, OCR, ZIP, export and cleanup against configured services |
| Search Console/Bing setup and post-launch monitoring | Pending | Verify properties, submit sitemap, inspect results |

## Article inventory

The eight articles keep their slugs, `date: 2026-10-03`, `draft: false` and author `DevBehindYou`. Each has one banner and five supporting figures. Source: `frontend/content/blog/<slug>.md`. Assets: `frontend/public/blog/<slug>/`.

| Slug | Article text | Banner | Supporting figures | New-phase QA |
| --- | --- | --- | --- | --- |
| `document-to-llm-pipeline` | Complete: LLMiser, caching rates, 1M-context note, Chroma URL | Complete | Complete: 5 | Check PASS, 0 warnings |
| `hidden-token-tax-rag-pipelines` | Complete: excerpt claim qualified, Chroma URLs | Complete (sub line shortened) | Complete: 5 | Check PASS, 0 warnings; mobile checked |
| `markdown-vs-pdf-llm-tokens` | Complete: rewritten around the documented worked example | Complete (hook no longer a % promise) | Complete: 5 | Check PASS, 0 warnings; light 375 px checked |
| `rag-cost-optimization` | Complete: LLMiser, caching rates, capability limits | Complete (labels moved inside card) | Complete: 5 | Check PASS, 0 warnings; desktop checked |
| `reduce-llm-api-costs` | Complete: new title, prices and worked example recomputed | Complete (stamp "trimmed", waste lines struck) | Complete: 5 | Check PASS, 0 warnings; desktop checked |
| `reduce-llm-token-usage` | Complete: token sources, tool-use range, caching rates | Complete | Complete: 5 | Check PASS, 0 warnings |
| `why-pdfs-are-expensive-for-ai` | Complete: Bedrock context for 7x, tiers, LLMiser | Complete | Complete: 5 | Check PASS, 0 warnings |
| `why-your-llm-bill-is-too-high` | Complete: new title, no 2x promise, tiers incl. Haiku 5.5 | Complete (2x badge replaced by "leaks" lens) | Complete: 5 | Check PASS, 0 warnings; desktop checked |

### Exact SVG files

Each directory also contains `banner.svg`.

| Directory / slug | Five supporting figures |
| --- | --- |
| `document-to-llm-pipeline` | `chunk-record.svg`, `context-budget.svg`, `mixed-pdf.svg`, `naive-vs-pipeline.svg`, `tokens-per-question.svg` |
| `hidden-token-tax-rag-pipelines` | `budget.svg`, `eight-knobs.svg`, `one-relevant-sentence.svg`, `overlap-inflation.svg`, `tax-funnel.svg` |
| `markdown-vs-pdf-llm-tokens` | `chunk-boundaries.svg`, `extraction-noise.svg`, `reading-order.svg`, `tokens-per-page.svg`, `when-to-send-pdf.svg` |
| `rag-cost-optimization` | `context-per-question.svg`, `contextual-retrieval.svg`, `once-vs-monthly.svg`, `rag-cost-map.svg`, `where-to-optimize.svg` |
| `reduce-llm-api-costs` | `cache-math.svg`, `output-price.svg`, `safe-loop.svg`, `seven-levers.svg`, `worked-example.svg` |
| `reduce-llm-token-usage` | `audit-loop.svg`, `history-growth.svg`, `pdf-modes.svg`, `request-anatomy.svg`, `six-fixes.svg` |
| `why-pdfs-are-expensive-for-ai` | `fix-flow.svg`, `page-anatomy.svg`, `repeats.svg`, `seven-times.svg`, `table-fragments.svg` |
| `why-your-llm-bill-is-too-high` | `audit-checklist.svg`, `bloated-request.svg`, `bloated-vs-lean.svg`, `model-tiers.svg`, `six-leaks.svg` |

## Known follow-up details

- Prices and model names in the articles are Anthropic list prices checked on 20 October 2026. Recheck them when Anthropic changes its price list, then rebuild the figures from the specs (see the report).
- `frontend/lib/articleSeo.mjs` still uses the shared raster `og-card.png` for social previews. Per-article social images would need a raster export of each banner. Not done.
- The public `/blog` listing page still shows text cards without banners. The dialog and article pages show them.
- `docs/blog-preservation.json` stays as the historical pre-rebrand snapshot. Blog files now differ from it on purpose.
- The blog generator lives in the local, Git-excluded `blog-pipeline/` folder (see the report). LLMiser is a public repository, so the folder is excluded through `.git/info/exclude`, the same way MDify-Pro kept its pipeline private.

## How the next agent should maintain this tracker

Edit articles in `frontend/content/blog/`, visuals through `blog-pipeline/Blogs/<slug>/visuals.mjs`, then run `node blog-pipeline/visuals/build.mjs <slug>`, `node blog-pipeline/check.mjs frontend/content/blog/<slug>.md` and `npm run blog:index` from `frontend/`. Record new evidence in [BLOG_REBRAND_REPORT.md](BLOG_REBRAND_REPORT.md) rather than overwriting it.
