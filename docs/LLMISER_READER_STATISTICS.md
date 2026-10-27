# Shared reader statistics

Updated 27 October 2026. This is the first measured slice of the statistics/large-preview queue. It changes document counting only; Markdown parsing, preview fidelity, editing, export and server token overrides keep their existing behavior.

## Problem and implementation

The reader split the document into a line array, then its status bar split it into another line array and a word array and created a whitespace-stripped text copy. The header carried a separate statistics implementation. On large converted documents those temporary allocations and repeated scans caused unnecessary main-thread work.

`frontend/lib/documentStats.js` now supplies both existing public helper shapes. It counts words, LF lines, UTF-16 characters and characters excluding ECMAScript whitespace without document-sized intermediate arrays or stripped text. A native whitespace probe handles long unbroken source lines efficiently. The reader memoizes one result for its deferred buffer and supplies that same result to its status bar and line label. The independently committed header content uses the same helper, with its own component memoization; no global document cache or cross-user state is introduced.

Empty content, whitespace-only content, CR/LF behavior, trailing LF, surrogate pairs, reading-time thresholds and the existing four-character token estimate are preserved. These are existing approximate metrics, not a new model tokenizer or language-specific word segmenter. No new UI strings, translations, dependencies, database changes or blog edits are needed.

The existing deferred editing behavior remains. React memoization is a performance aid, not a correctness requirement; recalculation yields the same result. See [React useMemo](https://react.dev/reference/react/useMemo) and [useDeferredValue](https://react.dev/reference/react/useDeferredValue).

## Reproducible measurements

From `frontend`:

```sh
node --expose-gc --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/benchmark-document-stats.mjs
```

Node 22.16.0 on this Windows machine; nine timed samples per implementation/fixture, median milliseconds after two warmups, with explicit GC between samples. The baseline reproduces the previous reader's line split plus status-bar counting. Fixtures repeat ordinary invoice Markdown, multilingual Markdown and a single unbroken ASCII line. Sizes below are UTF-16 code units, not file bytes. The script is informational and has no timing assertion in CI.

| Fixture | Characters | Previous ms | Shared ms |
| --- | ---: | ---: | ---: |
| Markdown | 10,240 | 0.473 | 0.726 |
| Markdown | 1,048,576 | 37.602 | 9.044 |
| Markdown | 5,242,880 | 525.441 | 82.910 |
| Multilingual | 10,240 | 0.511 | 0.145 |
| Multilingual | 1,048,576 | 96.818 | 11.926 |
| Multilingual | 5,242,880 | 1,230.881 | 114.926 |
| Unbroken line | 10,240 | 0.052 | 0.018 |
| Unbroken line | 1,048,576 | 2.980 | 1.306 |
| Unbroken line | 5,242,880 | 14.666 | 6.938 |

Large mixed fixtures improved about 4–11 times in this run; the long-line fast path improved about two times at large sizes. The small Markdown sample regressed by 0.253 ms. Machine load, engine warmup and document structure affect timings; these are synthetic Node measurements, not production browser interaction or cost measurements. Reduced allocation follows from the algorithm; no peak-memory percentage is claimed.

## Verification and next boundary

The focused statistics/actual-component suite passed 11 tests. New coverage compares prior semantics across every BMP code unit, representative large documents, empty and reading-time boundaries, and rendered reader/header/status outputs with explicit token overrides. Existing lazy preview, escaped fallback, GFM, highlighter and output-link tests remain in that selection.

[PR #9](https://github.com/DevBehindYou/LLMiser/pull/9) merged and deployed runtime revision `84e510db62ea41f31c131771eb7d32b5e92515f4`. CI passed all 259 frontend tests and all seven jobs, including lint, six dictionaries, SQL/blog consistency and production build. All six production Vercel status contexts succeeded. Local full regression had 257 passes and two sandbox-blocked Git fixture tests; those two passed when rerun with filesystem access. Local lint, consistency checks and production build also passed. No application failure was bypassed.

The post-deployment audit passed 20 public HTTP checks, preserving migrated-page paths/queries and canonical discovery/health responses. Normal/OCR/archive pools each reported 2/2 ready. The production browser loaded the localized German app and zero-content counters correctly. No new real upload, authenticated controller action or cleanup deletion was performed; component fixtures and Node benchmarks do not establish production browser typing latency. Private logs and raw results remain under `project-docs/optimization-evidence/`.

The remaining large-preview work still needs browser long-task/render profiling on representative devices. Counting is bounded in auxiliary memory but remains linear in text size, and large Markdown AST rendering can still block. This slice does not justify a worker, truncation, pagination or a fidelity change by itself. Keep raw editing and complete exports intact if later measurements support a bounded preview.
