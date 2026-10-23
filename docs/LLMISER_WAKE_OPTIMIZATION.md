# App wake request optimization

Updated 23 October 2026. Branch `codex/wake-request-coalescing`, based on production source `ae3aa59`. This app change is separate from the already-applied Supabase scheduler change and the completed-result recovery feature.

## Current implementation status

| Slice | State |
| --- | --- |
| Completed-result recovery | [Draft PR #1](https://github.com/DevBehindYou/LLMiser/pull/1), checks passed; not merged or released |
| Supabase cron/wake targets and idle dispatch | [PR #2](https://github.com/DevBehindYou/LLMiser/pull/2), source checks passed at `c827528`; SQL applied and verified live |
| App wake concurrency/cache | Implemented on this branch; local verification below; review/release separate |

The resumed live Supabase check confirmed four enabled jobs, both latest OCR receipts at HTTP 200, six tracked tick requests with no errors or pending responses, and no failed cron runs in the preceding 12 hours. The final idle lease-maintenance definition is enabled. Private evidence: `project-docs/cron-evidence/live-cron-health-2026-10-23.png`. Do not rerun the full database setup or recreate jobs to deploy this app-only change.

## Trigger and resulting behavior

Previously, `/api/wake` cached only completed results. Requests arriving together before the first wake completed each pinged every configured backend. A slow wake also consumed most of the ten-second cache window before a result was available.

`frontend/lib/server/wake.js` now shares a pending operation between requests with the same pool configuration and timeout. The cache window starts when the operation finishes. Configuration changes cannot reuse another pool's readiness, and an older operation finishing late cannot replace the current configuration's cache. Partial backend failures retain the same counts-only response. Backend URLs and raw errors are not returned.

The response shape, health endpoint, eight-second ping timeout, public admission checks, backend routing, cron schedules and browser countdown remain unchanged. `cached: true` means the response reused either an in-progress operation or a completed cached result.

This is **per-process** coalescing, not a distributed lock. Separate Vercel instances have independent caches. Database-backed admission still bounds requests across instances. The pending map contains only active server-controlled configurations and removes entries on completion; the completed cache keeps one configuration.

## Verification and continuation

- **32 tests passed** across wake behavior, public admission and backend dispatch.
- A controlled 20-request burst sent exactly **five** backend pings (the fixture has five instances), including a failed OCR response, and returned consistent counts to all callers. This is a test result, not a production traffic/cost measurement.
- Tests cover a slow wake's completion-based TTL, expiry permitting fresh pings, configuration changes and an obsolete slow operation finishing after a newer one.
- The production build passed, including lint/type validation. `git diff --check` passed. Review, CI and production release remain separate from local acceptance. No new dependency, database migration, blog/visual edit or original MDify app change is required.

After these bounded fixes, the broader optimization queue still includes measuring repeated document statistics/preview work, parser capacity, a shared processing deadline, controller detail pagination, attempt-fenced Storage identities and bounded observability/reconciliation. Preserve the conditional rollout requirements in the optimization plan accompanying PR #1; source tests alone do not authorize destructive cleanup or service retirement.
