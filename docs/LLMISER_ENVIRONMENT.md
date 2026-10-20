# LLMiser environment and deployment

Updated 20 October 2026. LLMiser gets its own deployments of the frontend **and** the six conversion backends, built from `DevBehindYou/LLMiser`. Data stays shared with MDify: the same Supabase project, bucket `mdify-pro-files`, Vault, cron jobs and cleanup function (their `mdify` names are compatibility contracts). The old MDify services keep running until LLMiser is verified. **No secret values are in this file or in Git.**

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

Vercel and Render deploy from GitHub, so the code must be on `DevBehindYou/LLMiser` `main` first. Before the first commit, run `git add -A --dry-run` and confirm that no `.env` file, `blog-pipeline/`, `docs/mdify-history/`, `.codex-recovery/` or `.claude/` path appears. Also decide whether `project-docs/` should be public. In Vercel's and Render's GitHub app settings, make sure both can see the LLMiser repository.

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

Import `frontend/.env.F`, then replace the three URL lists with the new backend URLs:

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

## Supabase: point the shared jobs at the LLMiser services

Vault (**Integrations → Vault**), edit two existing secrets:
- `mdify_keepwarm_url_o1` → the new `llmiser-ocr-o1` base URL (no path)
- `mdify_keepwarm_url_o2` → the new `llmiser-ocr-o2` base URL

The keep-warm job then pings the new OCR services. Nothing else in Vault changes.

**Tick target.** `mdify-jobs-tick` was created with `https://mdify-app.vercel.app/api/jobs/tick`. That host now answers **308** (redirect to `mdify.devbehindyou.com`), and the database's HTTP client (pg_net) is not expected to follow redirects. Check with `select status_code, created from net._http_response order by created desc limit 10;`. Once LLMiser is live, point the job at it. Running `cron.schedule` with an existing name updates that job in place:

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

Keep the old frontend and the six old backends until LLMiser has passed end-to-end conversions: a document, a scanned PDF, an image, a ZIP, the admin view and cleanup. Then:
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

Load-test data in `tests/load/.corpus` and `tests/load/results` is ignored by `.gitignore`.
