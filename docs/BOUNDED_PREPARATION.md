# Bound decoded preparation and page buffers

OCR holds its existing process capacity lock before opening/preparing pixels and through recognition. The source closes after preparation; the prepared image closes on success or failure before capacity is released. Header-only upload validation remains outside the lock. Existing orientation, format limits, warning text and conversion fidelity remain covered by tests.

PDF analysis writes each native segment or rendered PNG immediately and retains only output metadata before proceeding. A failed write stops further rendering and cannot return a successful expansion. Page images/bitmaps close explicitly. Native PDFium calls (including document creation/close) share one process mutex, because PDFium forbids simultaneous calls even on different documents: [pypdfium2 threading requirements](https://pypdfium2.readthedocs.io/en/stable/python_api.html#incompatibility-with-threading).

The PDF change trades parallel page uploads for bounded per-request page buffers. Storage writes can overlap a different request's native work, while native PDFium calls remain serialized. This does not impose a global parser limit across every document format or a shared deadline; those remain separate roadmap items. Waiting OCR requests retain compressed input, not prepared pixel buffers.

## Verification and measurement

BackendN full suite: 93 tests passed. BackendO: 78 tests passed, including actual Tesseract text/orientation cases. Added tests exercise upload-before-next-render, upload failure/resource release, serialization across documents, blocked concurrent image preparation and pixel cleanup/error mapping. CI also runs the existing Python 3.12 suites.

`python tests/load/pdf_buffer_bench.py baseline` and `python tests/load/pdf_buffer_bench.py current`, run in fresh processes from the repository root with backendN dependencies, compare buffer retention against `f596a2f`. The harness synchronizes two requests with six 4 MiB synthetic page payloads each, discards writes after 20 ms and asserts all 12 writes/48 MiB are delivered. Its fake native decoder isolates buffer pressure; real PDF correctness is covered by the fixture tests.

One Windows run on 18 October 2026 (Python 3.14.6, FastAPI 0.141.1, pypdfium2 5.13.0):

| Synthetic harness | Prior code | Incremental writes |
| --- | ---: | ---: |
| Peak process RSS | 109.14 MiB | 68.45 MiB |
| Wall time | 0.1220 s | 0.1943 s |
| Successful writes / bytes | 12 / 48 MiB | 12 / 48 MiB |

These are local synthetic measurements, not production host capacity, real decoding peak RSS, or a throughput promise. Representative multi-request scanned/native PDF and near-cap image capacity measurements remain necessary before tuning worker counts or timeouts. No concurrency limit is increased here.

No database migration, environment change, new application dependency or model download is required. Deploy backendN and backendO with their existing pool settings. Parser-wide bounds and versioned attempt-fenced object identities remain separate changes.
