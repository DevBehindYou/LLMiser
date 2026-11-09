# M02-S3 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_packet.py, llmiser_local.py pdf, workaround.py | Eight-page packet converted; two unread pages re-run as images |
| check-private.mjs mixed-pdf-ocr-coverage | PASS: 0 errors, 1,746 words, intro 74, H2 openers 35 to 36 after trimming the first (was 45) |
| preview.mjs mixed-pdf-ocr-coverage | 0 geometry issues after one banner fix |

Corrections during drafting: FAQ on blank pages first said a blank after a scan always adds the notice; page_runs shows it joins a following text page (packet page 3), so the answer now depends on whether a text page is adjacent.

Distinctness: parent reports the three-page fixture; this support adds a page inventory method, routing edge cases (stamped scan, small photo, hidden duplicate layer) and a tested export fix. Product observations for the owner: a scanned page with a 20+ character text stamp is never recognized and raises no warning; a small photo page (5 to 30% coverage) is never recognized; hidden duplicate text layers pass through twice.
