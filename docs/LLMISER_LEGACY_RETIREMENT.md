# Legacy repository and frontend retirement

Updated 26 October 2026. The owner plans to delete MDify and MDify-Pro and explicitly chose **immediate redirects, with a LLMiser-only fallback banner**. This task prepares and verifies the replacement and handovers; it does not delete GitHub repositories, local checkouts, provider services or shared data.

## What changes and what stays

| Resource | Decision |
| --- | --- |
| Current product/source | `DevBehindYou/LLMiser`; canonical `https://llmiser.devbehindyou.com`; web root `frontend` |
| Old frontend converter | Replace its hosting source with LLMiser's `legacy-site` static package |
| Old public domains | Keep permanent path/query-preserving redirects directly to LLMiser |
| Fallback | Small LLMiser-only banner on nonlegacy deployment hosts/404, noindex, an Open LLMiser link; no converter/API/controller/analytics |
| MDify and MDify-Pro repositories/checkouts | Owner plans deletion; not deleted by this task |
| Old backend hosting | Separate source/consumer audit before retirement; do not infer safe deletion from frontend replacement |
| Shared data and scheduler | Preserve; compatibility names remain live LLMiser contracts |
| Blog articles and visuals | Preserve unchanged |

Deleting a GitHub repository, removing a local checkout and retiring a deployment are different operations. Do not delete a redirect-holding Vercel project or DNS record just because its former source repository is retired. The new fallback source lives in LLMiser precisely so it can survive old-repository deletion.

## Preservation performed

Private snapshots are in `project-docs/retirement-backups/2026-10-26-165137Z/` inside this LLMiser checkout. The directory is Git-excluded and must remain private; working snapshots may contain credentials.

| Local source | Recorded HEAD | Working snapshot | Verification |
| --- | --- | --- | --- |
| MDify | `ce56f5c28155b788ee668cf055d23cab2980367e` | 354 files, 2,291,830 source bytes | Git bundle verified; ZIP CRC and every included file's SHA-256 verified |
| MDify-Pro | `13fda7af7f3d0f74635ae46d19987809d012d3b3` | 622 files, 86,006,482 source bytes | Git bundle verified; ZIP CRC and every included file's SHA-256 verified |

Each repository has a `.bundle` for all locally available refs/history, a working-file ZIP, a private file/hash manifest and a shared explanatory README. MDify-Pro's pre-existing modified/untracked documentation and brand files are preserved without modifying its checkout.

Excluded from working ZIPs: `.git` (covered by the bundle), dependency/virtual-environment/build caches, compiled Python, logs and temporary files. No symlinks were encountered. Locally available refs are not a claim that every remote-only ref was fetched. GitHub issues, PR discussions, releases, Actions secrets, provider settings and external credentials are not exported by this backup. Inspect/export any such material the owner wants to retain before GitHub deletion. These copies are on the same machine, not an independent disaster-recovery backup.

LLMiser already contains the public app/backends/tests/database source and published blog assets. Its private `blog-pipeline/visuals/build.mjs`, shared visual kit, brand kit, research archive and `docs/mdify-history/` were confirmed present. Fresh public clones do not include these private folders; restore authoring materials from the owner's private copy if needed, never from a deleted sibling checkout. Do not publish the backup to make the public clone self-contained.

## Hosting cutover

Existing old frontend project: `devbehindyous-projects-369/mdify-app` (owner's first Vercel account). Current production app: `albedo-projects/llmiser` (second account). Verify actual ownership/settings in the dashboard; dated documentation is not live state.

For the **old frontend project only**, connect Git to `DevBehindYou/LLMiser`, production branch `main`, root `legacy-site`. The package's `vercel.json` selects Other/static, no install/build, and output `public`. Keep existing domains and domain-level redirects. Never change the working LLMiser project's root from `frontend`.

The two known old hosts get permanent redirects for public paths. Existing Vercel redirect settings may take precedence and should remain. Preview/other hosts receive only the static noindex banner. Legacy frontend API paths have no handler and return 404, never a cross-origin redirect or body forwarding. Before cutover, confirm no scheduler or supported client depends on the old frontend API. The live scheduler was moved to LLMiser in the earlier cron task; that does not prove every possible old client has migrated.

After deployment, verify old home, legal, usecase, blog index and article paths redirect directly with their query intact; confirm the canonical app and pools stay healthy; open the deployment URL to confirm only the banner remains; verify an old API endpoint does not expose a converter or redirect POST data. Record actual production revision and results in this guide/tracker. Configuration files and local previews alone are not production evidence.

## Things that must not be removed or globally renamed

`mdify-pro-files`, `mdify-jobs-tick`, keep-warm/cleanup jobs, Vault names, SQL tables/functions/migration filenames, `MDIFY_CRON_SECRET`, `x-mdify-cron-secret`, `x-mdify-admin` and admin-cookie names are compatibility contracts. They are used by the working LLMiser system. Branding removal is not a schema, bucket or protocol migration. Preserve licenses and attribution too.

Preserve old-domain DNS/TLS, Search Console verification and crawlable permanent redirects. Google recommends keeping redirects generally at least one year, preferably longer for users; use 21 October 2027 as the earliest planning boundary for redirects active since 21 October 2026, not an automatic deletion date. See [Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). Do not replace the redirects with a 200 banner, robots disallow or noindex-only response on the old public pages.

Repository deletion is an owner-controlled final operation after backups, provider source connections and required GitHub-only exports are checked. GitHub's limited restoration options are not a backup strategy. See [GitHub repository deletion documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository).

## State at preparation

Backups and standalone-source checks are complete. Static package and updated handovers are prepared on `codex/legacy-retirement`. Old hosting cutover, its live acceptance and repository deletion are not claimed complete here. Update this state only from observed results.
