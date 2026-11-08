# hidden-token-tax-rag-pipelines

## Keyword notes

Primary and secondary keywords come from the owner's brief in `Blogs/Blog List 01.txt`.
Search volumes were NOT measured for these terms in this session (no Keyword Planner
access). Re-check them before investing in more articles on the same cluster.

## Sources (all accessed 2026-10-03)
- Chroma, Evaluating Chunking Strategies for Retrieval, July 2024: https://research.trychroma.com/evaluating-chunking (up to 9% recall difference; token efficiency and overlap redundancy; confirmed via search results)
- Anthropic, Introducing Contextual Retrieval, 2024-09-19: https://www.anthropic.com/news/contextual-retrieval (-35% / -49% / -67% top-20 retrieval failure rate; $1.02 per million document tokens; under 200,000 tokens ~500 pages consider skipping RAG). Fetched directly.
- Liu et al., Lost in the Middle, TACL 2024: https://aclanthology.org/2024.tacl-1.9/ (direct fetch blocked by the network policy; abstract confirmed via search results)
- Chroma, Context Rot, July 2025: https://research.trychroma.com/context-rot (18 models, performance degrades with input length; confirmed via search results, direct fetch blocked)
- MDify's own worked example: frontend/lib/siteContent.js TOKEN_EXAMPLE (667 vs 2,235 vs 3,381 tokens; 70% / 80%). Features checked in frontend/lib/formats.js and backend*/app/common/profiles.py.

## Worked examples and code

All worked examples are labelled as illustrations in the article and figure captions.
Every number in them is derived from the sources above; the arithmetic lives in
`visuals.mjs` next to this file. Python snippets in the article were run before
publishing (Python 3.11, standard library only).

## LLMiser rebrand re-verification (2026-10-20)

The article was rebranded from MDify to LLMiser and every claim was re-checked. Current sources:

- Chroma, Evaluating Chunking Strategies (3 Jul 2024), fetched 2026-10-20 at https://www.trychroma.com/research/evaluating-chunking. Up to 9% recall difference. Token-wise IoU counts redundant overlap tokens once.
- Anthropic, Introducing Contextual Retrieval (19 Sep 2024), fetched 2026-10-20: https://www.anthropic.com/news/contextual-retrieval. Top-20 retrieval failure rate -35% (5.7% to 3.7%), -49% with contextual BM25 (2.9%), -67% with reranking (1.9%). $1.02 per million document tokens with prompt caching. Under 200,000 tokens (about 500 pages) you can include the whole knowledge base.
- Liu et al., Lost in the Middle, TACL 2024: https://aclanthology.org/2024.tacl-1.9/. Confirmed via search results 2026-10-20: performance is highest when relevant information is at the beginning or end of the context.
- Chroma, Context Rot (14 Jul 2025), fetched 2026-10-20 at the new URL https://www.trychroma.com/research/context-rot (old research.trychroma.com URL redirects). 18 LLMs, performance grows increasingly unreliable as input length grows.
- LLMiser app features checked 2026-10-20: frontend/lib/formats.js (20 files per batch), frontend/lib/siteContent.js, backendN/app/common/profiles.py (RAG-ready <!-- chunk-boundary --> marker), token estimate = characters / 4 (frontend/components/OutputStatusBar.js).
