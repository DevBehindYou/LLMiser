# M09 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-CODE-READER | `frontend/components/MarkdownViewer.js`, `PreviewModeToggle.js` | Repository code | Views, editable textareas, preview limit and buttons | C01, C02, C06 |
| S-DOC-PREVIEW | `docs/LLMISER_LARGE_PREVIEWS.md` | Repository documentation | Pause behavior above 50,000 characters | C06 |
| S-CODE-EXPORT | `useExportViewModel.js`, `editorExport.js`, `fileExport.js`, `docs/READER_EXPORT.md` | Repository code and docs | Snapshot of pending edits; ZIP names; clipboard notice | C04, C07, C08 |
| S-CODE-SESSION | `sessionRepository.js`, `useConverterScreenViewModel.js`, `conversionService.js` | Repository code | Sessions saved on conversion, max 5; retry fetches stored result | C05 |
| S-PRIVACY | `frontend/lib/legal/policies.js` | Policy text | 48-hour default deletion | C09 |
| F-M09 | fixtures/ | LOCAL CODE-LEVEL RUN | export-behavior.json; render-comments-check.mjs | C03, C04, C05, C08 |
