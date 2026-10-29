# Excel and final-result memory

Updated 29 October 2026. Candidate implementation on `codex/excel-assembly-memory`; production release is not yet claimed. This follows the released [CSV capacity work](LLMISER_PARSER_CAPACITY.md).

## Changes and fidelity

Normal and archive workers register identical `app/excel_converter.py` adapters through MarkItDown's converter API. On verified MarkItDown 0.1.8/0.1.9, they open one pandas `ExcelFile`, parse a sheet, render it through the existing pandas HTML and MarkItDown HTML converter, then release that sheet's DataFrame/HTML before parsing the next. Full per-sheet inference and formatting remain: row-level rendering could change float/type formatting. XLS additionally requests xlrd on-demand loading and unloads each parsed raw sheet; old BIFF versions that disable on-demand loading retain xlrd's fallback.

The adapters preserve sheet order, empty/hidden sheets, duplicate headers, dates, mixed types, formulas' existing cached-value behavior, Unicode and complete trailing content. XLSX's legacy `showZeroes` repair retries the whole workbook after discarding partial output, closes the repaired stream and does not misclassify HTML failures as workbook failures. A custom XLSX image hook retains the upstream path. Unknown MarkItDown versions or an unavailable repair helper retain built-in converters; do not expand the allowlist without equivalence tests.

