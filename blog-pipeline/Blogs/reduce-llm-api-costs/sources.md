# reduce-llm-api-costs

## Keyword notes

Primary and secondary keywords come from the owner's brief in `Blogs/Blog List 01.txt`.
Search volumes were NOT measured for these terms in this session (no Keyword Planner
access). Re-check them before investing in more articles on the same cluster.

## Sources (all accessed 2026-10-03)
- Claude pricing: https://platform.claude.com/docs/en/about-claude/pricing (list prices: Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok; output 5x input; 1 token ~ 4 chars ~ 0.75 words; newer tokenizer ~30% more tokens; tool-use system prompt 286-675 tokens; caching and batch discounts stack)
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching (5-min write 1.25x, hit 0.1x, 5-minute default lifetime)
- Batch processing: https://platform.claude.com/docs/en/build-with-claude/batch-processing (50% cost reduction, most batches finish in under 1 hour)
- Vision: https://platform.claude.com/docs/en/build-with-claude/vision (ceil(w/28) x ceil(h/28) visual tokens; caps 1,568 standard / 4,784 high-res)
- Ong et al., RouteLLM, 2024 (ICLR 2025): https://arxiv.org/abs/2406.18665 (cost reduced by over 2x without sacrificing response quality; confirmed via search results, arXiv blocked)
- Pan et al., LLMLingua-2, Findings of ACL 2024: https://aclanthology.org/2024.findings-acl.57/ (2x-5x compression, 1.6x-2.9x end-to-end latency; confirmed via search results)
- MDify's own worked example: frontend/lib/siteContent.js TOKEN_EXAMPLE (667 vs 2,235 vs 3,381 tokens; 70% / 80%). Features checked in frontend/lib/formats.js and backend*/app/common/profiles.py.

## Worked examples and code

All worked examples are labelled as illustrations in the article and figure captions.
Every number in them is derived from the sources above; the arithmetic lives in
`visuals.mjs` next to this file. Python snippets in the article were run before
publishing (Python 3.11, standard library only).

## LLMiser rebrand re-verification (2026-10-20)

The article was rebranded from MDify to LLMiser and every claim was re-checked. Current sources:

- Claude pricing, fetched 2026-10-20: https://platform.claude.com/docs/en/about-claude/pricing. Haiku 5.5 $0.10/$0.50 (prompts up to 100k tokens; $0.50/$2.50 above), Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok. Output is 5x input on every one of them. Cache hits: 0.1x standard, 0.05x on Sonnet 5.5 and Opus 5.5, 0.025x on Fable 5.1. 5-minute write 1.25x, 1-hour write 2x. Batch 50% on input and output. Caching and batch discounts stack. Claude 4.6 and later (except Haiku 5.5) bill the full 1M context at standard rates. Tool-use system prompt 286 tokens (Opus/Sonnet/Haiku 5.5, auto) up to 804 (Opus 4.7, any/tool). The page no longer states a words-per-token figure.
- Batch processing, fetched 2026-10-20: https://platform.claude.com/docs/en/build-with-claude/batch-processing. 50% cost reduction, most batches finish in less than 1 hour.
- Claude vision, fetched 2026-10-20: https://platform.claude.com/docs/en/build-with-claude/vision. ceil(w/28) x ceil(h/28) visual tokens. Standard tier (all models before Claude 4.7): 1,568 px long edge and 1,568 tokens max. High-resolution tier (Claude 4.7 and later): 2,576 px and 4,784 tokens.
- House worked example (blog-pipeline/03-BRAND-ENTITY.md): 500-word US Letter page at 150 dpi, about 667 text tokens (0.75 words per token), 2,714 image patches, capped near 1,568 on the standard tier. 2,235 vs 667 tokens (about 70%) standard, 3,381 vs 667 (about 80%) high resolution. Replaces the old MDify siteContent TOKEN_EXAMPLE reference.
- Ong et al., RouteLLM, ICLR 2025: https://arxiv.org/abs/2406.18665. Confirmed via search results 2026-10-20: cost reduced by over 2x without sacrificing response quality on public benchmarks.
- Pan et al., LLMLingua-2, Findings of ACL 2024: https://aclanthology.org/2024.findings-acl.57/. Confirmed via search results 2026-10-20: 2x-5x compression, 1.6x-2.9x end-to-end latency.
- LLMiser app features checked 2026-10-20: frontend/lib/formats.js (20 files per batch), frontend/lib/siteContent.js, backendN/app/common/profiles.py (RAG-ready <!-- chunk-boundary --> marker), token estimate = characters / 4 (frontend/components/OutputStatusBar.js).
