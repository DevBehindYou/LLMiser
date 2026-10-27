# Legacy repository and frontend retirement

Updated 27 October 2026. The owner plans to delete MDify and MDify-Pro and explicitly chose **immediate redirects, with a LLMiser-only fallback banner**. The replacement and handovers are deployed and verified. This task does not delete GitHub repositories, local checkouts, provider services or shared data.

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

Excluded from working ZIPs: `.git` (covered by the bundle), dependency/virtual-environment/build caches, compiled Python, logs and temporary files. No symlinks were encountered. These copies are on the same machine, not an independent disaster-recovery backup.

Additional remote mirrors and verified `*-remote.bundle` files preserve the fetched GitHub refs, including pull-request heads: MDify 38 refs/19 pull heads; MDify-Pro 3 refs/1 pull head. Private `github-records/` JSON exports preserve repository metadata, issues/PRs, issue comments, review comments, formal reviews and release listings as returned at export time. MDify has 18 issue/PR records, 18 PR records and 35 issue comments; MDify-Pro has 1 issue/PR record and 1 PR record. Both returned zero formal reviews, review comments and releases. Git refs and API record counts describe different inventories; do not assume they must match.

Actions artifacts/logs/secrets, provider settings, external credentials and linked comment attachments were not exported. Export any additional GitHub-only material the owner needs before deletion. The private manifests and summary JSON files describe the exact scope; none is staged or published.

LLMiser already contains the public app/backends/tests/database source and published blog assets. Its private `blog-pipeline/visuals/build.mjs`, shared visual kit, brand kit, research archive and `docs/mdify-history/` were confirmed present. Fresh public clones do not include these private folders; restore authoring materials from the owner's private copy if needed, never from a deleted sibling checkout. Do not publish the backup to make the public clone self-contained.

The active local tooling audit found zero remaining absolute references to either old checkout after correcting LLMiser's private brand helper to use its local directory. Do not run `project-docs/brand/make-icons.mjs` wholesale: it also targets an unrelated Atomic File Manager project. Approved LLMiser assets were preserved without regenerating them.

## Hosting cutover

Existing old frontend project: `devbehindyous-projects-369/mdify-app` (owner's first Vercel account). Current production app: `albedo-projects/llmiser` (second account). Verify actual ownership/settings in the dashboard; dated documentation is not live state.

For the **old frontend project only**, connect Git to `DevBehindYou/LLMiser`, production branch `main`, root `legacy-site`. The package's `vercel.json` selects Other/static, no install/build, and output `public`. Keep existing domains and domain-level redirects. Never change the working LLMiser project's root from `frontend`.

The two known old hosts keep permanent redirects for migrated public paths. Existing Vercel redirect settings may take precedence and should remain. The static package has no API handler and its own routing excludes API paths. Actual public routing is different: the `mdify-app.vercel.app` domain-level redirect also covers API paths; `mdify.devbehindyou.com` is attached to the working LLMiser project and its API remains available there with noindex. This replacement removes the old project's converter, not the canonical app's compatibility API behavior. Do not send sensitive POST bodies to a legacy alias to test redirects. The live scheduler was moved to LLMiser in the earlier cron task; that does not prove every possible old client has migrated.

After deployment, verify old home, legal, usecase, blog index and article paths redirect directly with their query intact; confirm the canonical app and pools stay healthy; open the deployment URL to confirm only the banner remains; verify an old API endpoint does not expose a converter or redirect POST data. Record actual production revision and results in this guide/tracker. Configuration files and local previews alone are not production evidence.

## Things that must not be removed or globally renamed

`mdify-pro-files`, `mdify-jobs-tick`, keep-warm/cleanup jobs, Vault names, SQL tables/functions/migration filenames, `MDIFY_CRON_SECRET`, `x-mdify-cron-secret`, `x-mdify-admin` and admin-cookie names are compatibility contracts. They are used by the working LLMiser system. Branding removal is not a schema, bucket or protocol migration. Preserve licenses and attribution too.

Preserve old-domain DNS/TLS, Search Console verification and crawlable permanent redirects. Google recommends keeping redirects generally at least one year, preferably longer for users; use 21 October 2027 as the earliest planning boundary for redirects active since 21 October 2026, not an automatic deletion date. See [Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). Do not replace the redirects with a 200 banner, robots disallow or noindex-only response on the old public pages.

Repository deletion is an owner-controlled final operation after backups, provider source connections and required GitHub-only exports are checked. GitHub's limited restoration options are not a backup strategy. See [GitHub repository deletion documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository).

## Verified deployment and acceptance

PR #7 merged; replacement source revision `c056e180525c4a0fc3c8a4702fe678fd2601a4d4`. The old Vercel project now connects to `DevBehindYou/LLMiser`, branch `main`, root `legacy-site`. Deployment `FraWhBMCH5f3B3VK8QBJrf5JQ4ff` became Ready in 3 seconds on 26 October at 22:53 IST. The main app stays root `frontend`; all six Vercel status contexts for this revision succeeded. PR #7 passed all seven CI jobs, including 255 frontend tests.

On 27 October, the deployment-specific URL showed only the LLMiser banner, expected canonical destination, `noindex,follow`, zero scripts and zero forms. Desktop and 390px local previews were also inspected. Unauthenticated deployment-URL requests retain Vercel's 302 SSO protection with noindex; this protection was not weakened. The public domains immediately redirect, so users do not see an intermediate banner.

The focused public HTTP audit passed 20 checks: migrated home/usecase/privacy/terms/blog/article paths with queries on both old hosts, plus canonical pages/discovery files/health. All normal/OCR/archive pools were 2/2 ready. An unknown old custom-domain path returns 404; the Vercel alias redirects the same unknown path to the equivalent canonical URL. API behavior is recorded above. The private raw results and live screenshot are in `project-docs/retirement-evidence/`. Repository deletion and old backend retirement remain unperformed and require their own checks.
