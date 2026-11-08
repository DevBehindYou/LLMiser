# M09 research: edit-export-markdown-llmiser

Researched 2026-11-08. Branded product task ("edit Markdown in LLMiser"); no third-party SERP owners to observe, and named-engine SERPs and keyword metrics remain unavailable (R05). Evidence is code and local code-level runs.

## Product facts (6eb88f6)

- `frontend/components/converter/PreviewModeToggle.js`: Split, Rendered, Raw views.
- `frontend/components/MarkdownViewer.js`: editable textarea in Split (left column, "editable") and Raw views; Rendered is display; AUTOMATIC_PREVIEW_LIMIT 50000; buttons "Render full preview (may take a moment)" and "Pause formatted preview".
- `docs/LLMISER_LARGE_PREVIEWS.md`: above 50,000 UTF-16 code units, formatting waits for an explicit request; complete raw text and exports stay available; edits and document switches reset the request.
- `frontend/viewmodels/useExportViewModel.js`, `lib/models/editorExport.js`, `lib/models/fileExport.js`, `docs/READER_EXPORT.md`: Copy, .md and .zip snapshot pending edits; ZIP names deduplicated; clipboard failure notice "Clipboard access was blocked by the browser".
- `frontend/lib/models/sessionRepository.js`, `viewmodels/useConverterScreenViewModel.js`: recent sessions in localStorage, max 5, saved on conversion; large documents may keep metadata only.
- `frontend/lib/models/conversionService.js` retrieveResult: retried downloads fetch the stored server result.
- `frontend/lib/legal/policies.js`: 48-hour default deletion.
