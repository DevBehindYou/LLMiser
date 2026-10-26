# LLMiser progress and remaining work

Updated 26 October 2026. This is the current tracker. Earlier phase-specific numbers remain in their reports; they are not the current deployment state.

## Completed and released

| Workstream | Current evidence |
| --- | --- |
| LLMiser app rebrand and Prompt L assets | Released; working source is this repository |
| Blog content and visuals | Complete: 8 articles, 8 banners, 40 figures; English; unchanged by localization/retirement |
| Download recovery | PR #1 integrated and released through PR #5 |
| Cron source and live cutover | PR #2 merged; live URL/idle-dispatch changes were applied in the earlier cron task |
| Wake request coalescing | PR #3 integrated and released through PR #5 |
| Extension source 0.2.0 | PR #4 merged; native acceptance and store publication are still pending |
| Six-language web app | PR #5 released; English US, German, Japanese, Spanish, Russian, Simplified Chinese; 628 messages each |
| Final display-label fixes | PR #6 merged/deployed; preview labels/tooltips, mobile theme and retention labels |
| Public README | Screenshots, recorded demo, steps, formats, profiles, privacy and FAQs; separate keyword evidence |
| Final frontend CI | 252 tests passed; lint, dictionaries, SQL/blog consistency and production build passed |
| Other CI | Backend N/O/Z, PostgreSQL, edge and extension jobs passed |
| Production deployment | Revision `aa0635433bf520bfddc6edb796c14a74430e64f8`; all five Vercel statuses successful |
| Production HTTP audit | 40 passing checks during the integrated release; all 13 sitemap pages; permanent legacy redirects; API noindex/auth boundary |
| Backend readiness | Normal/OCR/archive each 2/2 ready after final release |
| Browser acceptance | All six languages, persistence, English-only blogs, translated policy/controller login; German 390px viewport had no horizontal overflow |
| Search migration | Google accepted Change of Address and canonical sitemap on 21 October; ongoing recrawl/indexing monitoring remains open |

See [release record](../LLMISER_RELEASE_2026-10-26.md), [localization](../LLMISER_LOCALIZATION.md), [cron/wake](../LLMISER_CRON_WAKE.md) and [search migration](../LLMISER_SEARCH_MIGRATION.md) for exact evidence and limits.

## Current retirement task

| Item | State |
| --- | --- |
| LLMiser as sole working repository | Owner confirmed; all new source and fallback hosting package live here |
| Old-repository Git histories | Verified private bundles created for both local repositories |
| Uncommitted/private working material | Verified ZIP snapshots: MDify 354 files; MDify-Pro 622 files; caches/build outputs/logs excluded |
| Standalone private assets | Existing LLMiser brand kit, research, historical notes and blog generator confirmed present |
| Updated entry point and AI handovers | Rewritten for current deployed state and retirement scope |
| Minimal legacy replacement | `legacy-site/` prepared; static LLMiser-only banner, permanent public redirects, no API/converter |
| Old frontend hosting cutover | Pending live configuration/deployment verification; do not mark complete from files alone |
| Old GitHub repository deletion | Not performed; owner plans deletion after backup/dependency checks |
| Old local checkout deletion | Not performed; private snapshots preserve existing work |
| Old backend/service retirement | Separate consumer/source audit still required; shared storage/cron must remain |

[Retirement guide](../LLMISER_LEGACY_RETIREMENT.md) records backup locations, exclusions, hosting distinctions and the no-delete boundary.

## Remaining work

- Finish/verify the static legacy frontend hosting cutover, retaining the domains and immediate permanent redirects.
- Export any GitHub-only issues, discussions, releases or settings the owner wants to keep; local Git bundles do not contain these or Actions secrets.
- Keep a verified private backup outside the directories that will be deleted, with an owner-controlled second copy if local disk loss matters. The current snapshots are in LLMiser, not an independent/off-machine backup.
- Audit provider Git connections and all consumers before retiring old backend services or deleting their source repositories. Do not delete shared data, bucket, Vault entries, cleanup functions or compatibility contracts.
- Complete native Chrome 0.2.0 acceptance and store publication; source merge does not publish the extension.
- Native-language review and broader device testing remain useful; UI localization does not expand OCR languages.
- A new full production upload/scanned-PDF/admin/actual-cleanup acceptance run was not part of the 26 October release. Prior generated-file conversion checks remain dated evidence.
- Continue Search Console/Bing monitoring and old-domain redirect retention. Do not claim Google has completely replaced old results without current evidence.

## Blog maintenance

Published source: `frontend/content/blog/<slug>.md`; published visuals: `frontend/public/blog/<slug>/`. The eight current slugs are `document-to-llm-pipeline`, `hidden-token-tax-rag-pipelines`, `markdown-vs-pdf-llm-tokens`, `rag-cost-optimization`, `reduce-llm-api-costs`, `reduce-llm-token-usage`, `why-pdfs-are-expensive-for-ai` and `why-your-llm-bill-is-too-high`.

The private generator is already in `blog-pipeline/`, not a sibling repository. Use its local README/specs for future authorized blog work; current app build and published assets do not require that generator. Preserve slugs, original dates and truthful capability boundaries. The retirement task does not authorize article or visual edits.
