# 13 — LLMiser visual identity and content style guide

## Concept direction

A clean AI engineering aesthetic, not fantasy magic or cliché robot branding. The word “miser” evokes thoughtful resource use: visual cues should suggest precision and lightweight efficiency, not a generic discount product.

![Positioning circles](assets/01_positioning.png)

## Proposed visual tokens (design proposal, not existing MDify assets)

| Token | Value | Meaning |
|---|---|---|
| Ink | `#111827` | Confident text and deep neutral |
| Primary | `#6246EA` | Technology, brand anchor |
| Accent | `#028B83` | Efficiency and success |
| Highlight | `#EF9B25` | Token measurement / caution |
| Surface | `#F4F6FB` | Soft neutral panels |
| Paper | `#FFFFFF` | Readability |

**Accessible contrast:** Check real foreground/background combinations using WCAG 2.2 AA requirements (4.5:1 for normal text and 3:1 for large text/non-text component boundaries as applicable). Do not assume every pastel/icon pairing in diagrams is a production-ready UI token. Test light/dark themes separately.

**Font direction:** Inter or a system sans-serif for interface text, and a readable monospace for Markdown preview/token values. Avoid introducing a novel font loading penalty before measuring performance.

**Icon direction:** a compact layered document + token indicator; no borrowed model-provider logos without permission. Use an original vector icon at 16, 32, 48, 128 pixels with sharp silhouette and dark/light variants.

## Wordmark system

- Primary: `LLMiser` (LLM capitalized; `iser` lower-case).
- Long descriptor: `LLMiser — AI-Ready Document Converter`.
- Chrome extension: `LLMiser — Webpage to Markdown` (after launch).
- Header nav: `Convert`, `Formats`, `AI Workflows`, `Research`, `Chrome Extension`, `Docs`.
- Never claim partnership with OpenAI, Anthropic, Google or Microsoft; references to their products are compatibility/use-case descriptions only.

## Voice and microcopy

- **Useful:** `Convert a PDF to Markdown` instead of `Unleash next-gen intelligence`.
- **Precise:** `Uploaded files are processed on our service and scheduled for deletion within 48 hours, subject to retention exceptions described in the policy` when that exactly matches production.
- **Honest:** `Token impact depends on content and model input path` rather than `Save 70% on every PDF`.
- **Friendly:** `The file could not be converted. Try a smaller file or another supported format.`
- **Actionable:** `Copy Markdown`, `Download .md`, `Download ZIP`, `Retry download`.

## Suggested campaign headlines

- `Make Every Token Count.` — brand.
- `Less cleanup. More useful context.` — developer content.
- `From messy documents to structured Markdown.` — conversion SEO.
- `Understand the cost before sending documents to AI.` — future benchmark.

## Accessibility & trust

Include keyboard-first converter flow, screen-reader upload labels/progress, focus indicators, data deletion explanation, copy status announcements, reduced motion, icons not relying on color alone, alt text for diagrams, and no dark-pattern cost claims. Check actual WCAG conformance via axe + manual screen-reader testing.
