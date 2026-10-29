# Controller detail pagination

Released 29 October 2026 in [PR #19](https://github.com/DevBehindYou/LLMiser/pull/19), production frontend revision **`efbeab60026b0e77a71a3d16822d81bbe6f81f2b`**, source `a156dd7a417b853a1c7cde9d8f604967cfcb4ba9`. All seven CI jobs passed before and after merge, including **279 frontend tests**, lint/consistency checks and production build. All six Vercel production statuses succeeded. Authenticated production pagination, complete generated-file retrieval and bundled-font acceptance passed. No backend runtime revision change is inferred from hosting status alone.

Opening a large job previously returned all content nodes, work items, events and registered files. The controller now starts with 50 records per section, with independent **Load more** and retry controls. Counts distinguish loaded rows from the full section total. The tree and status badges explicitly describe loaded records; Refresh restarts every section. Six interface languages are supported; blogs and their visuals are unchanged.

## Read and export contracts

- Authenticated `GET /api/admin/jobs/:id` returns the job summary, four bounded arrays and `pages` metadata (`total`, `next`, and whole-job `active_total` for files).
- `?section=files|nodes|items|events&limit=50&cursor=...` reads one section. Default 50, maximum 100. Files additionally accept `stored=1` and `kind=INPUT|OUTPUT|EXPORT|PREVIEW`.
- Every query is scoped to the validated job UUID. Stable ascending order uses sequence/UUID for nodes and timestamp/UUID for the other sections. Opaque cursors bind job, section and file filters. PostgreSQL timestamp microseconds are preserved.
- Updated clients send `x-llmiser-detail-paging: 1`. An authenticated old cached client receives 409 with reload guidance, preventing its old ZIP code from exporting only page one. Authentication precedes this check. Sessions, compatibility cookies/CSRF headers, no-store/noindex and existing action/audit rules remain intact.
- Exact totals use PostgREST `Prefer: count=exact` and `Content-Range`. Later cursor requests also issue a HEAD count without the cursor. Initial detail reads use six REST calls: job summary, four section reads and active-file count. Counts and pages are separate reads, not a transactionally consistent snapshot; running jobs can change. Refresh reconciles them.
- ZIP actions resolve every matching ACTIVE file page before signing or downloading. Single-job ZIPs include all stored file kinds; selected-job ZIPs include OUTPUT files. Existing 200-file/200 MiB limits remain. Missing pages, duplicate IDs, changing counts, errors and cancellation reject collection rather than silently exporting an incomplete list. A change after collection can still make a signed download fail; this is not a Storage snapshot.

No migration, index, RLS, retention, worker, pool, cron or service setting is changed. The existing `get_job_tree` RPC remains available for compatibility; this controller stops calling it.

## Implementation map

| Location | Responsibility |
| --- | --- |
| `frontend/lib/server/adminService.js` | Field allowlists, validation, stable cursors, bounded detail sections |
| `frontend/lib/server/supabaseRest.js` | GET/HEAD exact-count response handling; existing calls retain their old shape |
| `frontend/app/api/admin/jobs/[id]/route.js` | Authenticated paging negotiation and section routing |
| `frontend/lib/models/adminDetail.js` | Page deduplication and complete export metadata collection |
| `frontend/viewmodels/useAdminViewModel.js` | Independent section state, aborts and generation guards on refresh/job switch |
| `frontend/components/admin/JobDetail.js` | Loaded/total controls, Refresh and partial-tree notice |
| `frontend/lib/models/contentTree.js` | Set membership for PDF partitioning; PROCESSING status summaries |

## Local evidence and limits

Focused service, transport, route, export, React hook, localized rendering and tree checks passed: **12 tests**. Migrated PostgreSQL fixtures contain 123 records per section for two jobs, tied keys and microsecond timestamps. Traversal has exact IDs with no gaps or duplicates; filters and cursors cannot be reused across jobs/sections. A simulated server row cap still produces continuation. React tests exercise job switches, late responses despite abort, repeated clicks, concurrent sections, page failure/retry and refresh invalidation. Controls render counts, disabled state, live announcements and retry alerts in all six languages. `react-test-renderer` 18.3.1 is a development-only dependency matching installed React.

Generated local measurement: 21 jobs and 22,000 rows per section, including 2,000 rows per section in the target job. The previous response shape was **3,701,322 bytes**; the initial bounded response was **65,901 bytes**, about **98.2% smaller**. This compares serialized response sizes, not heap peaks or page latency. All four collections traversed completely in 20 pages of 100 rows. Typed PostgreSQL EXPLAIN queries used existing job indexes for initial/deep reads and scoped counts. Some queries still sort/filter a job's matching rows; exact counts scan matching entries. This is evidence against adding an index in this slice, not a production latency or constant-cost guarantee. Raw generated plans and logs are private under `project-docs/controller-pagination/`.

Reproduce generated plans/sizes from `frontend` with `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/measure-controller-pagination.mjs`. This creates an in-memory migrated PGlite database and prints JSON; it does not contact production. Run `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/adminDetail*.test.mjs test/contentTree.test.mjs` for focused regression.

Production baseline: one generated 72-text-file ZIP completed through the public Storage flow. Authenticated detail returned 73 nodes, four registered ACTIVE files, one work item and two events. The job has normal 48-hour retention; no cleanup or retention mutation was performed. After release, compare every section's IDs against this baseline, retrieve every stored file and reopen a ZIP containing them. No user documents are needed for acceptance.

Full local regression: 276 of 278 passed in the sandbox; the two deployment-scope tests could not create temporary Git configurations. Both passed when rerun outside the sandbox. Lint, six dictionaries (637 messages each), SQL consistency, blog consistency and diff whitespace checks passed. The initial lint/build attempt also encountered local filesystem restrictions; elevated lint and production build passed. All seven Linux CI jobs passed; its full frontend run passed all 278 tests and build. React/SSR acceptance does not establish native browser layout, mobile overflow or representative-device performance.

## Hosting fix and deployed acceptance

The owner's log for the first preview identified Next.js 14.2.35's Google loader extension regex returning null at `loader.js:112`. Initial local/CI builds did not reproduce that URL-format failure. The fix bundles the exact 16 existing WOFF2 files, all 25 face declarations, Unicode ranges, weights, fallback metrics and three Latin preloads (93,996 bytes). `frontend/app/fonts.css` and `frontend/public/fonts/` replace the Google loader; official pinned SIL licenses and hashes accompany the files. Versioned `/fonts/v1/` assets retain one-year immutable caching. Changed bytes must use a new version path. No font/framework upgrade or runtime dependency was added.

The final clean local production build passed with invalid HTTP(S) proxies configured and telemetry disabled; there is no Google font import left. Thirteen focused tests passed, including font integrity. Updated CI passed 279/279 frontend tests, all seven jobs and the real Vercel frontend preview. All seven jobs passed again on merged main; all six production Vercel statuses succeeded. The original failed preview remains historical evidence, not an unresolved blocker.

Production acceptance reused one generated public Storage ZIP job, with 72 text entries and normal 48-hour retention:

| Section | Initial rows | Full total | Verified traversal |
| --- | --- | --- | --- |
| Registered files | 4 | 4 | 4 one-row pages, exact IDs |
| Content nodes | 50 | 73 | 6 pages at limit 13, exact IDs without gaps/duplicates |
| Work items | 1 | 1 | 1 page, exact IDs |
| Events | 2 | 2 | 2 one-row pages, exact IDs |

All four ACTIVE files were collected through paginated metadata, individually signed and downloaded, then assembled into a ZIP and reopened with all four entries present. This exercises the shipped collection helper and real API/Storage reads; it is not native browser button/layout acceptance. Old authenticated cached clients received 409, unauthenticated clients 401 and an invalid page limit 400; responses retained no-store/noindex. Sign-in/sign-out and audited file signing passed. No deletion, retention change, bulk operation or cleanup execution was tested.

All 16 production font responses matched the pinned hashes and immutable cache headers. Production HTML retained three local preloads; delivered CSS used local font URLs without Google font endpoints. All 20 public HTTP/discovery/permanent-redirect checks passed. An uncached POST wake returned normal/OCR/archive each **2/2 ready**. Worker code and settings were unchanged; this acceptance does not recertify backend revision or capacity.

Private evidence and reproducible operator scripts are in `project-docs/controller-pagination/` (`after.json`, `http-after.json`, `deployment-statuses.json`, CI logs and generated plans). Credentials were read into memory only; no keys, cookies, signed links or user documents were published. The single generated job expires normally on 31 October 2026 at 17:43:53 UTC; no new post-release conversion job or manual cleanup was needed. Native browser/mobile layout acceptance remains separate. Continue the remaining optimization queue rather than reimplementing this slice.

PostgREST documents [pagination/count headers and HEAD](https://docs.postgrest.org/en/stable/references/api/pagination_count.html). PostgreSQL explains why [unique ordering is necessary and large offsets remain costly](https://www.postgresql.org/docs/16/queries-limit.html). These contracts guide the cursor design; production measurements must remain separate from local generated evidence.
