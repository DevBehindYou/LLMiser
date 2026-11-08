# markdown-vs-pdf-llm-tokens

## Keyword notes

Primary and secondary keywords come from the owner's brief in `Blogs/Blog List 01.txt`.
Search volumes were NOT measured for these terms in this session (no Keyword Planner
access). Re-check them before investing in more articles on the same cluster.

## Sources (all accessed 2026-10-03)
- Claude pricing: https://platform.claude.com/docs/en/about-claude/pricing (list prices: Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10, Opus 5.5 $4/$20, Fable 5.1 $10/$50 per MTok; output 5x input; 1 token ~ 4 chars ~ 0.75 words; newer tokenizer ~30% more tokens; tool-use system prompt 286-675 tokens; caching and batch discounts stack)
- PDF support: https://platform.claude.com/docs/en/build-with-claude/pdf-support (each page as image + extracted text; 1,500-3,000 text tokens per page; Bedrock: ~1,000 tokens text-only vs ~7,000 full visual for a 3-page PDF)
- Vision: https://platform.claude.com/docs/en/build-with-claude/vision (ceil(w/28) x ceil(h/28) visual tokens; caps 1,568 standard / 4,784 high-res)
- MDify's own worked example: frontend/lib/siteContent.js TOKEN_EXAMPLE (667 vs 2,235 vs 3,381 tokens; 70% / 80%). Features checked in frontend/lib/formats.js and backend*/app/common/profiles.py.

## Worked examples and code

All worked examples are labelled as illustrations in the article and figure captions.
Every number in them is derived from the sources above; the arithmetic lives in
`visuals.mjs` next to this file. Python snippets in the article were run before
publishing (Python 3.11, standard library only).

## LLMiser rebrand re-verification (2026-10-20)

The article was rebranded from MDify to LLMiser and every claim was re-checked. Current sources:

- Claude PDF support, fetched 2026-10-20: https://platform.claude.com/docs/en/build-with-claude/pdf-support. Each page is converted into an image and its extracted text is sent alongside. Text typically 1,500-3,000 tokens per page depending on density. Amazon Bedrock Converse API (Claude Opus 4.6 and earlier): about 1,000 tokens text-only versus about 7,000 with full visual understanding for a 3-page PDF.
- Claude vision, fetched 2026-10-20: https://platform.claude.com/docs/en/build-with-claude/vision. ceil(w/28) x ceil(h/28) visual tokens. Standard tier (all models before Claude 4.7): 1,568 px long edge and 1,568 tokens max. High-resolution tier (Claude 4.7 and later): 2,576 px and 4,784 tokens.
- OpenAI, What are tokens and how to count them (help article, confirmed via search results 2026-10-20, direct fetch returns 403): https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them. 1 token is about 4 characters or 0.75 English words.
- Claude glossary, fetched 2026-10-20: https://platform.claude.com/docs/en/about-claude/glossary. Claude 4.7 and later use a tokenizer that produces about 30% more tokens for the same text than earlier models, on which a token is about 3.5 English characters.
- House worked example (blog-pipeline/03-BRAND-ENTITY.md): 500-word US Letter page at 150 dpi, about 667 text tokens (0.75 words per token), 2,714 image patches, capped near 1,568 on the standard tier. 2,235 vs 667 tokens (about 70%) standard, 3,381 vs 667 (about 80%) high resolution. Replaces the old MDify siteContent TOKEN_EXAMPLE reference.
- LLMiser app features checked 2026-10-20: frontend/lib/formats.js (20 files per batch), frontend/lib/siteContent.js, backendN/app/common/profiles.py (RAG-ready <!-- chunk-boundary --> marker), token estimate = characters / 4 (frontend/components/OutputStatusBar.js).
