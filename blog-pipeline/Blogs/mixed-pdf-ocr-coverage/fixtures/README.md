# M02-S3 fixture record

**Synthetic only.** Invented company, people, form and receipt numbers. Generator: `make_packet.py` (deterministic, reportlab invariant mode). Page types and first/last lines: `packet-truth.json`. Shares the M02 three-page fixture (`../../ocr-checks-before-ai/fixtures/mixed.pdf`, SHA-256 e25762ec...) for the blank-last-page observation.

| File | Bytes | SHA-256 |
| --- | --- | --- |
| packet.pdf | 143512 | cb6089e0e9bca25f8756ab2425f4ad74adb8863c8f9d90e669f41f03dd33737c |

Pages: 1 text; 2 full-page scan (no text layer); 3 blank; 4 text; 5 full-page scan plus a 40-character scanner stamp drawn as real text; 6 receipt photo 3.5 x 5 in on a letter page, no text; 7 text plus an invisible (render mode 3) second copy of the same lines; 8 blank.

## Runs (2026-11-09T08:01Z, revision 2570dc6, application code identical to 8eb8c509)

1. `scripts/campaign/llmiser_local.py pdf packet.pdf out-packet`: LOCAL CODE-LEVEL RUN of backendN `pdf_tasks` functions in production order (classify_pages, page_runs, sub_pdf plus NormalConverter for native runs, render_page_png plus backendO OcrConverter for scans, merge labels, finalize_markdown Standard). Output `out-packet/packet.Standard.md` (SHA-256 12f9c5e0...). markitdown 0.1.9, tesseract 5.3.4, tessdata_fast 4.1.0.
2. `workaround.py`: pages 5 and 6 rendered with `render_page_png` (200 dpi) and converted as images with OcrConverter, as a user would after exporting them. Outputs in `out-workaround/`.

## Expected versus observed

| Page | Classified (chars, image coverage) | Expected for full coverage | Observed in output |
| --- | --- | --- | --- |
| 1 text | native (216, 0.0) | text present | present |
| 2 scan | scan (0, 1.0) | recognized | present after `<!-- page 2: text recognition -->` |
| 3 blank | empty | acknowledged or absent | no trace (joined run pages 3 to 8) |
| 4 text | native (145, 0.0) | text present | present, no page boundary after page 2's last line |
| 5 scan + stamp | native (40, 1.0) | form recognized | only "Scanned 2026-04-18 09:14 by FrontDesk-02"; form missing |
| 6 small photo | native (0, 0.187) | receipt recognized | nothing |
| 7 text + hidden copy | native (288, 0.0) | text once | approval text twice (once with blank lines, once without) |
| 8 blank | empty | acknowledged or absent | no trace |

Runs: native 1-1, OCR 2, native 3-8. No warning lines (none of the merge warning conditions applied). Workaround: page 5 image returned the stamp plus the full RA-2207 form; page 6 image returned all five receipt lines including "TOTAL 6.95".

## Limits

One synthetic packet with each case placed once. The UI's display of page counts or warnings was not checked; the article only describes output text. The source note in the output names engines (logged product observation from M10); not shown in the article.
