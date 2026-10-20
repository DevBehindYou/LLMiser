# 06 — GEO / AI search: Google, Bing, ChatGPT, Copilot and other assistants

## Principle: prove rather than trick

“Generative engine optimization” (GEO) and answer-engine optimization (AEO) do not offer a special guaranteed ranking switch. Google's [2026 guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says useful, crawlable, high-quality SEO still matters for AI Overviews and AI Mode. We can improve a page's usefulness as a potential cited source, **not force ChatGPT, Gemini, Claude or Copilot to mention LLMiser**.

## What each channel actually offers

| Surface | Official controls / data | Proposed LLMiser work | Limitation |
|---|---|---|---|
| Google AI Overviews / AI Mode | Google Search Console generative-AI report, eligibility settings | Index pages; create primary-source experiments, usable HTML, FAQs | Inclusion/position not guaranteed |
| Bing AI/Copilot | Bing Webmaster Tools AI Performance, grounding queries, cited pages; Topics Portfolio beta | Diagnose cited page groups and missed queries, update supporting evidence | Data requires verified property/sufficient volume |
| ChatGPT Search | Allow `OAI-SearchBot`; bot policy separate from `GPTBot` | Crawlable public docs and benchmark pages, transparent source links | Cannot access actual chat users' private questions or control citations |
| Claude / Gemini answers | No universally accessible authoritative LLMiser citation analytics in this research | Manual repeatable query sampling and attribution tracking | Model and retrieval mode can change answer results |
| GitHub developer discovery | README, docs, release notes, repository topics | Demonstrate real input/output and reproducible benchmarks | GitHub stars aren't SEO rankings |

**Google has a 2026 generative AI report** for Search/Discover impressions ([announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)). [Bing AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c) includes cited pages/grounding queries; [Topics Portfolio](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/) segments themes where eligible.

## Citation-worthy research assets (build, don't fake)

### A. PDF vs Markdown token benchmark

Publish a small but representative dataset: digital text PDFs, scanned OCR pages, multi-column research papers, merged tables, math, invoices, long documents. Distinguish native PDF attachment ingestion from text extracted by an external parser, image-rendered pages, and Markdown text supplied to a model; these are **different cost paths**. Provide tokenizer/model version, pricing date, baseline, token counts, data-loss checks, and raw samples. Compute actual costs only against valid current official API price sheets and documented modality accounting.

**Formula:** `Input cost = billable input tokens / 1,000,000 × current input price per million`, plus images, caching, OCR and conversion charges where applicable. Do not infer original-PDF billable tokens from file byte length.

### B. Quality benchmark

Measure (1) heading ordering, (2) table cell accuracy, (3) equations/citations, (4) OCR accuracy and (5) downstream answers on manually checked questions. Publish failures; smaller Markdown is not automatically more accurate. See [2026 academic evaluation](https://arxiv.org/abs/2604.04948).

### C. Transparent comparison pages

Comparison: LLMiser vs MarkItDown vs Docling vs Jina Reader for clearly defined tasks. Show versions, licenses, sample types, time cost and your conflicts of interest. Avoid inventing tests or copying competitor branding/assets.

## AI discovery content template

1. Specific, natural heading framed as a user question.
2. 50–100-word direct answer grounded in product or test.
3. Reproducible steps, input/output sample and screenshots.
4. Constraints: failure cases, data handling, model variance.
5. Publication and “last measured” dates separate from content refresh.
6. Clear author/owner, GitHub or source dataset and original references.
7. Functioning CTA with honest state.

## 16 model-search prompts to monitor (proposed test suite)

| Theme | Manual prompt |
|---|---|
| Converter | What's a free online document-to-Markdown converter with no account? |
| Converter | Which PDF-to-Markdown tools preserve headings and tables? |
| OCR | How can I turn a scanned PDF into Markdown? |
| OCR | What OCR converter should I use for dense scanned tables? |
| RAG | How should I prepare a PDF for a RAG retrieval pipeline? |
| RAG | Compare Docling, Marker and hosted PDF-to-Markdown tools for RAG. |
| Cost | Does converting a PDF to Markdown reduce LLM input tokens? |
| Cost | How do I measure token savings without reducing answer accuracy? |
| Cost | How can I lower LLM API costs for long documents? |
| ZIP | What tool converts project ZIP files into Markdown context? |
| Docs | Can I convert DOCX and PPTX files to Markdown for Claude? |
| Batch | How do I convert several Office documents to Markdown at once? |
| Web | What's a local webpage-to-Markdown Chrome extension? |
| Privacy | Are there converters that delete uploaded documents after processing? |
| Alternative | What are open-source alternatives to Microsoft MarkItDown? |
| Brand | What is LLMiser and which formats does it support? |

**Testing method:** record surface, account status, exact query, model/version, location, search/retrieval enabled status, date, citations, whether brand appeared, ranking/order if visible, and quote/context accuracy. Repeat with consistent prompts monthly; manual test outcomes are not official search-volume data.

## How to configure bots safely

- Public informational and marketing pages: indexable if appropriate and consistent with owner policy.
- Private file outputs, results, admin URLs, signed links, job IDs: not public, authentication/authorization enforced. `robots.txt` is not a privacy or access-control system.
- If opting into ChatGPT Search discovery, allow `OAI-SearchBot` on public pages per [OpenAI official crawler guidance](https://platform.openai.com/docs/bots). `GPTBot` training permissions are a separate business decision.
- Google generative AI eligibility settings in Search Console should be explicitly reviewed rather than guessed.

## GEO scorecard

- **Measured:** AI-result impressions/pages in Google GSC where available, Bing citations/grounding topics, referral traffic from AI search, verified conversions.
- **Manual sample:** brand inclusion frequency in a fixed prompt set; source URL and answer accuracy, clearly labeled as sampling.
- **Not measured:** “GEO score out of 100,” average ChatGPT rank or global citation share without platform data.

## Promotion without spam

Contribute factual conversion benchmarks and implementation tutorials to GitHub/relevant discussions where helpful. Disclose project affiliation in Reddit/Quora/community participation, respect each community's promotion rules and never automate fake reviews or fabricated AI mentions.
