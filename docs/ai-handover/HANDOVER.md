# LLMiser AI handover

Updated 27 October 2026. Start with [START_HERE](../START_HERE.md). This replaces the earlier deployment-phase handover; historical evidence remains in the linked reports and Git history.

## What the owner wants now

LLMiser must remain independently maintainable after MDify and MDify-Pro are deleted. Update the documentation, preserve necessary private materials and replace the old frontend converter with a minimal LLMiser-only fallback. The owner explicitly chose **immediate permanent redirects on the old public hosts**, with the banner only as fallback. Repository deletion itself is not being executed in this task.

## Work already shipped

- Full LLMiser rebrand, Prompt L icons, metadata/canonicals, real blog routes and discovery files.
- Eight English blog articles, eight banners and forty supporting figures, rebranded previously. Do not edit them for retirement.
- Download recovery through saved job references without a new upload/conversion; source outputs remain separate from edited exports.
- Demand-driven cron source and its previously applied live cutover; coalesced wake requests. No fresh SQL setup is required.
- Six interface languages, 628 messages per pack, local preference persistence, translated complete policies and controller UI. Blog scopes remain English; generated Markdown and source filenames are untouched.
- Product-focused README with screenshots, recorded language demo, steps, format limits and measured-versus-unmeasured keyword notes.
- Chrome extension 0.2.0 source: one Converter toolbar popup, file picker/drop, manual Paste into detected AI sites, uploaded-job recovery. No public store release or completed native acceptance is claimed.

PRs #1–#7 merged. Deployed source revision: `c056e180525c4a0fc3c8a4702fe678fd2601a4d4`. PR #7 CI: 255 frontend tests and all seven jobs passed. All six Vercel deployment statuses succeeded; the initial integrated release had 40 passing production HTTP checks. The 27 October retirement audit passed 20 focused checks and all pools were 2/2 ready. See [release record](../LLMISER_RELEASE_2026-10-26.md) and [retirement acceptance](../LLMISER_LEGACY_RETIREMENT.md).

## Repository and private-material boundaries

Use `C:/Users/temp/Documents/GitHub/LLMiser` on this machine; fresh clones use their own root. Build/test commands and source must not require sibling repositories.

| Path | Purpose |
| --- | --- |
| `frontend/` | Production Next.js web app, public APIs, reader and controller |
| `backendN/`, `backendO/`, `backendZ/` | Current normal, OCR and ZIP conversion services |
| `supabase/` | Existing migrations/setup and scheduler source; legacy identifier names stay compatible |
| `extension/` | Chrome extension source and independent tests/build/package |
| `legacy-site/` | Static replacement for the old frontend hosting; never use as the LLMiser app root |
| `docs/` | Public current runbooks and dated evidence |
| `blog-pipeline/` | Local/private visual generator, per-article specs and sources; not in a fresh public clone |
| `project-docs/brand/llmiser/` | Local/private approved brand kit |
| `project-docs/rebranding-research/` | Local/private reference archive |
| `project-docs/retirement-backups/` | Private verified snapshots of old repositories; may contain credentials |
| `docs/mdify-history/` | Local/private historical material, not current operating instructions |

Private folders are excluded through the tracked `.gitignore` as well as this checkout's existing local exclusions. Never commit backups, environment values, private generator sources or raw operator evidence. A fresh public clone has the complete app and published blog assets, but not the private blog-authoring pipeline. Restore that from the owner's private backup when needed; do not fetch it from a soon-deleted sibling checkout.

## Retirement implementation

[Retirement guide](../LLMISER_LEGACY_RETIREMENT.md) records snapshot counts and limits. Keep both old source checkouts read-only until the owner deletes them. MDify-Pro contains pre-existing dirty/untracked work; snapshots preserve it. Do not commit or discard that work in the original checkout.

The old `mdify-app` Vercel project now deploys this repository, branch `main`, root `legacy-site`, framework Other/static. Its verified deployment is `FraWhBMCH5f3B3VK8QBJrf5JQ4ff`; the hosted banner has no forms/scripts and remains protected on deployment-specific URLs. Public legacy domains continue redirecting migrated pages directly. The static package has no API handlers, but domain-level routing takes precedence: the old Vercel alias redirects API paths, while the old custom domain still serves the working LLMiser project's API with noindex. Do not claim public API calls all return 404. Shared backend/storage/cron resources are not deleted by this replacement.

The main `llmiser` project stays root `frontend`. Its domain redirects and compatibility assets remain in `frontend/next.config.js`. The old backend deployment sources must be reviewed separately before deleting their GitHub connections or services. A successful frontend replacement does not certify old-service retirement.

Active local tooling now has zero absolute references to either old checkout. LLMiser's private brand helper uses its local directory, but do not run the whole `project-docs/brand/make-icons.mjs`: it also writes to an unrelated Atomic File Manager project. Existing approved icons were not regenerated.

## Prompt for the next retirement agent

> Work only in LLMiser. Read docs/START_HERE.md, this handover, PROGRESS.md and LLMISER_LEGACY_RETIREMENT.md first. The old frontend replacement is already deployed; preserve its Git connection, static root, public redirects, DNS/TLS and deployment protection. Before any separately authorized old repository/backend deletion, audit each provider's source connection and every remaining consumer, verify the private local/remote bundles and dirty-file snapshots, and report exact blockers. Preserve shared storage, database, scheduler, Vault entries and compatibility identifiers. Do not rerun initial provisioning or delete either original checkout's uncommitted work. Blogs/visuals are complete and unchanged. Record observed results and distinguish them from dated conversion evidence. Repository/service deletion requires explicit scope and is not authorized by this handover text.

## Verification commands

Use Node.js 22. From `frontend`:

```sh
npm ci
npm test
npm run lint
npm run i18n:check
npm run sql:check
npm run blog:check
npm run build
```

The focused legacy routing test is `node --test test/legacySite.test.mjs`. It checks permanent host-scoped public routing, API exclusion and a static-only output allowlist. Hosting behavior still requires live HTTP checks after deployment. A local static-server preview verifies the banner visually but does not emulate Vercel redirects.

From `extension`, use its documented `npm test`, build and package commands. Do not infer native Chrome behavior from the simulated preview. Do not load production credentials just to run UI/documentation checks.

## Rules for the next agent

1. Inspect Git status and this tracker before working. Current handovers override stale phase notes.
2. Preserve the old domains/DNS/TLS and crawlable permanent redirects even if the old GitHub repositories are deleted. Do not replace them with a noindex banner, robots block or homepage-only redirect.
3. Preserve shared infrastructure identifiers, provider state, retention behavior, keys and protocol headers. The presence of `mdify` in an identifier is not permission to remove or rename it.
4. Do not run an old setup/cutover script again just to remove branding. Do not delete provider services as a side effect of source retirement.
5. Distinguish checked local code, observed deployment state, prior reported conversions and untested operator actions. No new live upload/admin/cleanup acceptance is implied by the release checks.
6. Track remaining native extension acceptance, native-language review, search monitoring, private backup custody and old-service consumer audit in [PROGRESS](PROGRESS.md).
