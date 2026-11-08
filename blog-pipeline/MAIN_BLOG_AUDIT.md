# Existing LLMiser blog audit

Date: 4 November 2026. Baseline: `8eb8c5091e1b370ebf7ed9631621d07226960b7a`.
Scope: eight currently published articles, live HTTP/metadata checks, repository content, selected primary-source checks and three illustrative-code reproductions. No public article, asset or application code was edited.

## Verdict

The site has a useful educational foundation: consistent LLMiser branding, clear openings, source links, worked examples and five supporting figures per article. The stronger articles explain document-input costs and retain caveats about visual information.

It does not yet function as eight distinct main pillars. Most articles return to the same advice: shrink PDFs, trim context, retrieve fewer chunks and measure quality. Some narrower diagnoses deserve to sit below broader guides. Fix misleading claims and fragile examples, define each page's job, then commission support articles against the existing structure.

This is an editorial/technical assessment, not evidence of a Google penalty, measured cannibalization or ranking potential. No Search Console/Bing query-to-page data was available.

## What was verified live

All eight canonical article URLs returned HTTP 200. Each had its own correct LLMiser canonical, matching source H1 and description, `index, follow`, and no X-Robots-Tag restriction in the inspected response. This establishes accessibility and stated indexing directives, not actual indexing or Google-selected canonicals.

The initial web tool and sandboxed requests could not reach the site. A subsequent permitted direct public HTTP fetch succeeded. Final results are saved in [live evidence](research/main-blog-live-audit.json). Live article text is included there for comparison. All eight responses lacked `dateModified`; source inspection confirms the article schema helper does not emit it.

## Article-by-article assessment

IDs refer to the current intent registry. Proposed roles below are recommendations, not URL changes.

