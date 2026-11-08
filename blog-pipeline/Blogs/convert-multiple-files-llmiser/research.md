# M07 research: convert-multiple-files-llmiser

Researched 2026-11-08. Same access limits as M01. Web search: Claude Code WebSearch tool, provider unspecified, US.

## Query observation

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `convert multiple files to Markdown at once batch converter PDF DOCX limits` | apify.com/dropin-apis/document-to-markdown; documentation.datalab.to/docs/recipes/conversion/batch-documents.md; apify.com/kris_fili/document-to-markdown.md; g2.com/sellers/pagestomd; dev.to/vigoss_luke_3604c1d0e9b4a/how-i-batch-convert-100-documents-to-markdown-...; jakeshadow.github.io/markitdown-pro/; pdf.to/docx-markdown/ | Tool and API comparison: batch caps, per-file size limits, concurrency, scripts. Mostly vendors. |

Conclusions: the generic "convert multiple files" query is tool-comparison intent. M07 is a product guide for LLMiser users (primary "LLMiser batch conversion"), not a comparison, and it uses the generic phrase only as a secondary. No competitor claims are used.

## Product facts checked in code (9b61c47)

- `frontend/lib/formats.js`: MAX_QUEUE_FILES 20; 15 MB documents and ZIP, 10 MB images; supported extension lists; validateUpload messages "Unsupported format: .ext", "The file is empty", "Exceeds the 15MB limit", "Images are limited to 10MB".
- `frontend/lib/models/queueModel.js` planAddFiles: duplicate names skipped, rejected list with reasons, overflow count; statuses pending, converting, done, error.
- `frontend/viewmodels/useConverterViewModel.js`: describeSkipped notice text; CONCURRENCY = 2; convertAll processes pending and error items in queue order; runJob reads the profile at job start (`profileRef.current`) or a retained recovery profile; retry(id) re-runs one item; removeFile and clearAll cancel requests.
- `frontend/components/converter/QueueRail.js`: "Convert all ({count})" button, per-row retry link whose title is the error message, remove control.
- `frontend/components/converter/ExportActions.js`: Copy and .md act on the active result; .zip "Download all as zip".
- `backendN/app/converter.py` validate: "File content does not match the .{ext} extension".
- `frontend/lib/legal/policies.js`: 48-hour default retention.
