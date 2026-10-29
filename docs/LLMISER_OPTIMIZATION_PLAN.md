# LLMiser optimization continuation

Updated 29 October 2026. Work only in LLMiser. This is the current continuation map; copied MDify analysis is historical evidence and proposals, not live deployment instructions. Blog rebranding is complete and blog sources/visuals are outside this implementation slice.

## Current continuation state

PRs #1–#17 are merged. Recovery, cron cutover, wake coalescing, reader statistics, large previews, CSV/Excel/final-result memory and shared conversion deadlines are released. Legacy hosting/redirects remain live. Earlier 22 October branch/review statements below are historical; use [START_HERE](START_HERE.md) and [PROGRESS](ai-handover/PROGRESS.md) for current deployment evidence.

Shared reader statistics shipped in PR #9 at `84e510db62ea41f31c131771eb7d32b5e92515f4`: one allocation-bounded helper, one memoized result for reader line/status displays, preserved counting semantics and reproducible before/after measurements. See [reader statistics](LLMISER_READER_STATISTICS.md) for 259-test CI and live verification. Browser profiling follows below; the rest of the queue remains separate. No new production SQL or service retirement was part of this slice.

PR #11 released [large-preview control](LLMISER_LARGE_PREVIEWS.md) at `0501cd0381b4a41e9a9e94abf791ebd4fd8fd188`. Browser-generated dense Markdown exposed multi-second mount/layout work. Automatic formatting now pauses above 50,000 characters; full formatting is explicitly available, and raw content/exports are complete. Local checks passed 261 tests, the final 20-test selection and production build; all seven CI jobs and all six production deployments passed. The 28 October audit passed 20 HTTP checks with all pools 2/2 ready. Next work should measure native textarea input/representative devices or audit backend parser capacity; a worker alone will not eliminate the observed DOM/layout cost.

PR #13 released [a source capacity audit and CSV allocation reduction](LLMISER_PARSER_CAPACITY.md) for N/Z at `165d2b01ce8e30dfa09d32292ac911264f18e60d`. It preserves output on verified MarkItDown 0.1.8/0.1.9 and falls back unchanged on other versions. Three fresh processes per mode show lower large-fixture peak memory; no concurrency/limit changes are justified by that local evidence. All seven CI jobs and six production deployment statuses passed. Pre/post-release generated CSV/ZIP probes passed on all four document workers; 20 public HTTP checks passed and a follow-up uncached wake confirmed all pools 2/2 after an initial OCR 0/2 result. Next measure workbook/native and final response/merge costs before extending this slice.

## Verified starting point

Released [shared conversion deadlines](LLMISER_SHARED_DEADLINES.md), PR #17 at `9131a2ac6163f22b630b008b40accb482ed3e0b3`. Optional authenticated absolute deadlines and monotonic cooperative worker checks preserve legacy callers and durable job/lease rules. All seven CI jobs and six Vercel production statuses passed; all six workers reported the exact revision/readiness. Thirty protocol checks, eight workbook/ZIP comparisons, four post-release Storage conversion/recovery jobs and 20 HTTP checks passed. Native preemption, exact-once writes and capacity tuning remain separate. Controller detail pagination is next.

Released [Excel and final-result assembly memory](LLMISER_EXCEL_ASSEMBLY_MEMORY.md), PR #15 at `3db41140521d5cfb1bb3bfd12865feca5a8cc95b`: sequential sheet processing, exact bounded word counts and delayed archive output encoding. Three fresh-process trials per mode preserve complete hashes; local peak reductions are qualified by timing variability/XLS regression. All seven CI jobs passed before/after merge; six production Vercel statuses succeeded; all six N/O/Z workers report the exact revision and readiness. Eight generated multipart probes, two production Storage conversion/recovery checks and 20 HTTP checks passed; all pools are 2/2 ready. No SQL, concurrency, retention or blog changes.

The copied source already contains atomic job startup/finalization, cleanup recovery, upload/active-job/storage-reservation admission, shared archive container checks, bounded PDF page uploads/OCR preparation, lazy Markdown/highlighter loading and current-edit export snapshots. Do not reimplement these based on old “proposed” checklist rows. Their deployment/capacity evidence is distinct from source tests.

Search migration and public redirects are live; see [search migration](LLMISER_SEARCH_MIGRATION.md). Analytics ingestion is verified; controller login/configuration is verified but authenticated operations are not; see [access and analytics](LLMISER_ANALYTICS_CONTROLLER.md). Keep-warm Vault and cron changes were applied and verified in the earlier cron task. Dependency-aware service retirement remains separate operational work.

## Current slice: retained result recovery

