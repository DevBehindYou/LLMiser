# M02-S2 fixture record

**Synthetic only.** Invented company (NORTHWIND PARTS DEPOT), account, order and reference numbers, and amounts. Generator: `make_receipt.py` (deterministic). Expected strings: `receipt-truth.json` (24 fields).

| File | Bytes | SHA-256 | Purpose |
| --- | --- | --- | --- |
| receipt-200.png | 70097 | 5a3df758f28cc209c2b06144a5a747ac8b94ac48285cf8a1264cddeb05373fbd | Clean page, 1700x2200 at 200 dpi |
| receipt-150.jpg | 101479 | 2ed121933bbf01601af1e17387be2ed048a9ffb5b0a9a668f89a23c7b21ccf6d | 75% scale, JPEG quality 70 ("office scan") |
| receipt-fax.png | 7393 | 5df8294d4ec4c18772cec0ac5e8bd46046d8b8bb870b58855e73d3bb40655efc | 50% scale, 1-bit black and white ("fax-style") |
| receipt-photo.jpg | 53118 | 4c0cfaf265c642271b582013a668e6d778ecbfae67f5d5b01dcbfea0fc1499ab | 60% scale, blur 0.9, darkening gradient toward the bottom, JPEG quality 60 ("phone-photo-style") |

## Runs (2026-11-09T07:53Z, revision 9b3ed09, application code identical to 8eb8c509)

`run_ocr.py`: LOCAL CODE-LEVEL RUN of `backendO.app.converter.OcrConverter.convert` on each file, with the `mdify.ocr` orientation log captured. Tesseract 5.3.4 with tessdata_fast 4.1.0 eng/osd. Exact outputs in `out/*.txt`, hashes and logs in `out/runs.json`. Not a live production conversion.

`check_fields.py`: finds each field's label line in the output and compares the value exactly; table rows are aligned by expected values when a cell is missing. Writes `field-results.json` and `correction-log.csv` (corrections taken from `receipt-truth.json`, not from a separate manual review).

| Copy | Mean conf | Words | Warning | Exact / changed / missing (of 24) |
| --- | --- | --- | --- | --- |
| receipt-200.png | 94.6 | 72 | none | 22 / 2 / 0 |
| receipt-150.jpg | 95.2 | 71 | none | 21 / 2 / 1 |
| receipt-fax.png | 92.4 | 71 | none | 19 / 4 / 1 |
| receipt-photo.jpg | 92.7 | 51 | none | 15 / 4 / 5 |

## Expected versus observed

| Field | Printed | Observed |
| --- | --- | --- |
| Order (letter O) | PO 10O5-B | "PO 1005-B" in all four |
| Reference (letter O, zero) | O0-2207 | "00-2207" in all four |
| Receipt no, Account (leading zeros) | RCT-000418, 0045-1170 | exact in all four |
| Dates | 03/04/2026, 2026-04-17 | exact in all four |
| Delivered | 17.04.2026 09:30 | fax "17,04.2026 09:30"; others exact |
| Seal kit quantity | 1 | 200 exact; JPEG and fax missing (row "Seal kit 0.75 0.75"); photo "i" |
| Return credit quantity | 1 | photo "zt"; others exact |
| Minus signs | -12.40, -12.40 | exact in all four |
| Totals and EUR | 3,864.35 / 289.83 / 4,154.18 / 1.250,00 | exact in 200, JPEG, fax; photo output ends after the credit row, so all four and the terms line are missing |
| Terms | ...after 2026-05-17. | fax drops the final period; photo missing; others exact |
| Not a field | Header "Item" | 200 copy "ltem" (lowercase L) |

Digits-only comparison (strip all non-digits) would have accepted the fax `delivered` and `terms` values. No copy triggered the orientation check (all mean confidence above 75) and no copy returned a warning.

## Limits

One synthetic page in one font. Degradations are simulated, not real devices. The photo-style copy combines several changes, so its loss is not attributed to one factor. Counts are per field on this page and are not error rates.
