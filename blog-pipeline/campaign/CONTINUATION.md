# Campaign continuation checkpoint

Updated 2026-11-09. Branch `claude/stoic-pasteur-raqnqy`. Owner decision on 2026-11-08: blog-pipeline/ is tracked in Git (`.gitignore` entry removed; the owner removed the local `.git/info/exclude` line and pushed the folder). Progress is saved as commits on this branch.

## Completed

| Batch | IDs | Paths | State |
| --- | --- | --- | --- |
| 0 | tooling | scripts/campaign/*, visuals/campaign-parts.mjs, campaign/slug-map.json, campaign/production-status.json | Working |
| A1 | M01 | Blogs/prepare-codebase-for-ai/ (all 12 contract files, fixtures, banner + 4 figures, preview) | READY_FOR_REVIEW |
| A2 | M02-M06 | Blogs/ocr-checks-before-ai, excel-data-checks-for-ai, prepare-word-documents-for-ai, powerpoint-to-markdown-checks, prepare-csv-data-for-ai | READY_FOR_REVIEW |
| A3 | M07-M12 | Blogs/convert-multiple-files-llmiser, llmiser-processing-profiles, edit-export-markdown-llmiser, llmiser-zip-index-manifest, document-prompt-injection, conflicting-document-versions-ai | READY_FOR_REVIEW |
| B1 | M01-S1 to M02-S3 | Blogs/project-zip-secret-review, dependency-files-ai-review, task-focused-code-bundle, rotated-scan-ocr-check, verify-ocr-numbers, mixed-pdf-ocr-coverage | READY_FOR_REVIEW |
| B2 | M03-S1 to M03-S3 | Blogs/excel-leading-zeros-ai, excel-formula-results-conversion, merged-excel-headers-markdown | READY_FOR_REVIEW |
| B3 | M04-S1 to M04-S3 | Blogs/word-heading-styles-markdown, nested-word-lists-markdown, word-revisions-ai-sharing | READY_FOR_REVIEW |
| B4 | M05-S1 to M05-S3 | Blogs/powerpoint-speaker-notes-markdown, slide-chart-context-ai, slide-order-markdown | READY_FOR_REVIEW |

Counts: mains 12/12 (Phase A complete), supports 15/36, posts 0/108. Run `node scripts/campaign/status.mjs build` for live counts; `python3 scripts/campaign/sync_state.py NEXT_ID "action"` copies them into STATE.json and manifest.json.

## Next action

Phase B: M06-S1 "csv-quoted-cells-markdown", then M06-S2 through M12-S3 in order. Reuse each cluster's fixtures (Blogs/{main-slug}/fixtures) and extend them for the support's narrow question. Per support: `node scripts/campaign/scaffold-support.mjs ID` writes metadata.json and a links.json skeleton. After all 36, revisit main links.json placements.

## How to work (per article)

1. Read the brief and its three support briefs. Research with the web search tool (label it unspecified-provider) and primary sources via `scripts/campaign/fetch_source.py URL PATTERN` (set SOURCE_CACHE to a scratch folder, never commit page copies).
2. Build a synthetic fixture under Blogs/{slug}/fixtures/ and run it through the real backend code with `scripts/campaign/llmiser_local.py` (zip | doc | ocr | profiles). For OCR set TESSDATA_PREFIX to tessdata_fast 4.1.0 (`/opt/tessdata_fast` in the LLMiser environment). Label results LOCAL CODE-LEVEL RUN.
3. Write draft.md, metadata.json (with listicle_count for mains 1 to 6), claims.json, links.json (unpublished campaign links only here), sources.md, research.md, outline.md, visuals.mjs, visual-ledger.md, qa.md.
4. `node scripts/campaign/render-private.mjs {slug}` then `node scripts/campaign/check-private.mjs {slug}` then `node scripts/campaign/preview.mjs {slug}` and look at visuals/preview/contact-375.jpg.
5. `node scripts/campaign/status.mjs set ID writing=... fixture=... visual_qa=...` then `node scripts/campaign/status.mjs build`.
6. Commit and push at the end of each batch.

## Environment notes

- Session runs on the owner-approved personal environment "LLMiser" (adds documentation hosts such as git-scm.com, docs.github.com, OWASP, Microsoft support/learn, rfc-editor, CommonMark, GFM spec, W3C, Anthropic, Tesseract docs, Python docs, arXiv, NIST). Its setup script installs tesseract, tessdata_fast to /opt/tessdata_fast and a venv at /opt/llmiser-venv with markitdown 0.1.x and helpers. The script is unproven until a fresh session starts on it.
- Search engines (Google, Bing, Brave, DuckDuckGo) are not reachable and were not scraped. Keyword tools unavailable. Keep metrics null.

## Known pre-existing validator result

`node blog-pipeline/scripts/validate-plan.mjs --preservation` reports 11 errors in this Linux checkout. All are line-ending artifacts: the baseline and registry hashes were taken from Windows CRLF working copies. Every file matches exactly after LF to CRLF normalization (checked 2026-11-08). The 10 regression tests pass. Do not rewrite the baseline for this.

## Product observations logged for the owner

- M02: blank page in a mixed PDF adds "_No extractable text found in this document._" to merged output.
- M03: Excel conversion drops leading zeros from all-text ID columns (pandas inference); CSV keeps them.
- E08 published figure naive-vs-pipeline.svg has two sub-labels spilling out of their boxes (not edited).
- M08: Compact profile deletes every "---" (breaks Markdown tables, alters text and code), keeps the source note despite the site FAQ wording; RAG-ready inserts chunk markers inside fenced code.
- M07: the skipped-files notice gives counts only and lumps empty files under "unsupported or too large".
- Renderer: mono text now disables JetBrains Mono ligatures so <!--, --> and --- render literally (all figures re-rendered).

- M10: blank images count as converted and recognized; case-insensitive duplicates dropped even when content differs; index/manifest and the ZIP source note expose third-party engine names; labels use British spelling.
- M12: DOCX headers and document properties (often where effective dates live) do not appear in converted output.
- campaign-parts columns(): a leading backslash renders a line literally (needed for Markdown headings).
- M01-S2: patched dependencies kept under vendor/ are skipped from ZIP conversion.
- M02-S1: a page tilted 8 degrees lost almost all text with no warning (mean confidence stayed above the orientation threshold).
- M02-S2: the letter O inside identifiers came back as zero even on a clean 200 dpi scan; a photo-style copy lost its totals block at 92.7 mean confidence with no warning.
- M02-S3: a scanned PDF page carrying 20+ characters of real text (a scanner stamp) is treated as a text page and its image is never recognized; a page whose picture covers 5 to 30% is never recognized; an invisible duplicate text layer comes through twice. None of these raise a warning.
- M03-S1: Text-formatted digit-only ID columns lose leading zeros (type inference); one blank cell turns the IDs into decimals (123.0) and the blank into NaN.
- M03-S2: #N/A, #DIV/0! and empty cells all convert to NaN; numeric columns share decimal places (12.000 beside 0.075).
- M03-S3: merged header groups become "Unnamed: N" columns and the second header row becomes data.
- M04-S1: Word's Title style and custom heading styles (even one based on Heading 2) convert as plain paragraphs; without an opening Heading 1 the output gets a title from the file name.
- M04-S2: a paragraph between list items restarts Markdown numbering at 1; lettered sub-steps become numbers; style-based list levels (List Bullet 2) flatten. Phase D: the M04 parent's list section generalizes from a style-based list.
- M04-S3: Word drafts convert as if every tracked change were accepted; text formatted as hidden appears in the output; comments are dropped.
- M05-S1: slides-only and notes-pages PDF exports give no sign that speaker notes existed (notes missing or unlabeled).
- M05-S2: chart number formats, axis titles and data labels are dropped (4.2% converts as 0.042).
- M05-S3: PowerPoint sections are dropped; text above a slide title prints before its heading; decks get no RAG-ready chunk markers because slide titles are level-one headings.

## Blockers

None for writing. Evidence gaps are recorded per article (no named-engine SERP data, no keyword metrics, no live conversion).
