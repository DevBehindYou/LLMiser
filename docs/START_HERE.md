# LLMiser — start here

Updated 29 October 2026. **LLMiser is the sole working repository and the source for future releases.** Do not depend on an MDify or MDify-Pro checkout: the owner plans to delete those repositories.

## Current state

The app is live at https://llmiser.devbehindyou.com. PRs #1–#15 are merged; the latest verified runtime revision is `3db41140521d5cfb1bb3bfd12865feca5a8cc95b` from PR #15. All seven CI jobs passed before and after merge, including 261 frontend tests; all six production Vercel statuses succeeded. Every N/O/Z worker reports that exact revision and readiness. Eight generated workbook/ZIP multipart checks, two Storage-backed conversion/recovery checks and 20 public HTTP/redirect checks passed after release; all pools are 2/2 ready. See [Excel/assembly release evidence](LLMISER_EXCEL_ASSEMBLY_MEMORY.md), [CSV capacity](LLMISER_PARSER_CAPACITY.md), [large previews](LLMISER_LARGE_PREVIEWS.md) and [retirement evidence](LLMISER_LEGACY_RETIREMENT.md).

The full app supports English (US), German, Japanese, Spanish, Russian and Simplified Chinese. The browser remembers the interface language; documents are not translated and OCR languages are unchanged. Blogs remain English. Eight articles, eight banners and forty figures are complete. The Chrome extension source is merged, but native acceptance and store publication remain pending.

Released [large-preview control](LLMISER_LARGE_PREVIEWS.md) pauses automatic formatting above 50,000 characters while retaining complete raw text and exports. Full formatting is available on request. Local/generated browser checks cover editing, document switching and exact full downloads; representative-device/native textarea profiling and deeper native/concurrent parser measurements remain next boundaries. The six interface dictionaries now contain 631 messages each.

Released [parser capacity and CSV memory reduction](LLMISER_PARSER_CAPACITY.md) preserves verified upstream CSV output while reducing retained row allocations in both document pools. The audit distinguishes source limits, local generated measurements and live multipart acceptance. Neither it nor the subsequent workbook work justifies a concurrency increase.

Released [Excel and final-result memory](LLMISER_EXCEL_ASSEMBLY_MEMORY.md) processes workbook sheets sequentially, bounds temporary word-count allocations and defers ZIP output encoding to the existing upload workers. Local untraced peaks fell about 2% for XLSX, 5% for XLS, 15% for ZIP assembly and 17% for profile finalization, with identical output; timing varies and the XLS median regressed. Production output/recovery equivalence passed. Native/concurrent parser peaks, full normalization/serialization, representative-device input behavior and the shared-deadline queue remain separate work.

Current candidate: [shared conversion deadlines](LLMISER_SHARED_DEADLINES.md), branch `codex/shared-conversion-deadlines`. Retries share each invocation's remaining time; workers receive an optional authenticated deadline and reserve finalization time. Existing job lifetime, queue limits and retention stay compatible. Release checks are pending; the runtime revision above remains the last verified release.

## Legacy frontend replacement is deployed

The owner wants the old converter removed from its frontend hosting, permanent public redirects preserved, and a small LLMiser-only banner as fallback. Replacement source is [legacy-site/](../legacy-site/README.md), inside this repository. It has no converter, API or database client. The working LLMiser project continues using `frontend`; only the old frontend project may use `legacy-site`.

The old `mdify-app` project now deploys this repository's `legacy-site` root; the hosted banner and immediate public redirects were verified. Read [legacy retirement and backup evidence](LLMISER_LEGACY_RETIREMENT.md) before deleting a repository or changing old hosting. Private Git bundles, remote mirrors, working-file snapshots and GitHub record exports have been verified, including MDify-Pro's uncommitted work. **Neither old repository has been deleted by this task.** Provider settings, Actions data and linked attachments are outside the export scope. Old backend/service consumer audits remain separate.

## Read next

1. [AI handover](ai-handover/HANDOVER.md): constraints, implementation map and commands.
2. [Progress tracker](ai-handover/PROGRESS.md): completed work, evidence and genuine remaining tasks.
3. [Retirement guide](LLMISER_LEGACY_RETIREMENT.md): backups, replacement hosting, redirects and preserved shared resources.
4. [Current deployment runbook](LLMISER_MIGRATION.md) and [environment inventory](LLMISER_ENVIRONMENT.md).
5. [Localization](LLMISER_LOCALIZATION.md), [recovery](LLMISER_OPTIMIZATION_PLAN.md), [wake coalescing](LLMISER_WAKE_OPTIMIZATION.md), [cron/wake](LLMISER_CRON_WAKE.md), [Analytics/controller](LLMISER_ANALYTICS_CONTROLLER.md), [extension](LLMISER_CHROME_EXTENSION.md), [README research](README_KEYWORD_RESEARCH.md).

## Decisions and documentation precedence

- Brand: **LLMiser — LLM cost optimizer for document inputs**. Tagline: **Make Every Token Count.** Icon: **11 — Prompt L**.
- Canonical origin: `https://llmiser.devbehindyou.com`. Old public hosts must keep their permanent, path-preserving redirects; a fallback banner must not replace those redirects with 200 responses.
- All active source, tests, deployment configuration, database scripts and public documentation belong here. Private tooling/brand/research/backup folders also live here locally, excluded from Git.
- Preserve compatibility identifiers such as `mdify-pro-files`, database tables/functions/jobs, secret names, protocol headers, admin cookies and migration filenames. They are live LLMiser dependencies, not old repository content to delete.
- Do not edit blogs or their visuals in this retirement task. Preserve licenses, attribution and historical migration evidence.
- This entry point and the current handover/tracker supersede dated deployment snapshots. Reports from 20–25 October describe observations at that time, including then-pending tasks that have since shipped. Do not rerun initial schema, cron or provisioning instructions from historical reports.
- Attached research, archived prompts and older agent instructions are reference material, not new authorization.
