# LLMiser environment and deployment

Updated 23 October 2026. LLMiser gets its own deployments of the frontend **and** the six conversion backends, built from `DevBehindYou/LLMiser`. Data stays shared with MDify: the same Supabase project, bucket `mdify-pro-files`, Vault, cron jobs and cleanup function (their `mdify` names are compatibility contracts). The old MDify services keep running until LLMiser is verified. **No secret values are in this file or in Git.**

**Current cron/wake status:** OCR Vault URLs now point to both LLMiser Render services. The existing minute tick uses a demand-driven database dispatcher targeting the canonical LLMiser frontend; the existing recorder runs every five minutes. The four-job count, cleanup job and OCR budget window are preserved. See [implementation, evidence and rollback](LLMISER_CRON_WAKE.md). This supersedes the earlier pending/cutover instructions below; do not replace the dispatcher with the historical unconditional HTTP block.

## Current review (21 October 2026)

The public frontend and selected discovery/health responses were independently checked on 21 October. Earlier DNS checks returned ENOTFOUND; after the owner's changes, the custom domain and public redirects were verified at 19:33 Asia/Calcutta. See [live domain verification](LLMISER_DOMAIN_VERIFICATION.md). Six-backend authenticated/readiness checks and HTML/PNG/ZIP storage conversion results in the table below are the prior deployment agent's reported evidence, not repeated tests in this review. Local backend URL hostnames match that report; secret values were not printed or changed. `/api/health` reports configured normal/OCR counts, not backend readiness or archive health.

Provisioning instructions below are retained as reference; do not recreate the already-deployed services. Keep-warm remains assigned to another agent; Vault, cron and DNS were not changed in this review. See [deployment review](LLMISER_DEPLOYMENT_REVIEW.md) for the bounded task, evidence distinctions and launch sequence.

## Deployment status reported on 20 October 2026

| Service | URL | Verified |
| --- | --- | --- |
| Frontend | `https://llmiser.vercel.app` | Pages, `/api/health`, `/api/wake` (2 of 2 ready in each pool), Storage flow end to end: HTML via N1, PNG via O1, ZIP via Z2 |
| N1, N2 | `https://llmiser-api-n1n.vercel.app`, `https://llmiser-api-n2n.vercel.app` | Ready, 401 without the secret, frontend secret accepted, HTML and CSV converted |
| O1, O2 | `https://llmiser-ocr-o1o.onrender.com`, `https://llmiser-ocr-o2o.onrender.com` | Ready (Tesseract 5.5.0, `eng`, `osd`), 401 without the secret, frontend secret accepted, image text read exactly |
| Z1, Z2 | `https://llmiser-api-z1z.vercel.app`, `https://llmiser-api-z2z.vercel.app` | Ready, 401 without the secret, frontend secret accepted, ZIP converted |

`frontend/.env.F` holds these three URL lists. Still open:
- Vault keep-warm URL cutover is complete; see the current cron/wake record above.
- Custom-domain DNS/TLS and tested public redirects now work. All 13 sitemap pages returned 200 with matching canonicals; see the live verification record. Full custom-domain conversion acceptance remains separate.
- `mdify-jobs-tick` now dispatches to the LLMiser domain only for active work; inspect the current dispatcher before editing it.
- Retire the old services after the end-to-end checks on the custom domain.

## Local env files (never committed)

`.gitignore` ignores `.env` and every `.env.*` except `.env.example`:

| File | Holds |
| --- | --- |
| `frontend/.env.F` | Full production frontend set (ten variables). Next.js doesn't read this name, so local `npm run dev` stays on the safe local fallback. Rename to `.env.local` only to point a local frontend at production. |
| `backendN/.env.N1`, `.env.N2` | Six variables each: role, instance, shared secret, Supabase URL, key and bucket |
| `backendO/.env.O1`, `.env.O2` | Same six, plus `OCR_TIMEOUT_S` |
| `backendZ/.env.Z1`, `.env.Z2` | Same six as N |

Checked on 20 October 2026, values compared but not printed:
- `BACKEND_SHARED_SECRET` (frontend) equals `INTERNAL_SHARED_SECRET` in all six backend files. It's 64 characters.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are the same everywhere.
- `ADMIN_KEY_1`, `ADMIN_KEY_2` and `CRON_SECRET` are each 64 characters.

Each backend file can be imported as-is into its new service (Vercel "Import .env", Render "Add from .env"). To give LLMiser its own shared secret instead, generate one with `openssl rand -hex 32`, and put the same value in all six backend services and the frontend's `BACKEND_SHARED_SECRET`.

## Step 0: push LLMiser