Branch: `codex/result-download-recovery`. Implementation and local acceptance are complete; CI/review and a separate release decision remain. This is not the production revision.

Problem: a completed conversion whose final Storage download failed lost its job reference. Retry uploaded and converted again. Recent-session persistence also discarded job/output identity.

Changes:

- Retain completed-job identity before reading Markdown bytes. Keep its reference on failure and in the five-entry browser history.
- Retry obtains fresh links for the same completed job, including every numbered archive part. No reupload, worker execution or new conversion is needed for this recovery.
- Persist job identity and output names/kinds/byte counts, never signed URLs, raw Storage paths or secrets. Old content-only sessions still work. Large results that exceed browser quota can retain just their recovery metadata.
- Preserve empty edits as cached content. Server deletion prevents fresh retrieval without discarding a local Markdown copy.
- List every returned original output on desktop/mobile, including project indexes and manifests. Original server outputs are distinguished from editable Markdown exports.
- Explain the browser reference/retrieval behavior in the Privacy Policy. The policy version is updated to 21 October 2026, so existing users are asked to accept the revised text on the next deployment.

No database migration, backend protocol, pool change, new application dependency or blog edit is required. This slice covers completed-result retrieval. Recovery of a browser closed during upload or before completion remains separate.

Acceptance: expired link, later-part failure, complete Unicode assembly, restart, deleted result, metadata-only quota fallback, signed-link privacy, named-output validation, cached legacy/empty content and current-edit exports. Record actual checks below before release.

## Remaining implementation queue

| Work | Next bounded change / dependency |
| --- | --- |
| Shared statistics and large previews | Counting released in PR #9; browser profiling and large-preview control released in PR #11; measure native input/devices before deeper editor/worker changes |
| Backend parser capacity | CSV released in PR #13; Excel/final-result memory released in PR #15 with production XLSX/ZIP Storage acceptance. Profile native/concurrent parsing and whole-result normalization/serialization on representative hosts before queue tuning |
| Shared deadline | Released in PR #17; per-invocation propagation/reserves, simulated slow/cold paths and real protocol/OCR/PDF/ZIP Storage acceptance. Preserve cooperative-cancellation and replay-fencing limits |
| Controller detail pagination | Top-level lists already paginate; bound files/tree/events/work-items with stable cursors and truthful totals; query-plan evidence before new indexes |
| Replay-stable object identities | Fence attempt-specific writes before deterministic IDs; SQL attempt guards alone do not prevent a stale Storage overwrite; additive rollout for new roots only |
| Observability | Allowlisted timing, attempts, cleanup age and cron diagnosis; no content/signed links/secrets; notification destination needs user authorization |
| Storage reconciliation | Bounded read-only inventory first; protect active/KEEP/reservation ownership and grace periods; destructive cleanup policy remains conditional |
| Reproducible dependencies | Constraints/base/model verification and clean builds; do not duplicate heavy local environments |
| Conditional experiments | O2 standby, PDF fast paths, region OCR/deeper nesting/server ZIP require the stated demand, fidelity and capacity evidence; do not silently expand scope |

The remaining queue is not an effort percentage. Track implementation, local regression/browser evidence, CI and deployed behavior independently. Do not apply production SQL or retire old services merely to complete a checklist.

## Current verification

- Full frontend regression suite: **232 passed, 0 failed** on 22 October 2026. Log: private `project-docs/optimization-evidence/frontend-tests.log`.
- Synthetic browser flow: initial final-download 403, browser reload, metadata-only recent-session recovery, complete Markdown download. Fixture counters remained **1 upload, 1 conversion start, 1 retrieval**. No production conversion services were called.
- After the final named-output signing refinement and visible error guidance: **37 focused tests passed**, covering route handling, result recovery, output rendering, edited exports and legal text.
- Final production build and lint passed. All **190 local HTTP smoke checks** passed against the final build.
- The browser restored the cached result/output list after another reload. Both downloaded `.md` and ZIP contained the exact latest edit, including Unicode. The four original outputs were listed separately from edited exports. Browser acceptance used the responsive layout at a 656 px content width; no separate desktop/390 px acceptance is claimed here.
- A second isolated browser fixture returned 410 on retry. The queue visibly instructed the user to remove the entry and choose the original file again; counters remained **1 upload, 1 conversion start, 1 retrieval**, with no automatic reconversion.
- Unit checks cover legacy/empty cached text, quota fallback, later-part network failure, cancellation, removed-item identity and named-output allowlisting. The browser transport was synthetic; this is not live worker/storage acceptance.
- CI/review and production deployment of this branch remain separate. The production redeploy used `ae3aa59` only to activate Analytics. Private build/test logs and browser screenshots remain under `project-docs/optimization-evidence/` and are not published.
