# 03. Brand Entity and Claims Policy

## What LLMiser is

LLMiser is a free, open-source (GPL-3.0) **LLM cost optimizer for document inputs**,
made by DevBehindYou (<https://github.com/DevBehindYou/LLMiser>, devbehindyou@gmail.com).
It turns PDFs, Office files, images and ZIP projects into editable Markdown so you can
remove unnecessary context before sending it to an AI assistant or a RAG pipeline.
Tagline: **Make Every Token Count.** Site: <https://llmiser.devbehindyou.com>.
LLMiser was called MDify until October 2026. Write "formerly MDify" only where the
history matters; `check.mjs` rejects any other mention of the old name.

Spelling: **LLMiser** (LLM in capitals, "iser" in lower case). Never "LLMIser" or "Llmiser".

## Entity separation

- **LLMiser** is the product. It is the only entity an article promotes.
- **Don't name the engines or hosting behind LLMiser** (owner's decision,
  28 September 2026). Describe what it does: "converts", "reads scanned pages with
  text recognition". The Terms of Service (`/terms`, section 10) credit the components.
- Provider docs (Anthropic, OpenAI and others) are cited as sources for facts about
  their own models and prices, never as partners. No partnership claims.

## What LLMiser can do (verified against the code, 2026-10-20)

Check `frontend/lib/formats.js` and `frontend/lib/siteContent.js` before each article.

- **Documents:** PDF, DOCX, XLSX, XLS, PPTX, EPUB, HTML/HTM, CSV, TSV, JSON, XML, TXT and Markdown.
- **Scanned PDFs:** text pages are read directly, picture-only pages go through text
  recognition (up to 100 scanned pages per file).
- **Images** (text recognition, English): PNG, JPG/JPEG, WebP, TIFF, BMP, GIF (first frame).
- **ZIP files:** one combined Markdown file, a `PROJECT_INDEX.md` and a `manifest.json`.
- **Profiles:** Standard, Clean, Compact and RAG-ready (adds a `<!-- chunk-boundary -->`
  marker before every `##` heading).
- **Limits:** 15 MB per document or ZIP, 10 MB per image, 2,000 files inside a ZIP,
  20 files per batch.
- **Output tools:** editable preview, copy, download `.md`, download all as `.zip`, and a
  token estimate. The estimate is **characters divided by four**, a rough heuristic, not a
  model tokenizer or a billing measurement.
- **Privacy:** files are uploaded and processed on the service (not in the browser),
  kept in private storage with a default 48-hour retention and documented administrative
  exceptions, never used to train AI models. Link `/privacy` rather than paraphrasing.

## What LLMiser doesn't do (never attribute it)

- Model routing, prompt caching, batch API calls, provider billing integration or
  automatic bill reduction. Articles may teach these techniques, clearly as things the
  reader does with their provider.
- A browser or Chrome extension (not shipped).
- More than 100 scanned pages per PDF, legacy `.doc`/`.ppt`, reverse conversion
  (Markdown to PDF or Word), non-English OCR, accounts or team workspaces.
- Guaranteed savings. There is no universal percentage.

## Claims policy

Follows `project-docs/rebranding-research/LLMiser_Rebranding_Research/15_LEGAL_AND_CLAIMS.md`.

- Any token or cost number is a **worked example** or a **cited figure**. State the
  baseline and input path (PDF text plus page image, extracted text, Markdown), the
  model or tier, the tokenizer or rule of thumb, the price date, and what may be lost.
- The house example (used in several articles): one 500-word US Letter page at 150 dpi.
  Text at the common rule of thumb of 0.75 words per token is about 667 tokens. The page
  image is 1275 x 1650 px, which is 2,714 visual tokens on Claude's high-resolution tier
  (Claude 4.7 and later) and capped at about 1,568 on the standard tier. So the page is
  about 2,235 tokens (standard) or 3,381 (high resolution) when sent as text plus image,
  against about 667 as Markdown: roughly 70% or 80% less in this example. Claude 4.7 and
  later count about 30% more text tokens than the rule of thumb, which changes the exact
  figures but not the conclusion. Apps that send extracted text only save much less.
- No percentage or multiplier as a promise in a title, description or banner hook.
- Smaller input is not automatically better input. Mention what Markdown can lose
  (charts, photos, layout) wherever savings come up.
- No fabricated quotes, statistics, benchmarks, case studies, rankings or authors.
  Byline `DevBehindYou` unless a real, named person wrote the piece.

## Voice

Technical, direct, useful. Show trade-offs and limits, not only benefits. Opinions are
welcome when earned. Talk about cost as engineering: find the waste, remove it, measure.

## Call to action

One per article. Link the converter (`/`) and the cost page (`/usecase`, "how to measure
savings for your model"). Link a sibling article when it carries the detail.
