# reduce-llm-token-usage

## Keyword notes

Primary and secondary keywords come from the owner's brief in `Blogs/Blog List 01.txt`.
Search volumes were NOT measured for these terms in this session (no Keyword Planner
access). Re-check them before investing in more articles on the same cluster.

## Sources (all accessed 2026-10-03)
- Claude pricing: https://platform.claude.com/docs/en/about-claude/pricing (list prices: Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok; output 5x input; 1 token ~ 4 chars ~ 0.75 words; newer tokenizer ~30% more tokens; tool-use system prompt 286-675 tokens; caching and batch discounts stack)
- PDF support: https://platform.claude.com/docs/en/build-with-claude/pdf-support (each page as image + extracted text; 1,500-3,000 text tokens per page; Bedrock: ~1,000 tokens text-only vs ~7,000 full visual for a 3-page PDF)
- Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching (5-min write 1.25x, hit 0.1x, 5-minute default lifetime)
- Chroma, Context Rot, July 2025: https://research.trychroma.com/context-rot (18 models, performance degrades with input length; confirmed via search results, direct fetch blocked)
- Chroma, Evaluating Chunking Strategies for Retrieval, July 2024: https://research.trychroma.com/evaluating-chunking (up to 9% recall difference; token efficiency and overlap redundancy; confirmed via search results)
- MDify's own worked example: frontend/lib/siteContent.js TOKEN_EXAMPLE (667 vs 2,235 vs 3,381 tokens; 70% / 80%). Features checked in frontend/lib/formats.js and backend*/app/common/profiles.py.

## Worked examples and code

All worked examples are labelled as illustrations in the article and figure captions.
Every number in them is derived from the sources above; the arithmetic lives in
`visuals.mjs` next to this file. Python snippets in the article were run before
publishing (Python 3.11, standard library only).

## LLMiser rebrand re-verification (2026-10-20)

The article was rebranded from MDify to LLMiser and every claim was re-checked. Current sources:

- OpenAI, What are tokens and how to count them (help article, confirmed via search results 2026-10-20, direct fetch returns 403): https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them. 1 token is about 4 characters or 0.75 English words.
- Claude glossary, fetched 2026-10-20: https://platform.claude.com/docs/en/about-claude/glossary. Claude 4.7 and later use a tokenizer that produces about 30% more tokens for the same text than earlier models, on which a token is about 3.5 English characters.
- Claude pricing, fetched 2026-10-20: https://platform.claude.com/docs/en/about-claude/pricing. Haiku 5.5 $0.10/$0.50 (prompts up to 100k tokens; $0.50/$2.50 above), Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok. Output is 5x input on every one of them. Cache hits: 0.1x standard, 0.05x on Sonnet 5.5 and Opus 5.5, 0.025x on Fable 5.1. 5-minute write 1.25x, 1-hour write 2x. Batch 50% on input and output. Caching and batch discounts stack. Claude 4.6 and later (except Haiku 5.5) bill the full 1M context at standard rates. Tool-use system prompt 286 tokens (Opus/Sonnet/Haiku 5.5, auto) up to 804 (Opus 4.7, any/tool). The page no longer states a words-per-token figure.
- Claude PDF support, fetched 2026-10-20: https://platform.claude.com/docs/en/build-with-claude/pdf-support. Each page is converted into an image and its extracted text is sent alongside. Text typically 1,500-3,000 tokens per page depending on density. Amazon Bedrock Converse API (Claude Opus 4.6 and earlier): about 1,000 tokens text-only versus about 7,000 with full visual understanding for a 3-page PDF.
- Chroma, Context Rot (14 Jul 2025), fetched 2026-10-20 at the new URL https://www.trychroma.com/research/context-rot (old research.trychroma.com URL redirects). 18 LLMs, performance grows increasingly unreliable as input length grows.
- Chroma, Evaluating Chunking Strategies (3 Jul 2024), fetched 2026-10-20 at https://www.trychroma.com/research/evaluating-chunking. Up to 9% recall difference. Token-wise IoU counts redundant overlap tokens once.
- LLMiser app features checked 2026-10-20: frontend/lib/formats.js (20 files per batch), frontend/lib/siteContent.js, backendN/app/common/profiles.py (RAG-ready <!-- chunk-boundary --> marker), token estimate = characters / 4 (frontend/components/OutputStatusBar.js).
