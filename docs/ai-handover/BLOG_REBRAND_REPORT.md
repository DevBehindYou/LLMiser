# Blog rebrand report

20 October 2026. Scope: the eight articles, eight banners and forty figures listed in [PROGRESS.md](PROGRESS.md), plus the narrow article-page fixes they needed. Nothing was committed, pushed or deployed. MDify and MDify-Pro source files were not edited.

## How the visuals were rebuilt

The 48 SVGs were generated from code, not drawn by hand. The generator lived in MDify-Pro's private `MDify-Blog-Generation-Pipeline/` (one `visuals.mjs` spec and `sources.md` per article, a shared `visuals/kit.mjs`). It was copied, unchanged in MDify-Pro, into `LLMiser/blog-pipeline/` and rebranded there:

- `blog-pipeline/` is excluded from Git through `.git/info/exclude` because LLMiser is a public repository. It holds the style, SEO/GEO, brand-entity and output-format rules, `check.mjs`, the visual kit, the per-article specs and sources, and the owner's topic briefs.
- `visuals/kit.mjs`:
  - **Banners:** a new LLMiser frame replaces the old lavender "aurora" style. It has the ink ground, a 32 px pixel grid with amber and periwinkle glows, the Prompt L mark drawn as pixel rectangles from the icon kit grid, the "LLMiser" wordmark and a kicker chip. The hook is set in Patrick Hand, the sub line in mono, the site and tagline sit at the bottom, and an amber-to-periwinkle hairline runs along the edge. Each article's illustration sits on a clipped paper card on the right.
  - **Figures:** every figure now ends with a small signature: the Prompt L mark and `LLMiser · llmiser.devbehindyou.com`. Figures keep the app's theme variables (`--text`, `--surface-2`, `--bf-s1/2/3`…), so they follow light and dark mode.
- `check.mjs`:
  - **Brand:** rejects the old brand name (except "formerly MDify"), misspellings of LLMiser and links to old hosts.
  - **Capabilities:** rejects text that attributes routing, caching, automatic bill cuts or a browser extension to LLMiser.
  - **Claims:** warns on percentage promises in titles.
- `03-BRAND-ENTITY.md` was rewritten for LLMiser: capabilities verified in code, things it doesn't do, the claims policy, and the house worked example with its assumptions.

Rebuild one article: `node blog-pipeline/visuals/build.mjs <slug>` from the LLMiser root (`--all` for every article).

## Editorial and claim decisions

| Article | Decisions |
| --- | --- |
| Markdown vs Raw PDFs | Rewritten around a documented **worked example**: 500-word US Letter page, 150 dpi, 0.75 words per token, image tokens per Claude's vision docs. The old banner hook "70% fewer tokens" became "Same page, fewer tokens" plus "worked example: 2,235 → 667 tokens". Added the tokenizer caveat (Claude 4.7+ count about 30% more text tokens), the input-path caveat and how to measure. The old "Cut PDF token costs by 70%" product claim was removed. |
| How to Reduce LLM API Costs | Title no longer promises "by 50%" (that figure is only the Batch API discount). Prices re-checked: Haiku 5.5 replaces Haiku 4.5 in the price chart. Cache hits are 0.05x on Sonnet 5.5 and Opus 5.5 (the article had 0.1x). The worked example was recomputed: 5.88¢ → 1.87¢ (−68%), 0.94¢ batched (−84%). The cache chart now shows both 0.1x and 0.05x. The capability boundary is stated: batching, caching and routing are set up with the provider. The banner's "-50%" stamp became "trimmed". |
| PDFs Are Expensive for AI | "7x" kept, but now attributed to Claude on Amazon Bedrock's Converse API, as the source says. Tier names corrected. The 70% figure is the cited worked example, with the text-only caveat. |
| Stop Sending Whole Documents | LLMiser naming. Caching rates updated. Added that the 1M-token window is billed at standard rates on Claude 4.6+ (except Haiku 5.5), and that this doesn't cure context rot. |
| Hidden Token Tax | The excerpt claim "Most RAG pipelines send five times the context" (unsupported) became "An untuned RAG pipeline can send several times…". Chroma URLs moved to `www.trychroma.com/research/…`. |
| Real Cost of RAG | LLMiser naming. Caching rates updated. Says plainly that LLMiser doesn't build the index or promise better retrieval. Price check dated. |
| Why Your LLM Token Usage Is So High | The words-per-token source moved from Claude's pricing page (which no longer states it) to OpenAI's tokens guide plus Claude's glossary. The tool-use overhead range was updated to 286–804 tokens. The FAQ now says LLMiser's estimate is characters ÷ 4. |
| Why Your LLM Bill Is Too High | Title "Probably 2x Higher Than It Needs to Be" became "Why Your LLM Bill Is Too High, and Where the Waste Hides" (slug unchanged). Removed "most apps have at least three leaks". The FAQ "Is 2x a guarantee?" became "How much will fixing these leaks save?". The tier chart now runs $0.10 (Haiku 5.5) to $10 (Fable 5.1). |

