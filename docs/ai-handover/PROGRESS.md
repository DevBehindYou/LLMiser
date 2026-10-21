# Progress and remaining work

Updated 21 October 2026 after the deployment-report review. Status distinguishes local checks, prior-agent reports and independently observed public responses. See [deployment review](../LLMISER_DEPLOYMENT_REVIEW.md).

**Later update:** [Search migration](../LLMISER_SEARCH_MIGRATION.md) is active in Google; the sitemap succeeded (13 pages) and homepage indexing was requested. Redirect cleanup is deployed, including direct Vercel alias redirects and the blog index fix; 190 live checks passed. Actual replacement of old Google results awaits recrawling. Earlier pending/search and extra-hop entries below are historical.

## Phase status

| Workstream | Status | Evidence / next action |
| --- | --- | --- |
| Source copy and compatibility | Complete locally | MDify `ce56f5c` baseline; infrastructure contracts preserved |
| App UI, icon and domain constants | Complete locally | Prompt L assets, LLMiser chrome and selected canonical origin |
| SEO/GEO and cost messaging | Complete locally | Metadata, JSON-LD, sitemap, robots, llms.txt and server copy |
| Redirect implementation and activation | Verified live | Old homepage/article paths redirect with 308; query preserved. `/blog` has a minor extra hop |
| App validation | Complete for this phase | [Validation report](../LLMISER_VALIDATION.md); 88 HTTP checks |
| Agent handover | Updated for deployment phase | [Handover](HANDOVER.md), this tracker and [deployment review](../LLMISER_DEPLOYMENT_REVIEW.md); original blog prompt is historical |
| Blog text and frontmatter | **Complete: 8/8** | [Blog rebrand report](BLOG_REBRAND_REPORT.md) |
| Blog banners | **Complete: 8/8** | New LLMiser banner frame, rebuilt from specs |
| Supporting blog figures | **Complete: 40/40** | Rebuilt with the LLMiser signature; numbers re-verified |
| Generated index and discovery sync after blog edits | Complete | `npm run blog:index`, `blog:check` OK; `llms.txt` blog list updated |
| Validation of the blog rebrand | Complete locally | 221/221 tests, lint, build, 88 HTTP checks, dialog and article pages in both themes and at 375 px |
| Article page banner and inline Markdown | Complete locally | `/blog/{slug}` now renders the banner, bold TL;DR keywords and caption links |
| Commit/publication | Complete in subsequent phase | Local commits `e999388`, `3ed4ded`; live frontend observed. Remote branch equality not rechecked |
| Frontend hosting | Live | `https://llmiser.vercel.app`; 200 and HSTS independently checked 21 October |
| Six new backend deployments / environment | Reported verified by deployment agent | Hostnames in local env agree; no secret/auth tests repeated in this review |
| Keep-warm Vault URLs | Pending assigned-agent task | Prior report says old targets remain; live values must be inspected before changing |
| Custom domain DNS/TLS | Verified live | Public DNS, trusted certificate, 13 canonical pages; [verification record](../LLMISER_DOMAIN_VERIFICATION.md) |
| Tick scheduler cutover | Pending | Inspect current live target; move existing single job after the custom domain works |
| Legacy public-host redirects | Verified live for tested paths | Home/article one hop; blog listing two hops; old health API not redirected |
| Old-service retirement | Pending | Complete custom-domain conversion validation and dependency audit first |
| Live conversion/storage on Vercel origin | Reported passed: HTML, PNG, ZIP | Prior agent timings 4.1 s / 5.3 s / 3.2 s; no new jobs created in this review |
| Full custom-domain acceptance / cleanup | Pending | Include scanned PDF, admin and actual cleanup outcome |
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
