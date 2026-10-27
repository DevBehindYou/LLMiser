# LLMiser optimization continuation

Updated 27 October 2026. Work only in LLMiser. This is the current continuation map; copied MDify analysis is historical evidence and proposals, not live deployment instructions. Blog rebranding is complete and blog sources/visuals are outside this implementation slice.

## Current continuation state

PRs #1–#8 are merged. Retained-result recovery, cron cutover and wake coalescing are released; the old frontend is now the static LLMiser fallback and public migration redirects remain live. The 22 October branch/review statements below are historical evidence for that earlier slice, not current release blockers. Use [START_HERE](START_HERE.md) and [PROGRESS](ai-handover/PROGRESS.md) for deployment state.

The next bounded slice is shared reader statistics on `codex/shared-document-statistics`: one allocation-bounded helper, one memoized result for reader line/status displays, preserved counting semantics and reproducible before/after measurements. See [reader statistics](LLMISER_READER_STATISTICS.md). Parser/preview profiling and the rest of the queue remain separate; no new production SQL or service retirement is part of this slice.

## Verified starting point

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
| Shared statistics and large previews | Shared counting slice implemented with reproducible measurements; finish CI/release, then profile browser rendering before considering a bounded preview/worker |
| Backend parser capacity | Audit all parsers beyond the already-shipped PDF/OCR preparation bounds; preserve fidelity and measure synchronized memory before tuning concurrency |
| Shared deadline | Add an optional, backward-compatible remaining-budget protocol, reserving finalization time; test slow failures/cold starts |
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
