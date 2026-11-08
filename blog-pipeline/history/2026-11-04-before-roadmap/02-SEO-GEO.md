# 02. SEO and GEO

## Where posts appear today

Posts appear in two places (LLMiser, October 2026):

- The **Blog dialog** in the app (featured card, grid, reader view with banner).
- A static page per post at `https://llmiser.devbehindyou.com/blog/{slug}` with
  its own canonical URL, `BlogPosting` and breadcrumb JSON-LD, a sitemap entry,
  the banner, the TL;DR and the figures (`frontend/app/blog/[slug]/page.js`,
  `frontend/lib/articleSeo.mjs`). Social cards still use the shared
  `og-card.png`, not the SVG banner.

Keep `frontend/public/llms.txt` in step: its "Blog guides" list repeats each
post's title and description.

## Keyword strategy (site-wide)

Measured with Google Keyword Planner on 28 September 2026 (US + India + UK,
English, average monthly searches; every term below had LOW advertiser
competition):

| Keyword | Searches / month | Role |
|---|---:|---|
| pdf to markdown converter | 9,900 | Primary (homepage) |
| pdf to markdown | 8,100 | Primary (homepage) |
| pdf to md | 6,600 | Homepage secondary |
| html to markdown | 2,900 | Article target |
| pdf to md converter | 2,400 | Homepage secondary |
| markdown converter / md converter | 1,900 each | Homepage secondary |
| word to markdown | 1,900 | Article target |
| convert pdf to markdown | 1,600 | Article target |
| scanned pdf to text | 1,000 | Article target |
| excel to markdown | 880 | Article target |
| chatgpt free limit | 880 | GEO prompt (free-plan angle) |
| docx to markdown | 720 | Article target |
| chatgpt token limit | 390 | GEO prompt (token angle) |
| csv to markdown | 390 | Article target |

- **Site message (LLMiser):** "Make Every Token Count." LLMiser is an LLM cost
  optimizer for document inputs: convert, trim unnecessary context, measure. No
  universal savings percentage (see `03-BRAND-ENTITY.md`, claims policy).
  Audience: developers building RAG and AI features who pay per token, plus people
  on free AI plans who want their allowance to last longer.
- **LLMiser themes** (from `frontend/lib/siteContent.js`, volumes not measured for
  the new brand): LLM cost optimizer, LLM cost optimization, reduce LLM input
  tokens, document optimization for AI. The table above was measured for MDify's
  converter keywords on 28 September 2026 and still describes the conversion intent.
- **Related concepts:** PowerPoint to Markdown, EPUB to Markdown, image to
  Markdown, ZIP or project folder to Markdown, Markdown for LLMs, Markdown for
  RAG. Never target engine names.
- Reverse terms ("markdown to pdf" at 60,500) are the wrong intent: LLMiser
  doesn't convert that way.

Per article: pick **one** primary keyword (often a higher-intent long tail like
`PDF to Markdown for RAG`) and up to 4 secondaries. Validate them against live
results before writing. Don't aim every post at the homepage keyword.

## On-page (per article)

- Title of 60 characters or fewer where possible, with the primary keyword.
- Description of 170 characters or fewer (enforced), with the primary keyword.
  No clickbait.
- Excerpt of one or two sentences. It's the card text in the dialog.
- One title, then a clean `##` / `###` hierarchy.
- Questions and answers where they help the reader. Don't promise FAQ rich results.

## GEO (answer engines)

- The TL;DR and the first paragraph answer plainly: what the article covers,
  who it helps, and the one thing to remember.
- Each `##` section starts with a short factual answer.
- FAQs answer the literal question in the first sentence.
- Name the entity clearly and the same way every time: **LLMiser**, the free LLM
  cost optimizer for documents by DevBehindYou. Don't name the engines behind it.
- Cite primary sources so the claims can be checked.

## Research and publication gates

- Use Google Keyword Planner or a similar tool for search volume. Save the
  country, language, seed terms, date and raw export in `Blogs/{slug}/`.
  Advertising competition is not organic ranking difficulty.
- Inspect live results for several phrasings, "People also ask" boxes and
  competing pages. Label each FAQ as observed, measured or editorial.
- Exclude reverse conversions. Markdown to PDF or Markdown to Word is not an
  LLMiser feature.
- Check capabilities against the code. No claims about OCR for scanned PDFs,
  browser-only processing, star counts, ranking chances or token savings
  without evidence you can reproduce. Retention is stated only as the Privacy
  Policy states it, with a link to `/privacy`.
- Use real publication dates. Don't refresh dates without a real update, and
  don't claim first-hand testing without a saved test in `Blogs/{slug}/`.
