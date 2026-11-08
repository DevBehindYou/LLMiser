# M08 fixture record (shared with M08-S1, S2, S3)

**Synthetic only.** `field-guide.md` (SHA-256 5ec83f999e724b966ce6352197917b2f0552fb330dffe8fa4e34abaab39ef1c3): a short Markdown guide with an H1, three H2 sections, an H3, three extra blank lines, a `---` divider, a pipe table, "March---April" and a fenced Python block containing a line starting with `##`.

Run 2026-11-08: `scripts/campaign/llmiser_local.py profiles field-guide.md out` (backendN NormalConverter, markitdown 0.1.9, then `finalize_markdown` per profile). Outputs: `out/{Standard,Clean,Compact,RAG-ready}/field-guide.*.md`, `out/run.json`.

| Profile | Words (backend count) | Backend token estimate (words x 1.33) | Bytes | Observed |
| --- | --- | --- | --- | --- |
| Standard | 98 | 130 | 536 | Title, source note, content unchanged (conversion had already collapsed the extra blank lines) |
| Clean | 90 | 120 | 469 | Source note removed; nothing else changed |
| Compact | 95 | 126 | 510 | Source note kept; all blank lines removed; divider line emptied; table separator `\| --- \| --- \|` became `\|  \|  \|`; "March---April" became "MarchApril"; blank line inside the code block removed |
| RAG-ready | 118 | 157 | 699 | Profile comment first line; `<!-- chunk-boundary -->` before Setup, Results, Next steps and before `## a comment inside code` inside the fence; none before the H1 or H3; source note kept |

Code path: `backendN/app/common/profiles.py` finalize_markdown (Compact: `re.sub(r"\n\n+", "\n", content).replace("---", "")`; RAG-ready: `re.sub(r"(^## [^\n]+)", ...)` with no fence awareness). The same function finalizes OCR, PDF-merge and ZIP outputs.