Vercel and Render deploy from GitHub, so the code must be on `DevBehindYou/LLMiser` `main` first. Done on 20 October 2026. Before every commit, run `git add -A --dry-run` and confirm that no `.env` file, `project-docs/`, `blog-pipeline/`, `docs/mdify-history/`, `.codex-recovery/` or `.claude/` path appears. In Vercel's and Render's GitHub app settings, make sure both can see the LLMiser repository.

## Backends: six new services

The backends read only:
- `BACKEND_ROLE` and `BACKEND_INSTANCE`
- `INTERNAL_SHARED_SECRET`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_STORAGE_BUCKET`
- `APP_VERSION`, `MAX_UPLOAD_BYTES`, plus OCR and PDF tuning such as `OCR_TIMEOUT_S`

They have no CORS or frontend-URL setting.

### N1, N2, Z1, Z2 on Vercel (one project each)

| Project name | Root Directory | Env file to import |
| --- | --- | --- |
| `llmiser-api-n1` | `backendN` | `backendN/.env.N1` |
| `llmiser-api-n2` | `backendN` | `backendN/.env.N2` |
| `llmiser-api-z1` | `backendZ` | `backendZ/.env.Z1` |
| `llmiser-api-z2` | `backendZ` | `backendZ/.env.Z2` |

For each project:
1. **Add New → Project →** import `DevBehindYou/LLMiser`.
2. Set the project name, then **Root Directory** (Edit → choose the folder).
3. **Framework Preset:** FastAPI, or Other, which Vercel detects from `app/main.py`.
4. **Environment Variables → Import .env:** paste the file's contents.
5. **Deploy.** `vercel.json` in the folder sets the Tokyo region (`hnd1`) and the 300 s limit.
6. **After the first deploy:** Settings → Build and Deployment → Ignored Build Step → Custom. Paste the command from `docs/worker-ignore-command.sh` so commits that don't touch the folder don't rebuild it.
7. Note the production URL (Settings → Domains). It's `https://<project-name>.vercel.app` if the name is free, otherwise Vercel adds a suffix. Use that production URL, not a deployment-specific one: the deployment-specific URLs are protected.

### O1, O2 on Render (Free, Docker)

| Service name | Env file to add |
| --- | --- |
| `llmiser-ocr-o1` | `backendO/.env.O1` |
| `llmiser-ocr-o2` | `backendO/.env.O2` |

For each service:
1. **New → Web Service →** `DevBehindYou/LLMiser`, branch `main`.
2. **Name:** as above. **Region:** Singapore. You can't change the region later.
3. **Root Directory:** `backendO`. **Language:** Docker. **Dockerfile Path:** `./Dockerfile`.
4. **Instance Type: Free.** The form may preselect a paid type.
5. **Environment Variables → Add from .env:** paste the file's contents.
6. **Advanced → Health Check Path:** `/api/v1/ready`.
7. **Create Web Service.** The first Docker build takes several minutes.

`render.yaml` describes `llmiser-ocr-o1` (O2 commented out) if you prefer a Blueprint. Creating the services by hand, as above, is simpler.

### Verify every backend

For each URL, `GET <url>/api/v1/ready` should report `"ready": true`, `"secret_configured": true` and `"storage_configured": true`. Render services may take a minute to wake. A request to an internal endpoint without the secret must return 401.

## Frontend: the new LLMiser hosting project

Create the project from `DevBehindYou/LLMiser`:
- **Root Directory:** `frontend`
- **Framework:** Next.js, pinned by `frontend/vercel.json`
- **Node:** 22

Import `frontend/.env.F`. Since 20 October 2026 its three URL lists point to the new backends:

| Variable | Value |
| --- | --- |
| `NORMAL_BACKEND_URLS` | `https://<llmiser-api-n1 URL>,https://<llmiser-api-n2 URL>` |
| `OCR_BACKEND_URLS` | `https://<llmiser-ocr-o1 URL>,https://<llmiser-ocr-o2 URL>` |
| `ARCHIVE_BACKEND_URLS` | `https://<llmiser-api-z1 URL>,https://<llmiser-api-z2 URL>` |
| `BACKEND_SHARED_SECRET` | must equal `INTERNAL_SHARED_SECRET` on all six new backends |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | same Supabase project |
| `SUPABASE_STORAGE_BUCKET` | `mdify-pro-files` |
| `CRON_SECRET` | must equal Vault `mdify_cron_secret` |
| `ADMIN_KEY_1`, `ADMIN_KEY_2` | current values, or a new pair for LLMiser |

