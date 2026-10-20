# 15 — Brand, product, privacy and evidence risks

## Risk register

| Risk | Potential impact | Mitigation / release gate | Owner |
|---|---|---|---|
| “LLMiser” conflicts with existing registered mark or lookalike | Forced costly rename | Trademark counsel/registry check; own-domain and app-store name verification **before launch** | Owner/legal |
| No actually available `llmiser.com` / `.ai` domain | Brand/URL plan breaks | Registrar/RDAP transaction check, not just browser/Google no-results | Owner |
| Generic “LLM cost optimizer” promises unsupported behavior | Consumer trust and compliance | Describe genuine conversion; cost comparisons only with methods | Product/marketing |
| Percentage savings claim without reproducible baseline | Misleading SERP/AI snippets | State model, tokenizer, input path, sample and date; no universal percentage | Content reviewer |
| Browser local mode confused with server document converter | False privacy claim | Separate Chrome webpage-local operations from web-hosted uploads | Security |
| 48-hour deletion not matching production exceptions | Privacy/legal issue | Test live cleanup and explain KEEP/EXTEND behavior in policy | Engineering/legal |
| Side effects of domain changes on Supabase authorization/CORS | Broken conversions and access | Verify correct project, origins, signed storage access and test secrets | Engineering |
| Bulk blog rewrite during domain move | SEO volatility | Stage metadata/routes first; change major content later | SEO |
| Competitor trademark/logo misuse | Legal/commercial risk | Neutral use-case comparisons with factual attributions | Marketing |
| Fabricated backlinks/reviews/AI responses | Platform sanctions/reputational damage | No fake testimonials, ratings, link schemes or community astroturfing | Marketing |
| Public indexing of private conversion outputs | Data exposure | Auth enforcement, private object ownership, noindex on private pages; robots is insufficient | Security |

## Approved-claim examples

- `Convert PDFs and Office documents into Markdown` — only if supported and functioning for stated formats.
- `Free and no sign-up` — only while currently true for applicable functionality.
- `Designed for AI and RAG workflows` — a design/use-case assertion, not an output-quality guarantee.
- `You can compare token counts` — only if an actual tokenizer-specific tool is deployed.
- `Potentially reduce redundant input` — conditional language with clear baseline.

## Prohibited until tested

- `LLMiser cuts every PDF token bill by 70%`.
- `100% accurate OCR / lossless PDF conversion`.
- `All files are converted locally in your browser` if backend conversion receives documents.
- `LLMiser always produces better RAG answers`.
- `Your files are permanently deleted instantly` if actual retention is up to 48h and exceptions apply.
- `Lowest cost converter on the internet` without current complete competitor comparison.

## Token accounting transparency checklist

Record `original input representation`, `converted representation`, `model + tokenizer`, `date/pricing`, `cached vs uncached`, `input vs output`, `image/audio billables`, `OCR conversion cost`, and `evaluation of information loss`. If any are absent, publish the experiment as partial and avoid universal money-saving claims.

## Ethical community participation

Reply to Reddit/Quora/GitHub only with relevant help and disclosure of affiliation where you work on LLMiser. Do not scrape protected content to fabricate a market survey or mass-comment promotion. Reddit threads are examples of concerns, not representative market samples. Quora primary content was not verified in this research.