Across all eight articles:

- Every product mention is now **LLMiser**, positioned as the free LLM cost optimizer for documents.
- Calls to action point to `/` and to `/usecase` ("how to measure savings for your model").
- Sibling articles link to each other where one carries the detail.
- Slugs, file names, asset folders, publication dates and author are unchanged.

## Sources verified on 20 October 2026

Fetched directly:

- [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- [Claude PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support)
- [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- [Claude glossary](https://platform.claude.com/docs/en/about-claude/glossary)
- [Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Chroma: Context Rot](https://www.trychroma.com/research/context-rot)
- [Chroma: Evaluating Chunking](https://www.trychroma.com/research/evaluating-chunking)

Confirmed through search results (direct fetch blocked or not needed):

- [OpenAI tokens guide](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
- [RouteLLM](https://arxiv.org/abs/2406.18665)
- [LLMLingua-2](https://aclanthology.org/2024.findings-acl.57/)
- [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/)

Details per article are in `blog-pipeline/Blogs/<slug>/sources.md` ("LLMiser rebrand re-verification").

## App changes made for the blog

- `frontend/app/blog/[slug]/page.js`:
  - Renders the article's banner.
  - Renders the TL;DR and figure captions as inline Markdown, so bold keywords and source links display correctly. Before this, both showed raw `**` and `[text](url)` markup.
- `frontend/public/llms.txt`: the blog list now uses the new titles and descriptions, and the Blog line describes the content instead of "preserved during the rebrand".
- Comments in `lib/blog.mjs`, `components/BlogModal.js`, `app/globals.css` and `content/blog/README.md` now point to the local pipeline instead of the MDify one.
- `lib/blogPosts.generated.json` was regenerated with `npm run blog:index`.

## Tests actually run (from `frontend/`, Node 22)

| Command | Result |
| --- | --- |
| `node blog-pipeline/check.mjs` on all 8 articles (from the repo root) | 8 × PASS, 0 errors, 0 warnings (reports in `blog-pipeline/Outputs/`) |
| `npm run blog:index` / `npm run blog:check` | 8 published posts, index current |
| `node --test test/blog.test.mjs test/domainMigration.test.mjs test/seo.test.mjs` | 24/24 pass |
| `npm test` | 221/221 pass |
| `npm run lint` | No warnings or errors |
| `npm run build` | Compiled successfully, 8 static article routes |
| `node scripts/check-rebrand.mjs http://localhost:3101` | passed, 88 checks, 13 public pages (run before and after the article-page change) |

## Visual checks

Production build on port 3101, in the built-in browser:

- **Article pages, desktop, dark theme:** `markdown-vs-pdf-llm-tokens`, `reduce-llm-api-costs`, `why-your-llm-bill-is-too-high`, `rag-cost-optimization` and `hidden-token-tax-rag-pipelines`. Banner layout, card art and hook width were checked. One overflow was found and fixed: the token-tax sub line ran into the illustration card, so it was shortened.
- **Article pages, 375 px:** `hidden-token-tax-rag-pipelines` in dark theme, and the `markdown-vs-pdf-llm-tokens` figures in light theme.
- **Blog dialog, desktop, light theme:** featured card and grid banners.
- **Standalone figure:** `reduce-llm-api-costs/worked-example.svg`, to check the new signature and the recomputed numbers.
- **DOM check:** on `/blog/reduce-llm-api-costs`, the banner renders plus 5 figures, the TL;DR has no raw `**`, and captions have no raw link markup.

Not every one of the 48 SVGs was inspected individually in both themes. The figures come from one kit with unchanged layouts. Only the banner frame and the signature are new.

## Unresolved items and notes for the owner

- **Prices change.** The cost articles quote Anthropic list prices as of 20 October 2026. When they change, update the specs and the text together.
- **Public research.** `project-docs/rebranding-research/` (agent prompts, competitor registers) and `project-docs/brand/make-icons.mjs` are untracked in this public repository. Decide whether they should be published before the first commit.
- **Social cards.** Each article still shares `og-card.png` on social media. A per-article raster card from each banner would be a separate task.
- **Keyword data.** No keyword volumes were measured for the new LLMiser themes. Primary keywords are unchanged per article.
- **Session tooling.** For the visual checks, an `llmiser-prod` entry was added to MDify-Pro's local `.claude/launch.json`. It's tooling only and not part of either app.
