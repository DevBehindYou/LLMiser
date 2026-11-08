# Intent ownership and overlap control

The goal is one preferred URL per reader task. No process guarantees zero cannibalization in live search. This pack prevents known exact collisions, requires semantic review and monitors results.

## Reservation rules

1. Search `intent-registry.json` by task, primary term, synonyms and desired output. Include homepage and `/usecase`.
2. Use the existing owner if the answer would substantially duplicate it. A reworded title is not a new intent.
3. Reserve a unique ID, canonical path, intent key and primary phrase before drafting. Keep Word/DOCX, Excel/XLSX and ZIP/codebase variants together unless evidence supports a different task.
4. Name nearest competing pages and explicit boundaries in the brief. Secondary phrases may occur naturally on several pages; they must not become competing titles, introductions and main answers.
5. Compare localized top results for candidate and nearest owner using the same engine/date/device. Normalize URLs. Five shared URLs among ten is a local editorial trigger to investigate merging, not a search-engine rule. Less overlap does not prove independence.
6. When results mainly show tools, do not disguise a guide as a tool. Homepage owns generic converter transactions; support guides deliver walkthroughs or troubleshooting.

## Current boundaries

| Owner | Owns | Links out for |
| --- | --- | --- |
| HOME | LLMiser tool, cost optimizer, generic PDF/Markdown converter | Cost theory, detailed tutorials |
| USE | Why use LLMiser, benefits and limitations | Provider cost strategy |
| E01 reduce-llm-api-costs | Actions to reduce API spend | E02 diagnosis; E03 token audit |
| E02 why-your-llm-bill-is-too-high | Diagnose cost drivers | Full implementation of E01 levers |
| E03 reduce-llm-token-usage | Excess input/history/output tokens | E05 retrieval-specific tuning |
| E04 rag-cost-optimization | Cost across RAG lifecycle | E05 retrieved-context cleanup |
| E05 hidden-token-tax-rag-pipelines | Retrieval waste, overlap/top-K | E08 full pipeline setup |
| E06 why-pdfs-are-expensive-for-ai | PDF ingestion paths and charges | E07 comparison; M02 OCR quality checks |
| E07 markdown-vs-pdf-llm-tokens | Conditional input-format comparison | E06 extraction context; no separate broad cleanup page |
| E08 document-to-llm-pipeline | End-to-end ingestion sequence | M01–M06 preparation checks |

These are editorial assignments, not assertions that every current page already obeys them. Open R01–R04 reviews are in `research/review-register.json`.

## Monitoring and remediation

Inspect indexing and canonicals first. Compare query-to-page results over equal windows. If the wrong page repeatedly owns a task, inspect title, scope and internal links. Improve the intended owner and narrow the support page when warranted. Consolidation/redirect is a separate reviewed implementation preserving useful content and inbound links. Do not blanket-noindex useful guides or cross-canonical distinct pages.

Legacy MDify public hosts retain permanent redirects and remain crawlable for migration. No new article targets MDify or markdify.com. Canonicals use `https://llmiser.devbehindyou.com` without tracking.

## Automation limits

`scripts/validate-plan.mjs` rejects duplicate normalized primary/alias ownership, duplicate URL/intent/title, invalid metadata, missing briefs and source-inventory drift. It reports current primary/secondary overlap and open reviews. It does not query search engines or assess semantic similarity. Passing is one gate, never a “cannibalization-free” certificate.

## Selected campaign

Use [the manual overlap review](campaign/OVERLAP_REVIEW.md) alongside exact ownership checks. Different keywords alone do not establish different search intent. Search Console query/page evidence and final drafts remain necessary; zero future cannibalization cannot be guaranteed.
