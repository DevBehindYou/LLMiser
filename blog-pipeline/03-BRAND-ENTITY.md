# LLMiser brand and claims

Updated 4 November 2026. Capabilities below are source-inspected at `8eb8c509`, not freshly conversion-tested for this content pack.

## Identity

**LLMiser**, by **DevBehindYou**. Positioning: **LLM cost optimizer for document inputs**. Tagline: **Make Every Token Count.**
Canonical origin: https://llmiser.devbehindyou.com
Repository: https://github.com/DevBehindYou/LLMiser
License: GPL-3.0. Use the approved study 11 “Prompt L” mark.

LLMiser converts files to editable Markdown so readers can inspect and reduce unnecessary context before using AI. Cost reductions depend on input path, model, workload and retained answer quality. The tool is not provider billing management or an autonomous cost-reduction agent.

Use LLMiser-only current public branding. Historical MDify mentions belong only in explicitly needed provenance. Do not revive markdify.com or use old archive logos/worker counts. Public articles describe reader tasks, not internal database/hosting architecture. Provider documentation can support claims without implying partnerships.

## Capability source map

| Claim | Source to inspect before drafting |
| --- | --- |
| Formats, batch/size limits, profiles | `../frontend/lib/formats.js`, `../frontend/lib/siteContent.js` |
| Upload, review, edit, download flow | `../frontend/components/`, README conversion steps |
| Retention/privacy | `../frontend/lib/legal/policies.js`, live `/privacy` |
| Token estimate | `../frontend/lib/documentStats.js` (characters divided by four, rounded) |
| ZIP outputs/limits | `../backendZ/` and actual fixture outputs |
| OCR limits/languages | `../backendO/`, public capability copy and readiness |
| Profiles | Current conversion implementation and original output comparisons |
| Extension status | `../extension/README.md`, `../docs/ai-handover/HANDOVER.md` |

## What can be described

- Documents: PDF, DOCX, XLSX, XLS, PPTX, EPUB, HTML/HTM, CSV, TSV, JSON, XML, TXT, Markdown.
- Images: JPG/JPEG, PNG, WebP, TIF/TIFF, BMP, GIF; verify first-frame behavior when discussing animation.
- Scanned PDF pages use OCR; current configured recognition is English. Six interface languages do not imply six OCR languages or translation.
- ZIP projects produce combined Markdown and project index/manifest artifacts. Inspect actual contents before explaining fields or completeness.
- Standard, Clean, Compact and RAG-ready profiles. RAG-ready markers are not an embedding service, vector database, retrieval engine or quality guarantee.
- Editable output, copy and Markdown/ZIP download. Rough character-based token estimate, not model billing.
- Current upload limits: 20 files per batch, 15 MiB document/ZIP and 10 MiB image (UI says MB); other decoded-image, archive and scanned-page limits also apply. Do not advertise “unlimited.”
- Files upload to the service. Link the current privacy policy for retention and exceptions; never claim browser-only conversion or immediate deletion.
- Extension source exists as a toolbar popup with file conversion and user-triggered Paste. Public store availability and native acceptance are not established by this pack. No extension CTA until checked.

## Never claim

Automatic model routing/caching, guaranteed bill reduction, live provider billing, provider-tokenizer accuracy, automatic LLM submission, translation, multilingual OCR, legacy .doc/.ppt, reverse conversion, flawless tables/formulas/charts, guaranteed image understanding, guaranteed secret detection or complete ZIP extraction.

## Claims and experiments

For token/cost comparisons, record input fixture/hash, representation, model/version, tokenizer or heuristic, price source/date, cached/uncached input, output, OCR/extraction costs and answer-quality criteria. Distinguish a worked example from observed billing. Conversion memory savings are not LLM token savings.

Old model-price and image-token examples in earlier pipeline documents are historical, not preapproved evergreen facts. Recheck official provider documentation before reuse. A smaller input can omit decisive evidence. Explain when the original PDF/chart/image should accompany the text.

Byline is DevBehindYou unless a real contributor is named. Never fabricate test results, quotes, customer stories, authors, review scores or statistics.
