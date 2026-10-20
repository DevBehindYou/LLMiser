# Current-edit exports

Copy, keyboard copy, single Markdown download and batch ZIP export take a snapshot of pending reader edits before reading debounced result state. The reader cancels those timers and commits the edits to their original document. The snapshot preserves other result fields and other batch documents, including multipart content already assembled by retrieval.

Typing still updates the local buffer immediately and defers preview/statistics work. Exporting cleared text produces an empty file while retaining the editable document. An external replacement with changed content discards an obsolete local timer.

No schema migration, new dependency or configuration change is required. Recent-session persistence, result-download retries, centralized statistics and large-preview measurements remain separate work.

## Verification

Run `npm test`, `npm run lint` and `npm run build` from `frontend/` with Node 22. The five `editorExport.test.mjs` cases cover immediate Unicode text, empty edits, ordering across reader buffers, document identity and idle snapshots. Existing reader/archive suites cover rendering safety and complete multipart retrieval.

After starting the production build on localhost, run `node tests/browser/reader-export.cjs` from the repository root. The script uses Playwright and Chromium already installed in the verification environment; it does not add them to application dependencies. Set `MDIFY_PLAYWRIGHT_MODULE` to an existing Playwright package path if it is not normally resolvable, and `MDIFY_CHROMIUM_PATH` for an existing browser executable. Optional `MDIFY_TEST_URL` selects the localhost port; `MDIFY_BROWSER_OUTPUT` selects a private evidence folder (default: a fresh OS temporary folder).

The browser checks seed synthetic recent sessions and mock `/api/` health/wake requests. They verify real completed download bytes, ZIP contents for two documents, code copy, same-event edit/export/copy/keyboard copy, empty files, canceled timers, document switching and failed optional reader/highlighter chunks at desktop 1440×1000 and mobile 390×844. They do not establish live backend or deployed migration health.
