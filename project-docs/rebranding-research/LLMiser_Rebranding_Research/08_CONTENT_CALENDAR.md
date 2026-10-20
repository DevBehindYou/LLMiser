# 08 — Six-month content, SEO and GEO editorial roadmap

## Production rules

Publish **fewer, genuinely useful pages** rather than thin keyword permutations. Every converter page must link to a working tool; every benchmark must have test artifacts and limits; every article must have an author/reviewer, publication date and substantive references. Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) explicitly disfavors primarily search-manipulative mass publishing.

## First month: launch pages and reuse MDify equity

| Week | Deliverable | Primary query/intention | Acceptance |
|---|---|---|---|
| 1 | LLMiser homepage and brand/legal transition | document to markdown converter | Working converter, SEO/UX and redirects |
| 1 | PDF converter page | PDF to Markdown converter | Preview + actual `.md` downloaded and tested |
| 2 | Word converter page | DOCX to Markdown | Preserve heading/list samples, test DOCX |
| 2 | Image OCR converter | Image to Markdown OCR | Actual OCR path, disclose language/accuracy limits |
| 3 | Scanned PDF OCR page | scanned PDF to Markdown | Unique OCR tutorial and real fixture |
| 3 | ZIP converter page | ZIP to Markdown | Safe upload constraints and exported ZIP fixture |
| 4 | Refresh 8 existing MDify blog articles | token costs, RAG, PDF overhead | Evidence, canonicals, old-slug redirects |
| 4 | Publish docs/privacy disclosure | data handling | Tested, up-to-date statements |

## Months 2–3: create evidence-led authority

| Month | Item | Target intent | Asset/proof |
|---|---|---|---|
| 2 | PDF to Markdown for RAG | RAG preprocessing | Runnable outline → chunk → retrieval example |
| 2 | PDF vs Markdown tokens: *research protocol* | PDF token cost | Method and public dataset; report results only after run |
| 2 | DOCX/PPTX/Excel converter pages | Office format tools | Tested representative fixtures |
| 2 | Bulk conversion workflow | batch Markdown converter | Real 20-file workflow if limit remains correct |
| 3 | Complex PDF tables comparison | table fidelity | Merged cell, multi-page, footnote examples |
| 3 | How to prepare scanned documents for RAG | OCR→RAG | Limitations and reproducible sample |
| 3 | Codebase ZIP for AI | project to Markdown | Safe examples; guidance to exclude secrets |
| 3 | Practical RAG chunking after Markdown | heading-aware chunking | Markdown and retrieval examples |

## Months 4–6: grow share and extension ecosystem

| Month | Item | Main purpose |
|---|---|---|
| 4 | Public benchmark results | Citation-worthy original research, failures included |
| 4 | Technical comparison with MarkItDown/Docling | Neutral comparison and use-case decision tree |
| 4 | Chrome extension page (after actual release) | Webpage-to-Markdown intent and extension installs |
| 5 | Token comparison tool (only if implemented) | Utility + reproducible model tokenizer versions |
| 5 | Context preparation for Claude/ChatGPT | Real input path examples, no model-endorsement implication |
| 5 | Trust centre / data deletion guide | Privacy questions and honest server/local boundaries |
| 6 | Study update with changed model/tokenizer pricing | Fresh evidence, not artificial date-change |
| 6 | User workflow stories or open-source integration guide | Third-party utility and legitimate earned links |

## Content brief template

```text
URL:
Intent and exact task:
Primary keyword + same-intent supporting terms:
Existing competing SERP URLs and observation date:
Audience / use case:
What working LLMiser feature solves this task:
Original evidence / demo / screenshots:
Main H1, 3–5 H2s, direct answer paragraph:
Important limitations and safety/privacy caveats:
Internal links, authoritative external sources, CTA:
Schema if justified by real content:
Author, technical reviewer, test/version date:
QA: tested output, accessibility, indexability, duplication, claims:
```

## Distribution channels

Product repo README, GitHub discussion responses and issue triage, relevant Reddit comments where useful and affiliation disclosed, Chrome Web Store listing/real user feedback, niche developer newsletters, helpful Q&A. Never automate unsolicited subreddit promotion or fabricate reviews. Quora may be a channel, but relevant answer threads were not independently verified in this research.

## Revision of MDify's eight existing articles

The [current blog index](https://mdify.devbehindyou.com/blog) covers Markdown vs raw PDF, reducing API costs, PDF overhead, document selection, hidden RAG token tax, RAG total costs, high token usage and bills. Audit original math and keep the useful URL/topic history. Add date-stamped formulas, model-specific baselines and illustrative-vs-measured labeling. Do **not** rewrite every article at the exact same time as the domain migration; prioritize URL preservation, then staged improvements.
