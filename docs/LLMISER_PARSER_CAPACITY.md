# Parser capacity audit and CSV memory reduction

Updated 28 October 2026. Work is confined to LLMiser. This is a source audit and one measured CSV change; it does not certify every format's maximum safe concurrency on the hosting platforms.

## Audited starting point

The four live normal/archive workers reported MarkItDown **0.1.9** before this change. The existing local Python environment had 0.1.7. Small, dependency-free package copies of 0.1.8/0.1.9 were downloaded into the ignored operator folder for compatibility tests; the installed environment and project requirements were not changed.

| Workload | Existing source limits / behavior | Remaining capacity boundary |
| --- | --- | --- |
| Normal text, JSON, XML and HTML | 15 MiB input; decoding and complete Markdown returned by MarkItDown; HTML can create a full parsed tree | Input size alone does not bound parser/output allocations |
| CSV | Same input cap; upstream retains all parsed rows and formatted row strings before constructing the full output | This slice removes those retained row collections; full text/output still occupy memory |
| XLSX/XLS | MarkItDown reads workbook sheets into pandas objects and renders HTML before Markdown | Measure representative sheets, types and formatting before replacing the path; no read-only/streaming workbook change here |
| DOCX/PPTX/EPUB | Existing shared container validation: at most 10,000 ZIP entries and 250 MiB advertised expansion | Expanded XML/object graphs still need measurement; limits are not a peak-memory estimate |
| PDF | Existing serialized native PDFium operations; one rendered scan uploaded before the next; 12 MP render target and up to 100 scanned pages for OCR | Native text parsing and whole-result assembly remain; optional sampled PDF fast path stays off by default because of its documented late-table fidelity tradeoff |
| Project ZIP | 15 MiB compressed input, 2,000 entries, 100 MiB aggregate expansion, 15 MiB document entries, 10 MiB images, 40 MiB output; document entries parsed sequentially inside each archive | Concurrent requests and retained converted entries/merge buffers remain separate memory costs |
| OCR images | Existing preparation/recognition process lock, one Uvicorn worker, OMP thread limit 1; 25 MP general / 12 MP WebP / 10,000 px side guards and 12 MP preparation target | Existing bounds remain; this slice changes neither OCR concurrency nor image fidelity |

Normal/archive endpoints are synchronous worker-thread handlers. The source has no new global parser gate in this change. Queue defaults admit four normal items and one item per configured OCR/archive instance across the shared pools, with environment overrides. This is a source observation, not an inspection of current platform memory settings or proof that all in-flight work shares one process. No queue limits, native locks, service sizes or worker counts are changed.

## CSV implementation and fidelity

`backendN/app/csv_converter.py` and its identical archive-pool copy register through MarkItDown's public converter API. They live outside the three-pool shared `common/` package because OCR has no document-parser dependency. The first CSV pass keeps only width and nonempty-row boundaries. The second writes formatted rows into a text buffer instead of retaining the entire parsed table and a list of formatted rows.

The optimization is enabled only for verified MarkItDown **0.1.8 and 0.1.9**. It delegates format acceptance and reuses that version's charset detector and cell-escaping helper. It preserves BOM handling, widest-row padding, blank-row trimming, quoted CR/LF, pipes/backslashes, Unicode and borrowed input ownership. Older/unknown versions or a missing helper retain their original converter. This matters because 0.1.7's ragged-row and escaping behavior differs from the deployed version.

