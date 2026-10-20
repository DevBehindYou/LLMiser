# 12 — Competitor domain authority, monthly volume and gap register

**Critical:** No live Ahrefs (DR), Semrush Authority Score, competitor traffic, Google Keyword Planner export or verified monthly search volume for these domains was accessible. **All unfilled cells are `—` and mean unknown, not 0.** Values must never be substituted with GitHub stars, platform recognition or a made-up “estimated DR.”

| Competitor website (scope) | Topic overlap | Ahrefs DR (as of date) | Estimated organic traffic | Top shared keywords | Data source to acquire |
|---|---|---:|---:|---|---|
| `ilovepdf.com` | PDF to Markdown | — | — | — | Ahrefs Site Explorer |
| `cloudconvert.com` | PDF to MD / multi-format | — | — | — | Ahrefs/Semrush |
| `pdf.ai` | PDF tool | — | — | — | Ahrefs/Semrush |
| `github.com/microsoft/markitdown` | Developer document conversion | — | — | — | SERP URL-level not same as domain-wide github.com DR |
| `github.com/docling-project/docling` | AI document parsing | — | — | — | URL-level SERP analysis (not GitHub domain DR) |
| `llamaindex.ai` | Managed parsing | — | — | — | Licensed export |
| `jina.ai` | Web/document to LLM context | — | — | — | Licensed export |
| `firecrawl.dev` | Website to Markdown | — | — | — | Licensed export |
| `repomix.com` | Codebase to AI context | — | — | — | Licensed export |
| `obsidian.md` | Web clipping | — | — | — | Licensed export |
| `mdify.devbehindyou.com` | Current product | — | — | — | GSC + Ahrefs if available |
| `llmiser.com` (**proposed**) | New brand | — | — | — | Check ownership; collect only after launch |

## Operational collection sheet

Copy one row per site/keyword combination using the following headers:

`recorded_at_utc | market | keyword | query_intent | position | ranking_url | referring_domain | ahrefs_DR | URL_rating | ranking_page_ref_domains | monthly_searches | KD | source_vendor | source_export_date | comments`

- `market`: country + language, e.g. `US/en`, `IN/en`; do not pool without methodology.
- `ranking_url`: exact result URL and page scope, not only domain.
- `referring_domain`: canonical domain including appropriate subdomains and group rules.
- `ahrefs_DR`: only same vendor/methodology, dated.
- `monthly_searches`: average monthly volumes from selected vendor, not Google impressions.
- `source_export_date`: reproducibility.

## Gap procedure

1. Input LLMiser/MDify and competitor domains to a licensed gap tool.
2. Export keywords where **at least two competitors rank** and LLMiser does not; filter by specific document/AI workflow intent.
3. Inspect **live SERP** top pages before proposing a new URL; generic tool pages may dominate regardless of DR.
4. Classify `true missing content`, `existing page underperforming`, `feature absent`, `competitor branded`, `irrelevant user intent`.
5. Implement high product-fit gaps only. Add feature first when a keyword promises behavior that does not exist.

[Ahrefs DR definition](https://ahrefs.com/blog/domain-rating/) and [Google Planner monthly search guidance](https://support.google.com/google-ads/answer/7337243?hl=en).
