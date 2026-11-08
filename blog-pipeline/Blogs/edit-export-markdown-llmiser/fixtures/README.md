# M09 fixture record

1. `export-behavior.mjs` (LOCAL CODE-LEVEL RUN, 2026-11-08, no browser): imports `frontend/lib/models/editorExport.js` snapshotWithPendingEdits, `fileExport.js` uniqueArchiveNames and `sessionRepository.js` save/get with an in-memory localStorage. Result in `export-behavior.json`:
   - An export snapshot with an unsaved reader edit contains the edited text and commits the edit; other documents unchanged.
   - ZIP entry names for [report.md, report.md, notes.md]: report.md, report (2).md, notes.md. Default ZIP name llmiser-converted.zip.
   - Recent session after conversion stores the original text; editing does not change it (the converter only saves sessions in `onConverted`; `contentUpdated` never saves). MAX_SESSIONS = 5.
   - AUTOMATIC_PREVIEW_LIMIT = 50000 (read from MarkdownViewer.js).
2. `render-comments-check.mjs`: renders Markdown containing `<!-- chunk-boundary -->` and an inline page comment with react-markdown 10.1.0 and remark-gfm 4.0.1 (the versions in frontend/package-lock.json) through react-dom/server. Output escaped both comments and showed them as text. This corrected a draft sentence that had claimed Rendered view hides comments.

Not exercised: the real browser UI, clipboard permission prompts and file downloads (covered by the repository's own tests/browser/reader-export.cjs per docs/READER_EXPORT.md, not run here).
