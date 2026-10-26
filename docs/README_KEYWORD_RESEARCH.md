# README keyword research and editorial choices

Researched 26 October 2026. Scope: the GitHub README, not blog articles or their visuals. The README describes the product without exposing its database, hosting topology, credentials or operator tools.

## Verified search demand

The [Semrush Keyword Search Volume Checker](https://www.semrush.com/free-tools/keyword-search-volume-checker/) was queried in its public browser interface with **United States** selected. The limited report for **pdf to markdown** returned these estimates:

| Query | US monthly volume | Global monthly volume | US difficulty | US intent | US CPC |
| --- | ---: | ---: | ---: | --- | ---: |
| pdf to markdown | 2.4K | 12K | 33% | Commercial | $1.77 |

The same report showed India at 1.9K, Germany at 880 and other countries at 6.8K. These are the tool's displayed, rounded estimates, not measured visits to LLMiser. The report did not expose a data-month label; the date above is the observation date. Semrush describes volume as a rolling 12-month monthly average. A local DOM snapshot is retained privately in `project-docs/localization-evidence/semrush-pdf-to-markdown.txt`.

The public [Semrush overview for imagetotext.io](https://www.semrush.com/website/imagetotext.io/overview/) also showed the following **Bangladesh database, September 2026** terms (page updated 13 October 2026):

| Query | Displayed monthly volume | Relevance |
| --- | ---: | --- |
| image to text | 74,000 | OCR feature; broader than Markdown conversion |
| image to text converter | 14,800 | OCR feature; broader than Markdown conversion |
| photo to text | 9,900 | Supporting wording for image OCR |

These country-specific figures cannot be compared directly with US estimates or presented as global demand. They establish demand for the OCR topic, not attainable traffic or evidence that LLMiser will rank.

Additional checks for Word/OCR/cost terms did not yield a reliably changed report: the public tool continued showing the first PDF report. No numbers from that stale report were attributed to other queries. No quota, sign-up or verification controls were bypassed.

## What was and was not obtained

- **Semrush:** one directly verified PDF report and the public country-specific OCR table above.
- **[Ahrefs Keyword Generator](https://ahrefs.com/keyword-generator):** reviewed its public methodology and available metrics. No keyword-specific Ahrefs report/export was obtained; no Ahrefs volumes are claimed.
- **[Google Keyword Planner](https://support.google.com/google-ads/answer/7337243?hl=en-uk):** reviewed the official keyword-research workflow. No authenticated Google Ads dataset was available for this work; no Planner volumes are claimed.
- Third-party pages offered conflicting PDF-to-Markdown numbers without consistent geography/date. They were excluded from the volume evidence.

## Keywords used in the README

Priority is an editorial judgment based on product fit and the evidence above. It is not a ranking prediction. Terms without a verified volume remain **unmeasured**, not zero-volume terms.

| Priority | Terms | Where used | Evidence |
| --- | --- | --- | --- |
| Primary | PDF to Markdown, free PDF to Markdown converter | Title, introduction, steps, formats, FAQ | Verified Semrush demand for the base phrase; modifier volumes unmeasured |
| Brand/category | LLMiser, LLM cost optimizer, LLM token usage | Title, introduction, context section | Product positioning; volumes unmeasured |
| Close variants | PDF to MD, convert PDF to Markdown | Formats, steps, FAQ | Same supported task; variant volumes unmeasured |
| Conversion features | Word to Markdown, Excel to Markdown, PowerPoint to Markdown, HTML to Markdown, ZIP to Markdown | Format table and questions | Supported inputs; volumes unmeasured |
| OCR | image to text, image to Markdown, scanned PDF | Format table, OCR explanation, FAQ | Country-specific demand for image-to-text base phrase; other volumes unmeasured |
| Workflows | Markdown for AI, ChatGPT, Claude, Gemini, Obsidian, Notion, RAG | Conversion steps and use cases | Compatible text workflows; volumes unmeasured |

Avoid unsupported targets such as a PDF compressor, AI chatbot, PDF editor, unlimited converter, document translator or guaranteed 70% token savings. Interface language support does not expand the server's OCR language configuration.

## Search and AI-answer readability

The README opens with a self-contained definition, then gives actionable steps, plain tables, descriptive image text and concise question/answer sections. Important product information is text, not only images. Canonical links consistently use `https://llmiser.devbehindyou.com`; the MDify mention explains provenance only.

Google says the established SEO practices also apply to its AI Overviews and AI Mode; there is no special AI schema or additional optimization requirement. Clear text and useful visuals are appropriate; indexing, ranking and AI citations are not guaranteed. See [Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).

This README can help engines understand the public repository and brand. It cannot control GitHub's indexing, guarantee that the app ranks, or substitute for a crawlable app, useful content and real links. No robots, migration redirects, blog content, metadata, sitemap or Search Console settings were changed for the README.

## Evidence to collect next

For a wider quantitative study, export Semrush/Ahrefs/Planner data with the tool, country, language, network, date range and retrieval date recorded. Use the same settings when comparing terms. Research the six language markets separately; do not translate the English keywords and assume equivalent demand. Compare Search Console impressions, clicks and conversion quality after release before making further editorial changes. Do not add keyword lists or repeated translations to the README just to target volume.

## Demo provenance

- `docs/llmiser-desktop.jpg` and `docs/llmiser-mobile.jpg`: existing LLMiser screenshots, reused unchanged. They predate the language selector.
- `docs/demos/languages.gif`: six actual screenshots of the local help page, one per language, displayed for three seconds each. No fabricated conversion results or usage metrics. The read-only help view avoids the local converter's unconfigured-service state.
- The Markdown example in the README is explicitly illustrative. No live files were uploaded or production jobs created to make it.
