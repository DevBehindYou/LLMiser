# LLMiser — start here

Updated 28 October 2026. **LLMiser is the sole working repository and the source for future releases.** Do not depend on an MDify or MDify-Pro checkout: the owner plans to delete those repositories.

## Current state

The app is live at https://llmiser.devbehindyou.com. PRs #1–#9 are merged; the latest verified runtime change is revision `84e510db62ea41f31c131771eb7d32b5e92515f4`. PR #9 passed 259 frontend tests and all seven CI jobs; all six Vercel deployment statuses succeeded, including the static legacy frontend. A fresh 27 October release audit passed 20 focused HTTP checks and all three pools remained 2/2 ready. See [reader statistics and release evidence](LLMISER_READER_STATISTICS.md), the [earlier integrated release](LLMISER_RELEASE_2026-10-26.md) and [retirement evidence](LLMISER_LEGACY_RETIREMENT.md).

The full app supports English (US), German, Japanese, Spanish, Russian and Simplified Chinese. The browser remembers the interface language; documents are not translated and OCR languages are unchanged. Blogs remain English. Eight articles, eight banners and forty figures are complete. The Chrome extension source is merged, but native acceptance and store publication remain pending.

The next optimization source is [large-preview control](LLMISER_LARGE_PREVIEWS.md): generated browser profiling supports pausing automatic formatting above 50,000 characters, while retaining complete raw text and exports. Local validation passed 261 frontend tests, a final 20-test selection and a production build. Current CI/merge/deployment status belongs to the optimization PR linked in [the handover](ai-handover/HANDOVER.md); the runtime revision above is the preceding verified release.

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
