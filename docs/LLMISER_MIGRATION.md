# LLMiser deployment and retirement runbook

Updated 26 October 2026. The migration is deployed. This runbook supersedes the initial provisioning/cutover checklist; dated evidence remains in the other migration reports.

## Current deployment

- Canonical app: `https://llmiser.devbehindyou.com`; Vercel project `albedo-projects/llmiser`, repository `DevBehindYou/LLMiser`, branch `main`, root `frontend`, Next.js, Node 22.
- Normal services: `llmiser-api-n1n.vercel.app`, `llmiser-api-n2n.vercel.app`.
- OCR services: `llmiser-ocr-o1o.onrender.com`, `llmiser-ocr-o2o.onrender.com`.
- Archive services: `llmiser-api-z1z.vercel.app`, `llmiser-api-z2z.vercel.app`.
- Shared storage/database/Vault/cron remain in use; their `mdify` identifiers are compatibility contracts. Credentials stay in hosting settings or private ignored local files.
- Existing minute tick uses the canonical LLMiser target through the demand-driven dispatcher. OCR targets and the five-minute recorder were corrected in the earlier cron task. Do not rerun initial setup or historical unconditional HTTP cron SQL.

The 26 October release merged PRs #1–#6 and deployed `aa0635433bf520bfddc6edb796c14a74430e64f8`. Final PR CI passed 252 frontend tests and all other jobs. See [release evidence](LLMISER_RELEASE_2026-10-26.md), [environment inventory](LLMISER_ENVIRONMENT.md) and [cron/wake](LLMISER_CRON_WAKE.md).

## Normal releases

Work in this repository, preserve the compatibility contracts and run relevant frontend/backend/extension tests. Frontend checks include lint, dictionaries, generated SQL consistency, blog index and production build. Review the PR, wait for CI, then merge/deploy under the owner's standing authorization. Verify the actual production deployment; a merge is not proof that hosting has finished.

Use `GET /api/health` for frontend configuration and `POST /api/wake` for pool readiness. API responses must remain noindex and admin queries require authentication. Verify the relevant app route, language behavior and unchanged document/export behavior for the change. Do not load production keys or create real jobs for a documentation-only check.

## Old frontend replacement

The owner chose to keep immediate public redirects and show only a LLMiser banner as fallback. Use the standalone [legacy-site package](../legacy-site/README.md) in this repository for the old frontend hosting root. It contains no old app or API. The working app root stays `frontend`.

The [retirement guide](LLMISER_LEGACY_RETIREMENT.md) records verified private source snapshots, old-project ownership, hosting settings, API-consumer checks and deletion boundaries. Deleting old GitHub repositories must not remove their redirect-holding hosting, shared data or the private authoring pipeline. The task prepares retirement, not a fresh infrastructure setup.

## Redirect and search policy

Preserve direct permanent redirects from `mdify.devbehindyou.com`, `mdify-app.vercel.app` and the LLMiser Vercel alias to the equivalent canonical public path. Keep query strings, article slugs and intentional 404 behavior. Do not send every article to the homepage. Fallback banners are noindex and must not replace the public migration redirects.

Google accepted the Change of Address and the 13-page sitemap on 21 October. Continue monitoring; acceptance does not prove all old results have disappeared. Maintain old-domain DNS/TLS and Search Console verification. Read [search migration policy](LLMISER_SEARCH_MIGRATION.md) before touching robots, redirects, sitemaps or removals. Local storage is origin-specific and does not migrate automatically between domains.

## Remaining acceptance and retirement

Native extension acceptance/store publication, native-language review, a broader custom-domain upload/scanned-PDF/admin/cleanup acceptance run and old-service consumer audits remain separate. Existing generated-file conversion checks are dated evidence, not a new full acceptance run. Do not retire old backend services merely because the frontend banner works.

Reference: [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [Vercel static project configuration](https://vercel.com/docs/project-configuration/vercel-json).
