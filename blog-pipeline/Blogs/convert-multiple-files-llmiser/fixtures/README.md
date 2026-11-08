# M07 fixture record

Part 1: `plan-queue.mjs` imports `frontend/lib/models/queueModel.js` planAddFiles with 27 file-like entries (name and size only, nothing uploaded). Result: `queue-plan.json`. The notice string reproduces the non-exported describeSkipped helper line for line.

Part 2: six synthetic files from other campaign fixtures plus a plain-text file renamed `mislabeled-report.pdf`, each run through the repository backend with `scripts/campaign/llmiser_local.py` (doc, ocr or zip), 2026-11-08. Inputs in `batch/`, outputs in `out/`.

| File | SHA-256 (first 16) | Route | Outcome |
| --- | --- | --- | --- |
| refund-policy.docx | 9d23564c2845f053 | document | done, 141 words |
| q3-review.pptx | 5541bde0683feee0 | document | done, 187 words |
| quoted.csv | 8e99a2738608ae09 | document | done, 51 words |
| invoice-clean.png | 47029fb815797c06 | OCR | done, 71 words |
| invoice-tool-sharing.zip | 3cef472da32c9fd2 | archive | done, 289 words, one combined result |
| mislabeled-report.pdf | 522aef54ec25d2a9 | document | FAILED: ConversionRejected "File content does not match the .pdf extension" (out/mislabeled-report.err) |

Limits: backend functions called one file at a time locally. The browser queue, concurrency of two, Storage and server job states were not exercised; their behavior is taken from code reading.
