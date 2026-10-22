# Supabase cron and OCR wake maintenance

Updated 23 October 2026 (Asia/Calcutta). Project `ppmbqgecdbrezxedyeur`, shared with MDify. Internal `mdify` job/Vault/header names remain compatibility contracts. Work belongs in LLMiser only.

## Findings and target correction

The live audit found four enabled jobs. OCR Vault URLs still pointed to `mdify-ocr-o1o.onrender.com` and `mdify-ocr-o2o.onrender.com`; the minute tick posted to `mdify-app.vercel.app/api/jobs/tick`. There were 1,440 successful tick SQL runs in 24 hours but no active jobs (40 completed). SQL success only proved a request was queued, not its HTTP outcome.

The existing OCR URL values were updated to `https://llmiser-ocr-o1o.onrender.com` and `https://llmiser-ocr-o2o.onrender.com`. The existing tick target was corrected to `https://llmiser.devbehindyou.com/api/jobs/tick`. Correlated verification: tick request **37003** returned **200**, `stale: 0`, `claimed: 0`; OCR requests **37001 / 37002** returned **200**, without timeouts. No secrets were printed. These checks ran on 23 October local time (22 October UTC).

## Optimization design

- `dispatch_jobs_tick()` runs admission pruning and stale-job maintenance in the database every minute. It only posts to Vercel when a QUEUED, PROCESSING or CANCEL_REQUESTED job exists. A new arrival after a check waits at most the next cron minute; browser-driven conversion remains unchanged.
- A transaction advisory lock serializes scheduling. Pending HTTP requests suppress another tick for 330 seconds (300-second request limit plus grace). A lost response cannot suppress work forever. Existing worker claim/lease guards still apply.
- `scheduled_http_requests` records request IDs, timestamps, status and sanitized outcome only. It does not store request headers, secrets, content, job filenames or response bodies. Successes expire after one day and failures after 14 days. The table has RLS and no grants to public, anon, authenticated or service_role. Scheduler helpers run as invoker, accessible only to their owner.
- The existing outcome-recorder job runs every five minutes, including outside the OCR window, so manual/final pings are captured before pg_net's default six-hour response expiry.
- `keepwarm_ping()` serializes calls, skips another ping to the same instance within two minutes, rejects malformed base URLs and chooses the short timeout only after confirmed success. Otherwise it allows 90 seconds for cold start. One failed target does not block another.

## Schedules and budget

| Existing job | Schedule (UTC) | Behavior |
| --- | --- | --- |
| `mdify-jobs-tick` | `* * * * *` | Database maintenance; demand-driven authenticated HTTP |
| `mdify-cleanup-expired-jobs` | `*/30 * * * *` | Existing cleanup function and retention, unchanged |
| `mdify-keepwarm-ocr` | `*/30 12-23 * * *` | Existing budget window, unchanged |
| `mdify-keepwarm-record` | `*/5 * * * *` | Record OCR and tick HTTP outcomes |

The OCR schedule is periodic prewarming, not continuous readiness: free Render services sleep after 15 idle minutes. Changing both instances to all-day ten-minute pings would consume about 1,488 instance-hours in a 31-day month before other services, exceeding a single workspace's 750 free hours. This update removes scheduled warming of old OCR targets without increasing the warm window. Real traffic and other services still consume hours. A different uptime window or paid instance needs a separate budget decision.

## Apply, verify and roll back

1. Inspect existing jobs, Vault URL names, extension versions and recent HTTP results without selecting secret/header values. Do not rerun the full setup on this shared production project.
2. Apply only `supabase/migrations/20261023000000_mdify_cron_efficiency.sql`. It adds helpers but does not change schedules or Vault.
3. Run `supabase/llmiser-cron-cutover.sql` to alter the two existing job definitions and existing OCR URL values in place. It fails if expected entries are missing or duplicated. There must still be exactly four jobs.
4. Check `cron.job_run_details` AND correlated rows in `scheduled_http_requests` / `keepwarm_pings`. When idle, a successful cron run with no new HTTP request is expected. Do not create production conversion jobs just to force an active scheduler check.

For rollback, alter the same tick job back to the authenticated `net.http_post` block targeting the canonical LLMiser URL (the previous implementation in Git). Keep the corrected OCR URLs. Leave the five-minute recorder in place, or restore its original schedule if necessary. Do not drop tables/functions or change cleanup to roll back scheduling. Existing conversions and the previous frontend API remain compatible.

## Verification record

The local PostgreSQL queue/admission/atomic/cleanup/scheduler regression selection passed **61 tests, zero failures**. After adding the exact production cutover acceptance case, all **five focused scheduler tests** passed, including repeat execution, duplicate-job guard and preservation of cleanup/OCR schedules. The generated full setup also applies twice without losing data; `sql:check` and `git diff --check` passed. No application code changed, so an app build/redeploy was not needed for this SQL-only change.

The additive migration and bounded cutover were applied successfully through the owner's authenticated SQL Editor. Live verification at 02:01 Asia/Calcutta on 23 October showed exactly the original four enabled job IDs, corrected Vault URLs and `idle_dispatch_request: null` with zero automatically tracked tick requests. The tick cron succeeded after cutover. Actual HTTP outcome recording and the next five-minute cron run are checked separately below before final handover.

Official references: [Supabase Cron](https://supabase.com/docs/guides/cron), [pg_net asynchronous requests and response retention](https://supabase.com/docs/guides/database/extensions/pg_net), [Render Free service sleep and hours](https://render.com/docs/free).