| ID / existing article | Best role | What works | What should change before expansion |
| --- | --- | --- | --- |
| E01 [Reduce LLM API costs](https://llmiser.devbehindyou.com/blog/reduce-llm-api-costs) | Main guide: cost-reduction actions | Practical levers, sources, worked arithmetic, explicit separation of LLMiser from provider routing/caching | Separate physical tokens from billable equivalents; label the standard-resolution PDF baseline as an assumption when using newer-model prices; qualify free-plan claims and the unexplained “six chunks = 1%” baseline |
| E02 [Why the LLM bill is high](https://llmiser.devbehindyou.com/blog/why-your-llm-bill-is-too-high) | Diagnostic support under E01 | Layer-by-layer audit is useful | Intro/heading call a cost-weighted total a token count; avoid claiming the same information survives pruning without an answer-quality test; hand off fixes to E01 instead of repeating them |
| E03 [High token usage](https://llmiser.devbehindyou.com/blog/reduce-llm-token-usage) | Cross-cutting diagnostic support under E01 | Separates context contributors; rough estimator is labeled | Define the distinction from E02 as physical token accounting, not bill diagnosis; narrow claims about all chat apps replaying whole history and smaller inputs guaranteeing more free-plan questions |
| E04 [RAG cost optimization](https://llmiser.devbehindyou.com/blog/rag-cost-optimization) | Main guide: RAG economics | Lifecycle cost map and ingestion/query distinction | Token volumes from different services are not a full cost comparison; include actual rates, re-ingestion, storage and reranker costs before a break-even claim; move detailed top-K tuning to E05 |
| E05 [Hidden RAG token tax](https://llmiser.devbehindyou.com/blog/hidden-token-tax-rag-pipelines) | Technical support under E04 | Specific retrieved-context focus and useful overlap arithmetic | Example deduplication can discard materially different facts; label heuristic token budget; link to E04 and E08; replace broad cleanup/quality guarantees with testable statements |
| E06 [Why PDFs cost more](https://llmiser.devbehindyou.com/blog/why-pdfs-are-expensive-for-ai) | Explanation/support under E07 | Explains image-plus-text ingestion and warns about OCR | Correct blanket claims that PDFs have no headings/structure; fix destructive cleanup example; reduce duplication of E07's savings math and full conversion advice |
| E07 [Markdown versus PDF](https://llmiser.devbehindyou.com/blog/markdown-vs-pdf-llm-tokens) | Main guide: choosing document input representation | Closest fit to product; explains when original charts/images matter | Replace implied guaranteed extraction/structure retention with observed limitations; distinguish cap-based estimate from actual resized image tokens; add a reproducible product example before using it as performance evidence |
| E08 [Document-to-LLM pipeline](https://llmiser.devbehindyou.com/blog/document-to-llm-pipeline) | Main guide: ingestion workflow | Natural parent for future format/OCR/ZIP how-tos; practical sequence | Chunker breaks fenced code and does not create promised page ranges; broad “cheapest format,” “costs flat” and page-count recommendations need conditions; link to E04/E05 instead of repeating their detail |

Keep all eight URLs for now. Narrowing scope and linking them coherently is preferable to deleting pages based on a textual overlap assessment alone. Consolidation would require query/page evidence, inbound-link review and a separate migration decision.

## Priority findings

### A01 — Three published Python examples can lose meaning (high priority)

These are small educational snippets, not demonstrated production application bugs. Their limitations should be fixed or made prominent before promoting them in support posts.

1. **E06 repeated-line removal.** The function normalizes every digit sequence before comparing all lines. With pages `Revenue 100 / Unique A`, `Revenue 200 / Unique B`, `Revenue 300 / Unique C`, it removes all three revenue lines. The existing generic caveat is insufficient for this concrete numeric loss. Restrict any proposed cleanup to identified header/footer zones or an explicit review list; retain original output.
2. **E05 context deduplication.** Two clauses differing only in “5 business days” versus “15 business days” exceed the word-set similarity threshold. The second is dropped. Similar words do not establish equivalent facts. Preserve document/section/version identity and material numbers/negation; do not use lexical similarity alone to discard evidence.
3. **E08 Markdown chunker.** A `# comment` inside a Python fenced block becomes a document heading. The function splits the fence and attributes following text to a bogus section. It also slices long text at arbitrary characters, which can cut tables/code, and emits no page-range field. Use a fence-aware/structure-aware implementation or clearly limited pseudocode; page provenance must come from extraction, not be invented.

Reproduction outputs are in [source evidence](research/main-blog-source-audit.json). No app production conversion behavior was tested by these snippet checks.

### A02 — The bill article mixes actual token count and cost equivalents (high priority)

E02's 31,970 total weights 1,500 output tokens at a 5× input-price ratio, contributing 7,500 to the sum. Under the stated assumptions, the physical input-plus-output count is 25,970. Its body later explains the cost-equivalent method, but the excerpt and heading say “tokens.” The lean comparison also includes discounted cached input as equivalents: caching changes charges, not the physical prompt size.

Keep separate columns for physical input/output, cache-hit tokens and calculated currency cost. Use “input-price token equivalents” only when consistently defined. Do not advertise the cost ratio as a context-length reduction.

E01's cached table row likewise labels a price-weighted input equivalent as “Input tokens.” Its surrounding explanation helps but does not fix the table label.

### A03 — PDF/Markdown claims exceed the evidence (high priority)

E06 says PDF contains no paragraph, heading or table structure. Tagged PDFs can preserve a structure tree; [W3C's PDF heading technique](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF9) documents it. The accurate problem is that many PDFs are untagged or extraction does not reliably retain structure, not that the format cannot contain it.

Several pages assert that Markdown conversion removes most repeated text, preserves tables, improves retrieval, or makes every later question cheaper. Markdown is an output representation, not a guarantee of those transformations. The current profile source mostly adjusts source-line/whitespace formatting and adds chunk markers; it does not establish universal header/footer removal or semantic table repair. Extraction may preserve some structures, but that needs representative evidence.

“Same information” after pruning and “loses none of the answers” after dropping page images need evaluation, not just plausible arithmetic. Similarly, smaller input does not establish how a hosted free plan applies its usage limits.

### A04 — Repeated illustrative savings are not eight independent results (medium/high)

The 500-word, 667-text-token and roughly 2,235-standard-PDF-token example recurs across articles and figures. It is generally labeled, which is good. Repetition still risks making it appear like a broad measured product result.

The [current Claude vision documentation](https://platform.claude.com/docs/en/build-with-claude/vision) supports 28×28 patches and resolution-tier limits, but images are resized under both edge and patch limits. The standard maximum is an approximation, not an exact prediction for every page. Newer high-resolution models also do not automatically use the standard-tier baseline. Pair price and input-path assumptions explicitly in E01.

E01's “six chunks from 100 pages is about 1%” lacks chunk-size/denominator context. With the E08 assumptions, 3,000 tokens are about 1.34% of its multimodal baseline but 4.50% of its 66,700-token text corpus. This is a clarification issue, not a universal correction to 4.5%.

Spot checks of [current Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) matched the quoted Haiku/Sonnet/Opus prices and relevant cache ratios. Do not label all named models or prices fabricated. The issue is scope, consistency and maintenance.

The cited 1,000/7,000 three-page Bedrock example appears in an official indexed older page excerpt, but was not found in the current direct PDF documentation response. Preserve its historical context or refresh its exact primary reference; do not call it a newly verified universal benchmark.

### A05 — Weak body-link hierarchy despite extensive shared subject matter (medium)

There are only four cross-article hyperlinks in the eight article bodies, all pointing to E07. E04 and E05 do not link to each other; E08 links to no sibling article. This count excludes image URLs and shared navigation.

Proposed contextual relationships:
- E01 → E02 for diagnosis; E03 for physical token accounting; E07 for document representation.
- E02/E03 → E01 for implementing cost actions.
- E04 ↔ E05 for economics versus retrieval tuning.
- E08 → E04 for economics, E05 for packing retrieved context, E07 for representation choice.
- E06 ↔ E07 for ingestion explanation versus format decision.

Add links only at useful handoff points. No forced reciprocal-link quota. New support articles should link to their most relevant existing parent.

### A06 — Freshness and social metadata have gaps (lower priority)

All posts carry 3 October publication dates while some body claims say checked 20 October. No post currently sets `updated`. The parser accepts that field, but `frontend/lib/articleSeo.mjs` emits neither JSON-LD `dateModified` nor Open Graph modified time. The page reader shows the publication date.

Use an actual material-update date if known and display it coherently. Do not backfill a date merely for ranking. A source-check date and an article-modification date are different.

Every article currently uses the shared OG card despite distinct SVG banners. This is a presentation opportunity, not a canonical/indexing defect. It needs renderer support and suitable raster assets; frontmatter alone will not implement it.

## Proposed hierarchy before support expansion

Four main guides: E01 cost reduction; E04 RAG economics; E07 PDF-versus-Markdown decision; E08 document pipeline.
Four existing supporting/diagnostic guides: E02 bill diagnosis; E03 token accounting; E05 retrieval waste; E06 PDF ingestion costs.

New support briefs remain provisional. In particular:
- S01/S06 OCR tutorials must add actual conversion/verification evidence, not repeat PDF-cost theory.
- S02 codebase ZIP and S03–S05 Office guides can add distinct tasks beneath E08.
- S07 cleanup already overlaps practical material in E06; decide whether it expands E06 or becomes a distinct tested walkthrough before reserving it as final.
- S09 product profiles has a narrow, useful task; verify actual transformations.
- S10 CSV stays conditional against S03.

## Recommended next phase

1. Review and resolve A01–A03 in the current articles, with factual/source and illustrative-code checks.
2. Confirm the four-main/four-support boundaries and update the intent registry/brief exclusions accordingly.
3. Add useful internal handoffs and preserve existing canonical URLs.
4. Collect one original document-input comparison with output-quality checks, then commission a pilot support article.
5. Monitor actual query/page data before any consolidation.

This audit does not authorize or perform those public edits. The owner requested analysis first. Current articles, banners, figures and runtime remain unchanged.
