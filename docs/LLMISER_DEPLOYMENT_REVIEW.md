# Deployment review — 21 October 2026

> Later verification, same day at 19:33 Asia/Calcutta: the owner completed domain configuration. DNS/TLS, all 13 canonical pages and tested legacy redirects now work. Earlier DNS-blocker observations below are historical. Read [LLMISER_DOMAIN_VERIFICATION.md](LLMISER_DOMAIN_VERIFICATION.md) for the superseding evidence; keep-warm/cron and full conversion acceptance remain separate.


This review reconciles the owner's supplied deployment report with the current checkout and read-only public checks. It did not run the pasted SQL, change Vault/DNS/cron, wake backend pools, upload files, retire services, commit or push.

## Current state and evidence

| Area | Status | Evidence / confidence |
| --- | --- | --- |
| App and blog rebrand | Complete in the checkout | Eight articles and 48 SVGs; generated index current; 24 focused blog/SEO/migration tests pass in this review |
| Repository publication | App/content commits now exist | Local HEAD `3ed4ded` after `e999388 Publish & Re-branding`; public app is accessible. Remote branch equality was not checked |
| Frontend | Live at `https://llmiser.vercel.app` | Direct HTTPS GET returned 200 with the LLMiser title and HSTS |
| Public files | Sample independently checked | Homepage, one article, sitemap, robots, manifest and `/api/health` all returned 200 |
| Canonical origin | Set to `https://llmiser.devbehindyou.com` | Live homepage/article canonicals and all 13 sitemap URLs use this origin |
| Custom domain | **Blocked: DNS unresolved from this machine** | `dns.lookup` returned `ENOTFOUND` on 21 October; this does not establish whether the alias has already been added in Vercel |
| Frontend health | Configured for storage + two normal/two OCR instances | Live `/api/health` returned `status: ok`, `storage: true`; API noindex header present |
| All six backend readiness / secret checks | Reported passed by the prior deployment agent | Not repeated here; health is configuration reporting, not a probe of backend readiness, secrets or storage operations |
| HTML / PNG / ZIP storage conversions | Reported passed on the Vercel origin | Prior agent: 4.1 s N1, 5.3 s O1, 3.2 s Z2; not rerun and no new jobs created here |
| Six configured backend hosts | Local config agrees with report | Only three URL-list hostnames and variable names were inspected; no credential values were printed or changed |
| Keep-warm Vault targets | Reported still old; not queried here | Separate assigned-agent task; live Vault state must be checked before mutation |
| Tick cron target | Pending inspection/cutover | Checked-in template uses the final domain, but this does not prove the stored `cron.job` command was updated |
| Legacy public redirects / old service retirement | Not established as complete | Must follow successful custom-domain validation and dependency checks |

The prior blog agent reports a full 221-case suite, lint, build and 88 local HTTP checks. This review reran only the relevant 24 cases and index consistency; it did not re-audit external pricing/model facts or individually inspect all 48 SVGs. The blog report itself notes its visual checks were representative, not every SVG in both themes.

## Analysis of the supplied report

