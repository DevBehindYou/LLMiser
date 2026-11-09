# M02-S2 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_receipt.py, run_ocr.py, check_fields.py | Four copies converted; 24 fields compared per copy |
| check-private.mjs verify-ocr-numbers | PASS: 0 errors, 1,673 words, intro 77, H2 openers 35 to 39; warnings: 2 long sentences, draft flag |
| preview.mjs verify-ocr-numbers | 0 geometry issues; caret alignment in digits-only-trap replaced after inspection |

Distinctness: the parent reports the M02 invoice errors inside a nine-check list; this support uses a new 24-field receipt, four copies, an exact versus digits-only comparison and a correction log. Product observations: no warning on any copy, including the one that lost five fields at 92.7 mean confidence; letter O read as zero even on the clean copy.
