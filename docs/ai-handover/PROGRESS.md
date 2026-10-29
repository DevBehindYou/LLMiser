# LLMiser progress and remaining work

Updated 29 October 2026. This is the current tracker. Earlier phase-specific numbers remain in their reports; they are not the current deployment state.

## Completed and released

| Workstream | Current evidence |
| --- | --- |
| LLMiser app rebrand and Prompt L assets | Released; working source is this repository |
| Blog content and visuals | Complete: 8 articles, 8 banners, 40 figures; English; unchanged by localization/retirement |
| Download recovery | PR #1 integrated and released through PR #5 |
| Cron source and live cutover | PR #2 merged; live URL/idle-dispatch changes were applied in the earlier cron task |
| Wake request coalescing | PR #3 integrated and released through PR #5 |
| Extension source 0.2.0 | PR #4 merged; native acceptance and store publication are still pending |
| Six-language web app | PR #5 released; English US, German, Japanese, Spanish, Russian, Simplified Chinese; now 637 messages each after PR #19 |
| Final display-label fixes | PR #6 merged/deployed; preview labels/tooltips, mobile theme and retention labels |
| Public README | Screenshots, recorded demo, steps, formats, profiles, privacy and FAQs; separate keyword evidence |
| Final frontend CI | PR #19 and merged main: 279 tests passed; lint, dictionaries, SQL/blog consistency and production build passed |
| Other CI | Backend N/O/Z, PostgreSQL, edge and extension jobs passed |
| Production deployment | Latest frontend runtime `efbeab60026b0e77a71a3d16822d81bbe6f81f2b` (PR #19); all six Vercel statuses successful; no backend revision change claimed from this frontend-only release |
| Shared reader statistics | PR #9 merged/deployed; allocation-bounded counting and shared reader line/status metrics; preserved count semantics; synthetic benchmark and limits documented |
| Large-preview control | PR #11 merged/deployed; generated browser profiling, explicit formatting above 50,000 characters, complete raw/copy/download acceptance, six-language notices |
| CSV parser memory | PR #13 merged/deployed; verified-version output preservation in N/Z, synchronized generated measurements, and successful pre/post-release multipart CSV/ZIP probes on all four document workers |
| Excel and final-result memory | PR #15 merged/deployed; sequential sheets, exact bounded word counts and bounded output encoding; generated multipart and actual Storage/download/recovery acceptance passed |
| Controller detail pagination | PR #19 merged/deployed; bounded reads/exact totals, complete generated-file export and font build fix verified |
| Shared conversion deadlines | PR #17 merged/deployed; shared invocation/attempt time, worker checkpoints and OCR/I/O limits; 30 protocol checks and real multi-stage Storage acceptance passed |
| Production HTTP audit | 29 October: 20 public-page/discovery/health and permanent-redirect checks passed; documented legacy API routing unchanged |
| Backend readiness | 29 October uncached wake: normal/OCR/archive each 2/2 ready; exact six-worker revision checks remain dated PR #17 evidence |
| Browser acceptance | All six languages, persistence, English-only blogs, translated policy/controller login; German 390px viewport had no horizontal overflow |
| Search migration | Google accepted Change of Address and canonical sitemap on 21 October; ongoing recrawl/indexing monitoring remains open |

See [release record](../LLMISER_RELEASE_2026-10-26.md), [localization](../LLMISER_LOCALIZATION.md), [cron/wake](../LLMISER_CRON_WAKE.md) and [search migration](../LLMISER_SEARCH_MIGRATION.md) for exact evidence and limits.

## Current retirement task

| Item | State |
| --- | --- |
| LLMiser as sole working repository | Owner confirmed; all new source and fallback hosting package live here |
| Old-repository Git histories | Verified private local bundles plus fetched remote/PR-head bundles for both repositories |
| GitHub records | Private repository/issue/PR/comment/review/release JSON exports completed; exact counts and exclusions in retirement guide |
| Uncommitted/private working material | Verified ZIP snapshots: MDify 354 files; MDify-Pro 622 files; caches/build outputs/logs excluded |
| Standalone private assets | Existing LLMiser brand kit, research, historical notes and blog generator confirmed present |
| Updated entry point and AI handovers | Rewritten for current deployed state and retirement scope |
| Minimal legacy replacement | `legacy-site/` deployed from LLMiser; static LLMiser-only banner, no API/converter in the package |
| Old frontend hosting cutover | Complete: old project source LLMiser/main, root legacy-site, deployment FraWhBMCH5f3B3VK8QBJrf5JQ4ff Ready; hosted banner verified |
| Retirement live audit | 20 passing public checks; both hosts preserve migrated paths/queries through 308 redirects; normal/OCR/archive each 2/2 ready; existing public API/unknown-path routing documented separately |
| Old GitHub repository deletion | Not performed; owner plans deletion after backup/dependency checks |
| Old local checkout deletion | Not performed; private snapshots preserve existing work |
| Old backend/service retirement | Separate consumer/source audit still required; shared storage/cron must remain |

[Retirement guide](../LLMISER_LEGACY_RETIREMENT.md) records backup locations, exclusions, hosting distinctions and the no-delete boundary.

## Remaining work

Released: [controller detail pagination and font build fix](../LLMISER_CONTROLLER_PAGINATION.md), PR #19 at `efbeab60026b0e77a71a3d16822d81bbe6f81f2b`. All seven CI jobs passed before/after merge, including 279 frontend tests and build; all six Vercel production statuses succeeded. Actual authenticated traversal recovered exact IDs for four files, 73 nodes, one work item and two events; initial nodes were bounded to 50. All four ACTIVE files were signed/fetched and an assembled ZIP reopened with four entries. Old client 409, unauthenticated 401, invalid limit 400 and private headers passed. All 16 font responses matched hashes/immutable headers; HTML/CSS retained local font delivery and three preloads. Twenty HTTP checks passed; uncached wake was 2/2 in all pools. The one generated baseline job retains normal 48-hour cleanup. No native browser layout, destructive admin/cleanup or new backend capacity/revision acceptance is implied.

Released: [shared conversion deadlines](../LLMISER_SHARED_DEADLINES.md), PR #17 at 9131a2a. All seven CI jobs passed before/after merge, all six Vercel statuses succeeded and all six workers reported the exact revision/readiness. Thirty production auth/expired/invalid/valid/legacy protocol requests passed; eight future-header workbook/ZIP comparisons and two Storage baselines retained identical output/counts. Two additional Storage jobs exercised image-ZIP OCR/merge and scanned-PDF OCR/merge with exact recovery. Twenty public HTTP checks passed and all pools were 2/2 ready. Six generated Storage jobs in total across pre/post/multi-stage probes follow existing retention; cleanup was not manually run. Controller detail pagination is now released in PR #19; no whole-job lifetime or exactly-once write guarantee is claimed.

Released: [Excel conversion and final-result assembly memory](../LLMISER_EXCEL_ASSEMBLY_MEMORY.md), explicitly selected by the owner, PR #15 at 3db4114. Local suites: 144 normal/101 archive tests; installed-version checks passed. All seven Linux CI jobs and six Vercel production statuses passed, with exact revision/readiness verified on all six workers including Render. Eight post-release generated multipart probes and two Storage-backed XLSX/ZIP conversions passed, including all four output objects and exact saved-result recovery. Before/after Markdown, counts and index hashes match; manifest job IDs correctly differ. All 20 HTTP checks passed and all pools were 2/2 ready. Four real jobs across before/after tests follow normal retention; cleanup execution itself was not tested. Local Windows OCR readiness-suite failure is preserved in the report; Linux OCR CI passed.

The owner resumed the implementation plan after the handover was merged in PR #8. [Shared reader statistics](../LLMISER_READER_STATISTICS.md) shipped in PR #9. [Large-preview control](../LLMISER_LARGE_PREVIEWS.md) shipped in PR #11 at 0501cd0 after 261 frontend CI tests/all seven jobs passed. All six production deployments succeeded; the 28 October 20-check HTTP audit passed and all three pools were 2/2 ready. Actual-component generated browser measurements and exact raw/download acceptance support the preview boundary. Representative-device/native textarea profiling and deeper parser-capacity work remain separate.

[Parser audit/CSV evidence](../LLMISER_PARSER_CAPACITY.md) shipped in PR #13 at 165d2b0. The synchronized large untraced fixture used about 25% less peak process memory, with identical output; the small timing sample regressed, so no universal speedup is claimed. Local normal/archive suites and compatibility checks passed, all seven CI jobs and six production deployments succeeded, and pre/post-release multipart CSV/ZIP probes passed on all four document workers. All 20 public HTTP checks passed. OCR initially returned 0/2; direct readiness and a later uncached public wake confirmed all pools 2/2, without an OCR configuration change. No worker/queue tuning or Storage-backed conversion acceptance is implied.

- Retain the domains and immediate permanent redirects after the completed static frontend cutover.
- Review any additional GitHub-only material the owner needs beyond the completed record exports. Actions artifacts/logs/secrets, provider settings and linked attachments were not exported.
- Keep a verified private backup outside the directories that will be deleted, with an owner-controlled second copy if local disk loss matters. The current snapshots are in LLMiser, not an independent/off-machine backup.
- Audit provider Git connections and all consumers before retiring old backend services or deleting their source repositories. Do not delete shared data, bucket, Vault entries, cleanup functions or compatibility contracts.
- Complete native Chrome 0.2.0 acceptance and store publication; source merge does not publish the extension.
- Native-language review and broader device testing remain useful; UI localization does not expand OCR languages.
- The latest deadline slice accepted actual OCR multipart conversion and generated XLSX/workbook-ZIP/image-ZIP/scanned-PDF Storage downloads/recovery. Authenticated admin and actual cleanup execution remain separate; historical releases retain their own acceptance limits.
- Continue Search Console/Bing monitoring and old-domain redirect retention. Do not claim Google has completely replaced old results without current evidence.

## Blog maintenance

Published source: `frontend/content/blog/<slug>.md`; published visuals: `frontend/public/blog/<slug>/`. The eight current slugs are `document-to-llm-pipeline`, `hidden-token-tax-rag-pipelines`, `markdown-vs-pdf-llm-tokens`, `rag-cost-optimization`, `reduce-llm-api-costs`, `reduce-llm-token-usage`, `why-pdfs-are-expensive-for-ai` and `why-your-llm-bill-is-too-high`.

The private generator is already in `blog-pipeline/`, not a sibling repository. Use its local README/specs for future authorized blog work; current app build and published assets do not require that generator. Preserve slugs, original dates and truthful capability boundaries. The retirement task does not authorize article or visual edits.