1. **The deployment sequence is substantially sound.** A separate frontend and six new backends use the shared database/bucket. Existing service identity, secret/header names, queue and cleanup contracts stay compatible. The app is beyond the earlier “local only, untracked” stage.
2. **DNS is now the main public-launch/SEO blocker.** The live Vercel site is accessible, but its canonical and sitemap targets currently do not resolve from this machine. Complete the intended domain and HTTPS setup before expecting the canonical URLs to work or activating old-host redirects. Keep the selected permanent domain consistent rather than casually switching the app's metadata to a temporary hostname.
3. **`/api/health` does not verify all six services.** Its implementation reports frontend configuration and only normal/OCR counts. Archive readiness is intentionally absent there. The supplied `/api/wake` and conversion tests are stronger evidence, but belong to the prior agent's run. Matching local env lists supports routing configuration; they do not prove the deployed project's current env values or backend logs by themselves.
4. **The “LLMiser Archive” label supports the Z routing test.** It distinguishes the tested output from the described old workers. N/O labels alone cannot distinguish old/new endpoints. Do not turn that limitation into a claim that N/O routing was independently proven in this review.
5. **The keep-warm SQL changes shared configuration, not deployments.** Updating the existing two Vault values redirects future pings without changing the interval, creating new services or stopping old ones. Old OCR services may still wake for real MDify requests. Removing their scheduled warmups may increase cold-start latency for the old app during transition.
6. **Thirty seconds is a suggested first check, not proof of failure.** The checked-in `keepwarm_ping()` is asynchronous and permits a 90-second cold-start request timeout. `keepwarm_record()` only records completed outcomes. Inspect request freshness and completion; do not mistake null/in-flight or older 200 rows for the new run's result.
7. **Only changing O1/O2 is sufficient if those are the only active matching Vault entries.** The function enumerates every `mdify_keepwarm_url_*` secret, not a hardcoded pair. Another matching secret could keep an old OCR service warm. Inspect names/targets first; do not automatically delete unexpected entries.
8. **The checked-in warmup schedule is not continuous uptime.** `supabase/cron.sql` specifies every 30 minutes from 12:00 through 23:30 UTC (17:30 through 05:00 the following day in Asia/Calcutta). Inspect the live schedule to confirm it matches. Do not promise 24/7 warm services or exact free-hour savings from a URL-only change.
9. **Cron is a shared-queue cutover.** Keep one existing `mdify-jobs-tick` schedule, authenticated by the existing header/Vault secret. Inspect the stored target and its correlated request result. A generic page redirect, or arbitrary recent rows in `net._http_response`, does not establish whether the tick POST works. Do not run `supabase/cron.sql` wholesale simply to change one target.
10. **“Keep them until LLMiser is retired” is a wording error.** The intended gate is to keep the old services until the LLMiser migration is verified and old frontend/API/scheduler dependencies are migrated. Do not retire them in the keep-warm task.

## Bounded next-agent task: keep-warm only

The owner has left this task for another agent. This review does not execute it. Use the existing SQL in [LLMISER_ENVIRONMENT.md](LLMISER_ENVIRONMENT.md), with the following scope and verification:

- Confirm the intended shared Supabase project is `ppmbqgecdbrezxedyeur`.
- Inspect the names of matching keep-warm Vault entries. Confirm one O1 and one O2 entry exist and inspect only their URL values; never export credential entries.
- Targets: O1 `https://llmiser-ocr-o1o.onrender.com`; O2 `https://llmiser-ocr-o2o.onrender.com`. Preserve their existing Vault names and record the old URL values for rollback.
- Update those two values atomically after the checks. Leave schedules, interval, shared secrets, schema, bucket, cleanup and tick target unchanged.
- Note the run start time. Queue `public.keepwarm_ping()`. After the asynchronous requests have had time to finish, call `public.keepwarm_record()`.
- Select the newest result **per instance**, rather than assuming the last four rows contain a fresh result for each worker:

```sql
select distinct on (instance)
  instance, requested_at, request_id, recorded_at, status_code, error
from public.keepwarm_pings
where instance in ('O1', 'O2')
order by instance, requested_at desc, id desc;
```

- Require a post-change timestamp for both instances, a non-null `recorded_at`, HTTP 200 and no error. If still in flight, wait for completion and record again rather than declaring failure after exactly 30 seconds. Check the actual stored URL values too: the result table does not store the destination URL.
- Provide a screenshot of these result rows, without credential values or signed file URLs, and record the outcome in the handover docs. Report any additional matching Vault entries without deleting them.
- Do not alter DNS, tick cron, old-host redirects, service retirement or the app/content during this task.

## Remaining launch sequence

1. Complete the keep-warm assignment independently; keep its status separate from DNS.
2. Confirm whether Vercel already has the custom alias. Add/fix the provider-specified DNS record; verify resolution, certificate, pages, files and all 13 canonical URLs on the custom domain.
3. Repeat document, scanned PDF, image, ZIP, export, authenticated admin and cleanup checks on that domain. The three prior tests did not establish scanned-PDF, admin or eventual-cleanup success.
4. Inspect and update the existing tick schedule to the direct custom-domain `/api/jobs/tick` endpoint after it works. Verify a real authenticated POST result through the scheduler, without creating duplicate schedules.
5. Activate and verify old public-host redirects while preserving required API compatibility. Audit remaining old frontend/backend consumers before pausing or retiring anything.
6. Submit/inspect the canonical sitemap in verified search properties and monitor errors, indexing and conversions.

If inspection shows tick is already failing before DNS is ready, treat it as a separate reliability issue: an agent may propose a tested direct endpoint on the working Vercel origin as an interim target. This review has not inspected live cron state or authorized/executed that change.
