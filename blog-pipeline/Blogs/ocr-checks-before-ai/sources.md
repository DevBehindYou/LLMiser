# M02 source ledger

| ID | Source | Type | Checked passage or evidence | Used for |
| --- | --- | --- | --- | --- |
| S-CODE-OCR | `backendO/app/converter.py` at 6f7b791 | Repository code | OCR_LANG, `_prepare`, `_target_size`, `_recognize` orientation rule, `_clean_text`, warnings | C02, C05, C06, C09, C14, FAQ 1 and 5 |
| S-CODE-PDF | `backendN/app/pdf_tasks.py` at 6f7b791 | Repository code | `PageInfo.kind`, `page_runs`, `RENDER_DPI = 200`, `MAX_OCR_PAGES = 100`, merge labels and warnings | C03, C04, C07, FAQ 2 and 6 |
| S-CODE-NORMAL | `backendN/app/converter.py` | Repository code | "_No extractable text found in this document._" for empty output | C03 |
| S-CODE-FORMATS | `frontend/lib/formats.js`, `frontend/lib/siteContent.js` | Repository code | 10 MB images; up to 100 scanned pages per file | FAQ 6 |
| F-M02 | `fixtures/` synthetic pages, local run 2026-11-08T17:23Z | Original fixture, LOCAL CODE-LEVEL RUN | fixtures/README.md expected versus observed table, out-*/ outputs and run.json hashes | C08, C10 to C13, C15 to C18 |
| S-TESS-QUALITY | [tessdoc ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html), "Improving the quality of the output" | Engine documentation (background only, not linked: house rule against naming engines) | "It is known tesseract has a problem to recognize text/data from tables ... without custom segmentation/layout analysis." "The quality of Tesseract's line segmentation reduces significantly if a page is too skewed" | Background for items 3 and 8 |

Observation-only web search results are listed in research.md and are not used as evidence.
