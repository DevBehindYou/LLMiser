# M02-S3 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-CODE-PDF | `backendN/app/pdf_tasks.py` | Repository code | kind thresholds, page_runs grouping, merge labels and warnings, MAX_OCR_PAGES | C01, C02, C08, C09 |
| S-CODE-OCR | `backendO/app/converter.py` | Repository code | Images read directly with recognition | C06 |
| F-M02S3 | fixtures/out-packet/, out-workaround/ | LOCAL CODE-LEVEL RUN | Page map and export workaround | C03 to C07 |
| F-M02 | ../ocr-checks-before-ai/fixtures/out-mixed/ | LOCAL CODE-LEVEL RUN (shared) | Blank last page after a scan adds the notice | C08 |
| S-PRODUCT-LIMITS | site FAQ and upload limits (verified for M07) | Product page and code | 10 MB per image, 20 files per batch | C10 |