References: [MarkItDown 0.1.9 Excel implementation](https://github.com/microsoft/markitdown/blob/v0.1.9/packages/markitdown/src/markitdown/converters/_xlsx_converter.py), [pandas ExcelFile](https://pandas.pydata.org/docs/reference/api/pandas.ExcelFile.html), [xlrd on-demand loading](https://xlrd.readthedocs.io/en/latest/on_demand.html).

Shared profile finalization and raw-piece counts now count words in 64 Ki-character slices. Boundary correction preserves Python `str.split()` semantics, including Unicode/control whitespace and words spanning slices. Word/token statistics and all four profile strings stay identical. This avoids a whole-result list of temporary word strings; it does not truncate the result. The common package remains byte-identical across N/O/Z, with no MarkItDown dependency added to OCR.

Archive final writes keep complete text parts and their UTF-8 byte counts. Preflight still measures every part, continuation heading, index and manifest before the first upload. Encoding occurs inside the existing four upload workers, instead of keeping every encoded output simultaneously. The combined string can be released once parts exist. Paths, order, metadata, warnings, byte limits, Storage errors and full exports retain their contract. Individual outputs and all parsed entries are still materialized; this is not streamed end-to-end processing.

Backend `/api/v1/health` may additionally report `revision` from a valid provider `RENDER_GIT_COMMIT` or `VERCEL_GIT_COMMIT_SHA`. Only a 40/64-character hexadecimal commit identifier is accepted; no arbitrary environment value is exposed. This supports checking Render as well as Vercel rollout of the shared counting code. Existing health fields remain.

## Reproduction and interpretation

Install the existing normal/archive development requirements, including `xlwt` solely for generated legacy XLS fixtures. There is no added runtime dependency. Use a verified MarkItDown version and run from the repo root, one process at a time:

```sh
python tests/load/excel_assembly_bench.py --case excel --mode upstream --ext xlsx --sheets 6 --rows 2500
python tests/load/excel_assembly_bench.py --case excel --mode current --ext xlsx --sheets 6 --rows 2500
python tests/load/excel_assembly_bench.py --case excel --mode current --ext xls --sheets 6 --rows 2500
python tests/load/excel_assembly_bench.py --case assembly --mode current --characters 6000000
python tests/load/excel_assembly_bench.py --case counts --mode current --characters 12000000
```

Repeat every case in both modes, three fresh processes per mode, alternating order. `upstream` Excel re-registers the built-in converter; assembly/counts load source from baseline `3f0501ab01302abd0f8402a91741de63d2c256d7`. Use `--heap` separately for allocation tracing; its overhead makes traced timing unsuitable for throughput claims. Workbook generation runs outside the measured child. The script clears Storage settings/disables dotenv before imports, uses generated data only, and makes no server/Storage requests. Assembly uses a discard uploader that hashes complete bytes.

Process peaks are lifetime high-water readings including imports; pre-run readings are recorded too. Python heap tracing starts after fixture/engine setup. Compare complete output byte counts/hashes, word/token statistics and uploaded bytes before accepting memory differences. Local Windows/Python 3.14 results do not establish Linux/Python 3.12 hosting capacity, billing savings, platform ceilings or safe concurrency.

## Measured results

Windows/Python 3.14.6, MarkItDown 0.1.9, pandas 3.0.5, openpyxl 3.1.5 and xlrd 2.0.2. Median of three fresh processes per mode, alternating order; 42 measured processes on 28–29 October. The operator paused/resumed the matrix between completed trials. No build/regression workload ran alongside measurements. Every fixture's complete output hash/byte count matched between modes; result-count statistics and all archive object hashes matched too.

| Fixture | Tracing | Upstream / current seconds | Upstream / current process peak MiB | Upstream / current traced heap MiB |
| --- | --- | ---: | ---: | ---: |
| XLSX, 1 sheet × 100 rows | Off | 0.239 / 0.126 | 143.84 / 143.76 | — |
| XLSX, 6 sheets × 2,500 rows | Off | 32.462 / 22.965 | 201.07 / 197.57 | — |
| XLS, 6 sheets × 2,500 rows | Off | 13.654 / 17.545 | 202.59 / 191.91 | — |
| ZIP assembly, four 6M-character entries | Off | 2.325 / 1.583 | 624.70 / 530.28 | — |
| Profile finalization, 12M characters | Off | 0.245 / 0.145 | 278.23 / 231.70 | — |
| Same ZIP assembly | On | 7.945 / 5.807 | 958.38 / 530.26 | 424.90 / 366.22 |
| Same profile finalization | On | 4.440 / 2.431 | 446.92 / 231.65 | 166.35 / 137.33 |

Untraced peaks fell about 2% for XLSX, 5% for XLS, 15% for ZIP assembly and 17% for profile finalization. The small workbook's import-dominated peak was essentially unchanged. XLS elapsed median regressed; multi-sheet XLSX ranged 11.282–35.929 seconds upstream and 20.422–28.168 current, while XLS ranged 7.757–28.077 and 6.955–45.787. This variability precludes a general speedup claim. Tracing notably increases upstream process memory, so do not substitute traced process differences for normal runtime savings.

Both multi-sheet formats produced 1,058,518 identical Markdown bytes, SHA-256 `73da8bc46453187aabb0fd994c148ebd15a9166731cf6b1755570a04e177ffaa`. Assembly wrote 29,457,096 total object bytes through the discard uploader in both modes. The profile fixture retained 3,000,009 words / 3,990,012 estimated tokens. ZIP measurements include both word-count and output-buffer changes, rather than isolating encoding alone. Raw JSON/logs stay ignored in `project-docs/excel-audit/`.

## Validation and rollout

Local MarkItDown 0.1.9 suites: 144 normal tests and 101 archive tests passed, with the existing FastAPI/Starlette test-client deprecation warning. Tests cover upstream output equality, normal/ZIP routing, release of prior frames/raw sheets, exception cleanup, late workbook repair, image hooks, actual unknown-version conversion fallback, Unicode word boundaries, unchanged profiles, upload buffer bounds and all existing preflight limits.

MarkItDown 0.1.8 passed all 24 Excel/count checks. With the original local 0.1.7 installation, 13 fallback/count/integrity checks passed and 11 deliberately disabled adapter cases skipped. Small generated authenticated multipart probes passed before release: three workbooks on each normal worker and a ZIP containing all three on each archive worker (eight requests total). All four reported MarkItDown 0.1.9; complete expected tables and word counts matched. These direct probes created no Storage jobs.

Local OCR validation initially lacked `pytesseract`; a no-dependency copy of 0.3.13 was installed only in the ignored audit folder. The full Windows suite then recorded 69 passes, eight orientation skips and one readiness failure claiming the configured binary was unavailable. Isolated readiness and a real text-image conversion both passed with the installed Tesseract 5.4.0. The suite failure remains recorded rather than hidden by weakening assertions. Linux/Python 3.12 OCR CI is required before merge; production Render uses Tesseract 5.5.0.

Before release, the actual public frontend transport also passed generated XLSX and three-workbook ZIP conversions through create/upload/start/advance, Storage downloads and fresh-link retrieval. The single document output and all three ZIP objects downloaded successfully; table bytes, declared object lengths, final Unicode markers and exact recovered Markdown passed. This created two real jobs under normal retention. It validates the preceding production behavior; repeat after deployment to validate the candidate's Storage path.

CI, deployment and post-release checks are still pending. Do not treat local checks as production release evidence. No blogs/visuals, database schema, retention policy, queue/concurrency settings, supported formats or limits change in this slice. Native parser peaks, retained archive entries, whole-result normalization/serialization, concurrent requests and real Storage/network buffers remain separate boundaries.
