# M10 fixture record (shared with M10-S1, S2, S3)

**Synthetic only.** `docs-bundle.zip` (SHA-256 d2a8cec3435f87a1cd50b3ff9bc17449204a52248057a9189c413108288c699c), 14 entries, built by `make_fixture.py`. The .env holds a FAKE token. report.docx is the M04 fixture.

Run 2026-11-08: `scripts/campaign/llmiser_local.py zip-ocr docs-bundle.zip out`. This emulates the Storage path: `process_archive(..., ocr_available=True)`, each PENDING image recognised by backendO OcrConverter in raw mode (tessdata_fast 4.1.0, local tesseract 5.3.4), then `combined_body`, `project_index` and `manifest` with those texts, as `archive_tasks.merge` does. Outputs: `out/combined.md`, `out/PROJECT_INDEX.md`, `out/manifest.json`, `out/run.json`.

| Observation | Value |
| --- | --- |
| Summary | Files found 16 (14 entries + 2 inside old.zip), Converted 9 (including the old.zip row), Text recognised in images 2, Skipped 7, Failed 0 |
| Same name, two folders | src/config.txt and docs/config.txt both converted under their own path headings |
| Case-insensitive duplicate | README.md converted; readme.md (different content) listed as "readme.md (duplicate)", skip_reason "duplicate path" |
| Nested archives | archive/old.zip opened (status DONE, engine archive); old.zip/deeper.zip "nested archive too deep" |
| Unsafe path | "(unsafe) ../escape.txt", "unsafe path (absolute, drive or ..)" |
| Symbolic link | tools/run.sh "symbolic link" |
| Others skipped | .env (sensitive), data/sample.bin (binary file), node_modules/pkg/index.js (dependency folder) |
| Blank image | Counted as converted with OCR; combined section reads "_No text detected in this image._" |
| Image with text | "Import flow: upload, convert, review" recognised exactly |
| Manifest top level | job_id null locally (set in production), source {filename, bytes 44380, entries 16}, limits {max_entries 2000, max_uncompressed_bytes 104857600, max_entry_bytes 15728640, max_depth 1, max_ocr_images 50} |
| Engine values | direct, archive, and third-party engine names for documents and images (not reproduced in the article) |

Limits: local emulation, not the deployed Storage merge; no encrypted entry was included (Python zipfile cannot write encryption).