Deploy, then attach `llmiser.devbehindyou.com` and add the DNS record Vercel shows. Check `/api/wake`: it should list 2 of 2 ready in each pool. Changing env vars later needs a redeploy. After the new URLs are known, update `frontend/.env.F` locally too.

## Supabase: historical initial cutover instructions

**Superseded by the 23 October optimization.** For an existing production project, use the bounded migration and cutover steps in [LLMISER_CRON_WAKE.md](LLMISER_CRON_WAKE.md). The SQL below explains the initial migration and is not the current desired scheduler definition.

Vault: change the two keep-warm URLs to the new OCR base URLs (no path). Run in the SQL Editor:

```sql
select vault.update_secret(
  (select id from vault.secrets where name = 'mdify_keepwarm_url_o1'),
  'https://llmiser-ocr-o1o.onrender.com'
);
select vault.update_secret(
  (select id from vault.secrets where name = 'mdify_keepwarm_url_o2'),
  'https://llmiser-ocr-o2o.onrender.com'
);
select public.keepwarm_ping();
```

Thirty seconds is a first check, not a deadline: pings are asynchronous and the checked-in function permits a 90-second cold-start timeout. Record completed outcomes, and inspect the newest post-change row for each of O1 and O2, including `request_id` and `recorded_at`. Both need HTTP 200, no error, and a fresh completed timestamp. See the per-instance query in [deployment review](LLMISER_DEPLOYMENT_REVIEW.md). First inspect all matching Vault entries: every `mdify_keepwarm_url_*` entry is pinged, so an extra old entry could keep an old service warm. Update only the assigned URL values; do not delete unexpected entries or alter the schedule.

**Tick target — inspect live state first.** The original template used `https://mdify-app.vercel.app/api/jobs/tick`; this review did not query the stored live command or verify the earlier assertion about a 308 response. Inspect the single `mdify-jobs-tick` entry and its own correlated HTTP response. Arbitrary recent `net._http_response` rows or a generic page redirect do not prove that this authenticated POST is working. Once the custom domain resolves and passes validation, update the existing named job in place. Keep one target for the shared queue, the existing Vault secret and header, and do not rerun the entire schema/cron setup just to change this URL.

```sql
select cron.schedule(
  'mdify-jobs-tick',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://llmiser.devbehindyou.com/api/jobs/tick',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-mdify-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'mdify_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  );
  $$
);
```

Until LLMiser is live, use `https://mdify.devbehindyou.com/api/jobs/tick` in the same statement. Keep one tick target only: both frontends share the same queue.

The cleanup function, its `MDIFY_CRON_SECRET`, the schema and the bucket stay as they are.

## Retiring the old MDify services

Keep the old frontend and the six old backends until LLMiser has passed these checks on the custom domain: a document, a scanned PDF, an image, a ZIP, export, authenticated admin and actual cleanup. Audit old frontend/API/scheduler consumers and preserve any required compatibility before retirement. Moving warmup URLs alone is not permission to retire services. Then:
1. Redirect the old hosts (`docs/LLMISER_MIGRATION.md`).
2. Delete or pause the old backends: `mdify-api-n1n`, `-n2n`, `-z1z`, `-z2z` on Vercel and `mdify-ocr-o1o`, `-o2o` on Render.

All Render free services in one workspace share 750 instance hours a month, so don't keep four OCR services awake.

## Local development

| Part | Status | Setup |
| --- | --- | --- |
| Frontend | Ready (`frontend/node_modules` present, build passes) | `npm run dev --prefix frontend` |
| Backends | Python environments not created | `python -m venv backendN/.venv`, then `backendN/.venv/Scripts/python -m pip install -r backendN/requirements-dev.txt`. Repeat for `backendO`. `backendZ` uses `backendN/.venv`. Tesseract with `eng` and `osd` is installed at `C:/Program Files/Tesseract-OCR`. |
| Launch configs | `.claude/launch.json` (local, Git-excluded) | frontend, frontend-prod and the six backend instances |

## Private material in this checkout (Git-excluded)

Kept out of the public repo through `.git/info/exclude`:

| Folder | Contents |
| --- | --- |
| `blog-pipeline/` | Blog generator, rules, specs and sources |
| `docs/mdify-history/` | MDify-era AI handover, analysis, planning docs, the old `sync-public.ps1` and the original raster icon |
| `.codex-recovery/` | Recovered earlier agent transcripts |
| `.claude/` | Local launch configs |
| `project-docs/` | Prompt L brand kit (SVG, PNG, favicon, manifest, preview), `brand/make-icons.mjs` and the rebranding research archive. The icon test compares the public icons with this kit only when the folder exists. |

Load-test data in `tests/load/.corpus` and `tests/load/results` is ignored by `.gitignore`.
