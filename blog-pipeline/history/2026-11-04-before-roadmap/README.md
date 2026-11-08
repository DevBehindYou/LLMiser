# LLMiser Blog Pipeline

A repeatable, human-in-the-loop workflow for writing accurate LLMiser articles
and publishing them in the **Blog dialog** of the app (the popup behind the
"Blog" link in the header and footer).

This is a content tool you run in your editor or Claude Code. Nothing in this
folder ships to the browser. The app only reads the finished Markdown files in
`frontend/content/blog/`.

Adapted from the DevBehindYou blog builders (8-phase SOP, GEO strategy and
humanization rules), tuned for LLMiser's product, voice and publishing path.

## The pipeline (run the phases in order)

```
Topic -> Keyword research -> Outline -> Source research -> Draft ->
Code examples -> SEO/GEO metadata -> Fact check -> Internal links ->
Quality check (check.mjs) -> Output (frontend/content/blog/{slug}.md) ->
Publish (npm run blog:index, commit, push)
```

1. **Topic.** Pick one from `topics.md` or propose one for LLMiser's readers
   (AI/RAG/LLM builders, developers, document workflows). Fix a URL-safe
   `{slug}` now and never change it. Create the working folder
   `Blogs/{slug}/`.
2. **Keyword research.** Confirm one primary keyword and up to 4 secondaries
   against live search results (see `02-SEO-GEO.md`). Save the notes in
   `Blogs/{slug}/research.md`: queries, date, what competing pages cover and
   the gap LLMiser can fill.
3. **Outline.** Title, TL;DR, 4 to 6 `##` sections (each opening with a 25 to
   40 word answer), 5 or 6 FAQs, and the frontmatter from `04-OUTPUT-FORMAT.md`.
   Save as `Blogs/{slug}/outline.md`.
4. **Source research.** Collect a primary source for every claim. Prefer
   official docs and the LLMiser repo itself (research only: articles never name
   the engines behind LLMiser) and
   references dated 2024 to 2026. List them in `Blogs/{slug}/sources.md`.
5. **Draft.** 1,200 to 2,000 words, following `01-STYLE-RULES.md`. The Blog
   dialog shows the Markdown as plain monospace text, so write for that: short
   paragraphs, `###` headings, code blocks, and simple tables. Links are
   clickable and headings are tinted, but the text stays plain Markdown.
5b. **Visuals.** Every article needs a banner and at least 4 figures
   (diagrams or charts). Write `Blogs/{slug}/visuals.mjs` with the kit in
   `visuals/kit.mjs`, then run
   `node blog-pipeline/visuals/build.mjs {slug}`. It writes
   `frontend/public/blog/{slug}/*.svg`. See "Visuals" below.
6. **Code examples.** Real, runnable snippets only. Before you show an API call,
   read `frontend/app/api/convert/route.js` and use the fields it actually
   accepts (`file`, `profile`). Never invent endpoints, flags or response fields.
7. **SEO and GEO metadata.** Fill the frontmatter: title, description (170
   characters max), excerpt, keywords, tags, category, dates.
8. **Fact check.** Check every number and capability against a source or the
   code. Token and size figures are **estimates or examples**, never
   guarantees. Do not fabricate quotes, benchmarks, authors or statistics.
   Use `03-BRAND-ENTITY.md` as the list of what LLMiser can and can't do.
9. **Internal links.** Point readers to the converter (`/`), "Why Use It"
   (`/usecase`) and, where privacy comes up, the Privacy Policy (`/privacy`).
   One clear call to action per article.
10. **Quality check.** Run the scan from the repo root and fix every error:
    ```bash
    node blog-pipeline/check.mjs frontend/content/blog/{slug}.md
    ```
    It validates the frontmatter with the same code the app uses, then scans
    for em dashes, semicolons, banned words, brand mistakes and missing
    sections. The report is saved to `Outputs/{slug}.check.txt`. Then read the
    article aloud once.
11. **Output.** The finished file lives at `frontend/content/blog/{slug}.md`.
    Keep `draft: true` until you're ready.
12. **Publish.** Set `draft: false`, then from `frontend/`:
    ```bash
    npm run blog:index
    ```
    This rebuilds `frontend/lib/blogPosts.generated.json`, the list the Blog
    dialog imports. Commit both files and push. `npm run build` also runs the
    index step, and `npm test` fails if the JSON is out of date.

## Visuals

The Blog dialog draws SVG files from `frontend/public/blog/{slug}/` inline, so
they follow the app's light and dark theme. Rules:

- **Banner** (1200 x 400, built with `banner()`): the aurora gradient of the
  dialog's featured card, a short hook in the hand-drawn face, art on the right.
  Set `banner` and `bannerAlt` in the frontmatter.
- **Figures** (600 wide, built with `figure()` and its parts: `hbars`,
  `stacked`, `flow`, `decision`, `fork`, `panels`, `funnel`, `cards`, `tiles`,
  `waterfall`, `custom`). Place each on its own line:
  `![alt text](/blog/{slug}/{name}.svg "Caption with [source](https://...)")`.
- **Colors** come only from the kit: `s1` amber (what you keep, savings), `s2`
  violet (extra context, page images), `s3` pink (waste). The palette passed
  the dataviz validator in both themes. Text stays in ink colors.
- **Numbers** in a figure come from the article's sources. Keep the arithmetic
  in `visuals.mjs` and label illustrations as illustrations in the caption.
- Alt text describes what the figure shows, including its key numbers.
- Check the result: open the dialog in light and dark mode and at 375 px.
  Figures scroll sideways inside their frame on narrow phones.

`check.mjs` fails an article without a banner, with fewer than 4 figures, or
with a missing or unsafe SVG. The app's build refuses SVGs with scripts,
event handlers or links to other files.

## How it maps to the app

| Piece | Where |
|---|---|
| Post files (Markdown + YAML frontmatter) | `frontend/content/blog/{slug}.md` |
| Parser and validation (shared with `check.mjs`) | `frontend/lib/blog.mjs` |
| Index builder (`npm run blog:index`, runs before `dev` and `build`) | `frontend/scripts/build-blog-index.mjs` |
| Generated post list | `frontend/lib/blogPosts.generated.json` |
| Blog dialog (featured card, 3-up grid, reader view) | `frontend/components/BlogModal.js` |
| Inline banner/figure renderer | `frontend/components/BlogVisual.js`, `frontend/lib/blogRender.mjs` |
| Visual kit and builder | `visuals/kit.mjs`, `visuals/build.mjs` |
| Generated visuals | `frontend/public/blog/{slug}/*.svg` |
| Tests | `frontend/test/blog.test.mjs` |

The dialog shows a post with `featured: true` (otherwise the newest) as the
featured card and the rest in the grid, each with its banner. In the reader
view it shows the banner, the TL;DR card, then the article body as Markdown
text with its figures inline. Drafts never appear.

## Files in this pack

| File | Purpose |
|---|---|
| `01-STYLE-RULES.md` | Voice, structure, punctuation and humanization rules |
| `02-SEO-GEO.md` | Keyword strategy, on-page and answer-engine guidance, current limits |
| `03-BRAND-ENTITY.md` | What LLMiser is, what it can and can't do, claims policy |
| `04-OUTPUT-FORMAT.md` | The exact frontmatter schema and body rules the app expects |
| `topics.md` | Backlog of accurate LLMiser article ideas |
| `check.mjs` | Quality scan for a finished article |
| `Blogs/` | One working folder per article (research, outline, sources) |
| `Outputs/` | Quality-check reports written by `check.mjs` |
