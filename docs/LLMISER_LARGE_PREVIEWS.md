# Large Markdown previews

Updated 28 October 2026. This follows the [shared statistics release](LLMISER_READER_STATISTICS.md). Generated browser fixtures confirmed that Markdown parsing, highlighting and DOM/layout remain expensive after counting was optimized.

## Behavior

Documents above **50,000 UTF-16 code units** initially pause formatted rendering in Split and Rendered modes. The notice explains that the complete Markdown remains available in Raw mode and exports. **Render full preview** requests full-fidelity formatting for that document value; **Pause formatted preview** releases the formatted tree. An edit pauses the large preview again as the deferred text advances. Changing documents resets the request, including when the text is identical. Undoing to an older requested value also requires a new request after that edit has settled.

The source is never sliced. Small documents keep automatic formatted previews. Raw editing, current-buffer copy and the existing pending-edit export snapshot path remain available. No conversion format, uploaded file limit, retention setting, database protocol or blog content changes. Three new interface messages are included in all six dictionaries (631 messages each); documents are not translated.

## Why this boundary

A local production-React component harness used the actual reader with generated multilingual Markdown, tables, lists and code. On Chrome 156 / Windows, 1281×720 viewport, three fresh mounts per raw/split fixture, the baseline split viewer had 15,940 elements at 102,400 characters, 40,754 at 262,144 and 162,884 at 1,048,576. Its two-animation-frame measurements ranged about 1.7–2.3 seconds, 5.1–7.3 seconds and 16.8–27.2 seconds respectively. This is sufficient evidence to avoid automatic full rendering of large results.

The 50,000-character threshold is a conservative convenience between the 10K and 100K samples, not a measured universal latency cutoff. Complexity matters: dense GFM can be expensive below the limit. Raw view also had significant layout delays on the 1M fixture, so this change does not establish smooth million-character typing. Explicit full rendering still has the original parse/layout cost and can freeze the tab temporarily.

Median local split-view measurements (three runs per cell):

| Characters | Previous commit ms | Paused commit ms | Previous two-frame ms | Paused two-frame ms | Previous / paused elements |
| --- | ---: | ---: | ---: | ---: | ---: |
| 10,240 | 87.0 | 87.4 | 259.5 | 177.3 | 1,618 / 1,618 |
| 102,400 | 714.0 | 17.5 | 2,194.5 | 287.1 | 15,940 / 45 |
| 262,144 | 1,935.2 | 37.5 | 6,985.1 | 525.2 | 40,754 / 45 |
| 1,048,576 | 9,320.0 | 115.1 | 18,221.4 | 1,802.0 | 162,884 / 45 |

The paused state deliberately skips formatted parsing/DOM construction; these numbers compare different initial display behavior, not a faster full parser. Final after measurements ran without concurrent builds/tests. Samples are informational on this machine; scheduling, warmup and fixture density affect them. The small fixture still formats normally and its commit cost is essentially unchanged. Raw text was exact in all 24 after samples.

See [the reproducible local harness](../frontend/scripts/preview-profile/README.md). It uses production React with unminified JavaScript, app CSS, no CPU throttling and generated data only. The initial mount is synchronous; two-frame and settle measurements are not INP, first-paint metrics or production conversion timings. Initial baseline long-task capture omitted the already-running mount task; the final harness corrects this, so baseline/after long-task totals must not be compared. No memory percentage, device-wide speedup or user cost saving is claimed.

## Verification and release

Component tests cover the exact size boundary, escaped full raw text including the end marker, paused Split/Rendered modes, and existing small-document GFM/highlighter/failure behavior. The full local frontend suite passed **261 tests**; the final reader/export/localization selection passed **20 tests** after the request-reset refinement. Six dictionaries passed key/content/placeholder checks, standalone lint and the final production build passed with normal filesystem access. The first sandbox build compiled/generated pages but failed on standalone output permissions; its completed normal-access rerun is the build evidence. SQL and blog consistency checks passed.

Interactive browser checks confirmed that a 60,032-character fixture renders its final Unicode marker, editing re-pauses it, and Copy returns all 60,044 characters including the latest edit. The final harness changed `docId` without remounting the outer reader and confirmed the render request resets even for identical text. Its downloaded `.md` exactly matched all 60,045 characters of the current edited textarea, including the final Unicode marker and appended edit. This exercises the actual reader and pending-editor export helper; it is not a new live conversion/storage acceptance run. Raw generated results/screenshots remain private under `project-docs/optimization-evidence/`.

[PR #11](https://github.com/DevBehindYou/LLMiser/pull/11) merged and deployed runtime revision `0501cd0381b4a41e9a9e94abf791ebd4fd8fd188` on 28 October 2026. CI passed all 261 frontend tests and all seven jobs; all six production Vercel status contexts succeeded. The post-release audit passed 20 public-page/discovery/health and permanent-redirect checks; normal/OCR/archive pools each returned 2/2 ready. Legacy API/unknown-path routing retained its documented behavior. No live upload, authenticated controller action or cleanup deletion was performed. Later documentation-only commits do not represent a new reader runtime change.

Further work should measure native textarea/input behavior and representative devices before choosing a worker, editor virtualization or incremental parser. Full fidelity and complete exports remain required; a worker alone would not remove the measured DOM/layout cost.