References: [upstream CSV implementation](https://github.com/microsoft/markitdown/blob/v0.1.9/packages/markitdown/src/markitdown/converters/_csv_converter.py) and [converter registration](https://github.com/microsoft/markitdown/blob/v0.1.9/packages/markitdown/src/markitdown/_markitdown.py). The helper is private, so the version gate and fallback must remain until additional versions are verified. Do not simply expand the allowlist during a dependency upgrade.

The returned Markdown, API/profile behavior, file limits and complete exports retain their existing contract. This is row-at-a-time formatting, not constant-memory input or streamed HTTP/Storage output. Full input decoding, MarkItDown's final normalization and the entire output remain materialized; very wide/ragged data can still produce a large result. No new dependency, database migration, blog change or user-facing translation is needed.

## Reproducing measurements

Use an existing Python environment with `backendN/requirements-dev.txt` and a verified MarkItDown version. From the repository root, run each command in a fresh process:

```sh
python tests/load/csv_memory_bench.py --mode upstream --rows 50000 --concurrency 2
python tests/load/csv_memory_bench.py --mode current --rows 50000 --concurrency 2
```

Repeat with `--heap` for Python allocation tracing. The benchmark disables dotenv discovery and clears Storage configuration before parser imports. It uses only generated multilingual CSV; no environment credentials, server or storage calls. Its upstream mode re-registers the original CSV converter; both modes retain identical MarkItDown detection/normalization and normal-converter wrappers.

The fixture has four columns, quoted text, pipes, café/Japanese/emoji and unique first/last records. At 50,000 data rows its input is 3,996,053 bytes and output is 4,296,087 bytes per conversion. Concurrent threads start at a barrier and retain their complete outputs. Comparisons require matching output hashes and byte counts. This measures the parser/normalizer, not API serialization, profiles, Storage latency or the frontend.

Local evidence uses Python 3.14.6 / MarkItDown 0.1.9 on Windows; CI uses Python 3.12. Three fresh processes per mode/fixture, alternating mode order, with no concurrent regression/build workload. Process peak is the lifetime high-water memory counter, including imports; the recorded pre-run high-water mark provides context. Python heap tracing starts after fixture/engine setup and adds timing overhead. Compare untraced runs for timing; traced runs for allocation evidence. These are generated-fixture observations, not a hosting capacity, throughput or billing guarantee.

Median of three fresh processes per mode (24 measured processes total):

| Rows / synchronized calls | Tracing | Upstream / current seconds | Upstream / current process peak MiB | Upstream / current traced heap MiB |
| --- | --- | ---: | ---: | ---: |
| 1,000 / 1 | Off | 0.042 / 0.082 | 143.46 / 143.19 | — |
| 50,000 / 1 | Off | 1.923 / 1.079 | 225.11 / 190.72 | — |
| 50,000 / 2 | Off | 3.275 / 3.160 | 297.19 / 221.92 | — |
| 50,000 / 2 | On | 16.253 / 12.324 | 368.10 / 238.62 | 146.24 / 96.12 |

The synchronized untraced sample used about **25% less peak process memory**; its elapsed time was similar. Traced peak Python allocations fell about **34%**. The small sample's timing regressed by 40 ms in this run, so this is not advertised as a universal speed improvement. Pre-run process high-water marks for the large fixtures were about 155–157 MiB. All corresponding before/after output byte counts and SHA-256 hashes matched, including every first/last record. The large output hash was `0481293612cc8e09bca7d1386a9d5ad6afa595f62843e4177eec8716225dbc74`.

## Verification and release boundary

Output-equivalence tests compare the installed upstream converter with boundary fixtures and 100 deterministic ragged/quoted tables. They cover explicit/detected encodings, detector failure, oversized fields, Unicode, blank runs, compatibility fallback and standalone/archive wiring. The two document-pool copies must remain identical.

Local final checks:

- MarkItDown 0.1.9: **118 normal-backend tests** and **98 archive-backend tests** passed.
- MarkItDown 0.1.8: **25 CSV tests** passed against that package's actual upstream converter.
- Original local 0.1.7: **3 fallback/integrity tests** passed; 22 optimization-only cases skipped because the adapter is deliberately disabled. The fallback test compares an actual normal-converter result with that version's original CSV output.
- The shared three-pool `common/` integrity checks stay intact; OCR has no new parser dependency. No runtime requirements changed.
- Before release, tiny generated authenticated multipart CSV/ZIP probes returned 200 on **N1, N2, Z1 and Z2**, each preserving the expected widest-row table, pipe escape, interior blank row and final Unicode marker. They created no Storage jobs.

[PR #13](https://github.com/DevBehindYou/LLMiser/pull/13) merged and deployed runtime revision `165d2b01ce8e30dfa09d32292ac911264f18e60d` on 28 October 2026. All seven CI jobs passed, including the frontend's 261 tests and the normal/archive/OCR regressions. All six production Vercel status contexts succeeded. Post-release generated multipart CSV/ZIP probes passed on N1/N2/Z1/Z2, all still running MarkItDown 0.1.9, preserving exactly the same expected table as before release. They created no Storage jobs; no fresh browser/Storage-backed or cleanup acceptance is claimed.

All 20 public-page/discovery/health and permanent-redirect checks passed. The first bounded public wake check reported OCR 0/2; both OCR readiness endpoints subsequently returned 200/ready with Tesseract 5.5.0, and a fresh uncached wake returned 2/2 for normal/OCR/archive. No OCR, cron or queue configuration was changed to obtain that recovery. Legacy API/unknown-path routing retained its documented behavior.

Local logs, package copies, raw benchmark JSON and operator probes remain ignored under `project-docs/parser-audit/`; no credentials are included in public evidence. Later documentation-only commits do not change the verified parser runtime revision.

Next: profile realistic workbook/native parser memory and full response/merge costs on representative hosts, then evaluate admission/deadlines before any concurrency increase. The CSV reduction alone does not justify raising queue or worker limits.
