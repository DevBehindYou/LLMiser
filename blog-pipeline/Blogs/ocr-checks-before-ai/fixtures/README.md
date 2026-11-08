# M02 fixture record (shared with M02-S1, S2, S3)

**Synthetic only.** Invented company (ACME FIELD SUPPLY), customer IDs and amounts. Generator: `make_fixture.py` (deterministic). Expected strings: `truth.json`.

| File | Bytes | SHA-256 | Purpose |
| --- | --- | --- | --- |
| invoice-clean.png | 63783 | 47029fb815797c063eac269bff0650e3a5ff712e015e33db564d9037d2dd808e | Upright invoice, 1700x2200 at 200 dpi |
| invoice-rot90.png | 83233 | 4853751e187d124777aa88d50228f59e0e646b27059871f0f9dbb647a07c2a0d | Same page turned 90 degrees clockwise, no EXIF |
| invoice-degraded.png | 68043 | 9160d2be18a54ebe1ea57a6a2ebda0db81a18696b43544199fd871bd3d45228c | 45% scale, Gaussian blur 1.1, 9,000 speckles |
| two-column.png | 40942 | b3cb193dad51b297eeb69a44789ebb8d04db537435b0edc5a1bc0037f30fb03f | Numbered sentences L1-L5 and R1-R5 |
| mixed.pdf | 122500 | e25762ec3631b3a6ce06e3b070eee010e8d4f91b5daa564caeaf689dcafc3d60 | p1 native text, p2 invoice image only, p3 blank |

## Runs (2026-11-08T17:23Z, revision 6f7b791, application code identical to 8eb8c509)

LOCAL CODE-LEVEL RUNS of `backendO.app.converter.OcrConverter` and, for the PDF, `backendN.app.pdf_tasks` functions in production order (`scripts/campaign/llmiser_local.py pdf`). Tesseract 5.3.4 binary with tessdata_fast 4.1.0 eng/osd (same models as backendO/Dockerfile; production binary version not checked). markitdown 0.1.9. Not a live production conversion.

Orientation log (`mdify.ocr` logger, same code): clean mean_conf 94.5, 59 words, no OSD; rot90 mean_conf 94.6, 63 words, no OSD; degraded mean_conf 37.8, OSD proposed 0, no rotation; two-column 94.2.

## Expected versus observed

| Check | Expected (truth.json) | Observed |
| --- | --- | --- |
| Invoice number | INV-00123 | clean and rot90 exact; degraded "anv.o0123-" |
| Customer ID (zero then letter O) | C0O1-7781 | clean and rot90 exact; degraded "-c001- 7781" |
| Order (letter O) | PO 10O5-B | clean and rot90 "PO 1005-B" (O read as zero); degraded "PO 1005-8" |
| Dates | 03/04/2026, 2026-04-17 | exact in all three invoice runs |
| Table header and Qty column | Item, Qty, Unit price, Amount; 12, 3, 1 | clean: "Item Unit price Amount", quantities missing in every row, no warning. rot90: header and quantities present. degraded: quantities missing, rows scrambled |
| Unit price | 10.50 | clean exact; degraded "40. 50" |
| Totals | 3,876.75 / 290.76 / 4,167.51 | clean exact with labels; degraded "3876.75", "290.76.", "4,167.51" with the Total label lost |
| Small print (about 7 pt) | Terms: net 30. A late fee of 1.5% per month applies after 2026-05-17. | clean exact; degraded "Terme not DO A late fee of 1:5 per mance appten ater 2006-0517 -" |
| Two-column order | L1..L5 then R1..R5 | order correct; "L5" read as "LS" |
| Mixed PDF | p1 native, p2 OCR, p3 blank | classify: p1 native (159 chars), p2 scan (0 chars, image coverage 1.0), p3 empty. Output: p1 text, then `<!-- page 2: text recognition -->` and the invoice text (Qty column again missing), then "_No extractable text found in this document._" from the blank page 3 run |

## Notes

- The blank-page placeholder follows from code: `analyze()` converts each native run separately and `NormalConverter.convert` returns "_No extractable text found in this document._" for empty output; `merge()` appends any non-empty run text. A blank page between two text pages would instead join their run and leave no trace.
- One fixture set. No accuracy rates are derived from it.
