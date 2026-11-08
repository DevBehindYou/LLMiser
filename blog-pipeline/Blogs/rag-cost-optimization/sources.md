# rag-cost-optimization

## Keyword notes

Primary and secondary keywords come from the owner's brief in `Blogs/Blog List 01.txt`.
Search volumes were NOT measured for these terms in this session (no Keyword Planner
access). Re-check them before investing in more articles on the same cluster.

## Sources (all accessed 2026-10-03)
- Claude pricing: https://platform.claude.com/docs/en/about-claude/pricing (list prices: Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok; output 5x input; 1 token ~ 4 chars ~ 0.75 words; newer tokenizer ~30% more tokens; tool-use system prompt 286-675 tokens; caching and batch discounts stack)
- Anthropic, Introducing Contextual Retrieval, 2024-09-19: https://www.anthropic.com/news/contextual-retrieval (-35% / -49% / -67% top-20 retrieval failure rate; $1.02 per million document tokens; under 200,000 tokens ~500 pages consider skipping RAG). Fetched directly.
- Liu et al., Lost in the Middle, TACL 2024: https://aclanthology.org/2024.tacl-1.9/ (direct fetch blocked by the network policy; abstract confirmed via search results)
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching (5-min write 1.25x, hit 0.1x, 5-minute default lifetime)
- MDify's own worked example: frontend/lib/siteContent.js TOKEN_EXAMPLE (667 vs 2,235 vs 3,381 tokens; 70% / 80%). Features checked in frontend/lib/formats.js and backend*/app/common/profiles.py.

## Worked examples and code

All worked examples are labelled as illustrations in the article and figure captions.
Every number in them is derived from the sources above; the arithmetic lives in
`visuals.mjs` next to this file. Python snippets in the article were run before
publishing (Python 3.11, standard library only).

## LLMiser rebrand re-verification (2026-10-20)

The article was rebranded from MDify to LLMiser and every claim was re-checked. Current sources:

- Claude pricing, fetched 2026-10-20: https://platform.claude.com/docs/en/about-claude/pricing. Haiku 5.5 $0.10/$0.50 (prompts up to 100k tokens; $0.50/$2.50 above), Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok. Output is 5x input on every one of them. Cache hits: 0.1x standard, 0.05x on Sonnet 5.5 and Opus 5.5, 0.025x on Fable 5.1. 5-minute write 1.25x, 1-hour write 2x. Batch 50% on input and output. Caching and batch discounts stack. Claude 4.6 and later (except Haiku 5.5) bill the full 1M context at standard rates. Tool-use system prompt 286 tokens (Opus/Sonnet/Haiku 5.5, auto) up to 804 (Opus 4.7, any/tool). The page no longer states a words-per-token figure.
- Anthropic, Introducing Contextual Retrieval (19 Sep 2024), fetched 2026-10-20: https://www.anthropic.com/news/contextual-retrieval. Top-20 retrieval failure rate -35% (5.7% to 3.7%), -49% with contextual BM25 (2.9%), -67% with reranking (1.9%). $1.02 per million document tokens with prompt caching. Under 200,000 tokens (about 500 pages) you can include the whole knowledge base.
- Liu et al., Lost in the Middle, TACL 2024: https://aclanthology.org/2024.tacl-1.9/. Confirmed via search results 2026-10-20: performance is highest when relevant information is at the beginning or end of the context.
- House worked example (blog-pipeline/03-BRAND-ENTITY.md): 500-word US Letter page at 150 dpi, about 667 text tokens (0.75 words per token), 2,714 image patches, capped near 1,568 on the standard tier. 2,235 vs 667 tokens (about 70%) standard, 3,381 vs 667 (about 80%) high resolution. Replaces the old MDify siteContent TOKEN_EXAMPLE reference.
- LLMiser app features checked 2026-10-20: frontend/lib/formats.js (20 files per batch), frontend/lib/siteContent.js, backendN/app/common/profiles.py (RAG-ready <!-- chunk-boundary --> marker), token estimate = characters / 4 (frontend/components/OutputStatusBar.js).
