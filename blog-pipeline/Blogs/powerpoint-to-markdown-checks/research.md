# M05 research: powerpoint-to-markdown-checks

Researched 2026-11-08. Same access limits as M01. Web search: Claude Code WebSearch tool, provider unspecified, US.

## Query observation

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `convert PowerPoint to Markdown for LLM speaker notes charts lost` | any2markdown.pages.dev/powerpoint-to-markdown; blog.devgenius.io/extracting-powerpoint-to-markdown-without-losing-a-byte-...; convertapi.com/pptx-to-md/* (several); mindstudio.ai/blog/claude-powerpoint-add-in-limitations-...; file2markdown.ai/blog/pptx-to-markdown-preserve-speaker-notes-tables; file2markdown.ai/convert/pptx-to-markdown; easy-markitdown.pages.dev/powerpoint-to-markdown/ | Mostly converter tools and vendor blogs. They disagree on whether notes and charts survive, which supports a test-your-own-deck checklist. |

## Conclusions

1. The reserved primary "PowerPoint to Markdown" is a transactional converter phrase. HOME's `siteContent.js` KEYWORDS also lists "powerpoint to markdown". The article treats it as a checks guide, not a converter landing page, and links the converter only in the CTA. Logged against R08 (cross-intent with HOME) for owner review after release data exists.
2. The fixture settles LLMiser's own behavior on notes (kept), native charts (data table, no axis titles), pictures (alt text only), hidden slides (converted), bullets (flattened) and text-box order (position order in this sample).

## Product facts

- `frontend/lib/formats.js`: pptx accepted; ppt not supported; 15 MB.
- Output structure observed in the fixture: `<!-- Slide number: N -->`, `# title`, plain text lines, `### Chart: title` plus table, `### Notes:` section.
