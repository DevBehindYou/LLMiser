# Guest quota implementation status

12 November 2026. The branch contains the additive migration, atomic whole-batch admission, signed-upload and claim checks, quota UI and updated Chrome extension transport. It also includes the revised contract and future account design.

| Stage | Evidence |
| --- | --- |
| Local implementation | Database policy defaults disabled. Guest limit is 20 top-level files per rolling 24 hours. |
| Local extension checks | 31 tests passed. The extension built and passed package checks. |
| Database concurrency | Multi-connection PostgreSQL CI verified parallel batches, last-slot races, idempotent replay and claim-versus-release. |
| Native Chromium | A disposable browser profile with a native extension context and loopback fixtures verified shared guest identity in both bootstrap orders, missing-cookie rejection, batch rejection, the 21st-file denial, idempotent upload replay and download after exhaustion. A 20-file batch initially exposed a short-term request throttle. After the retry fix, all 20 files completed and the quota showed 20 used and zero reserved. |
| Hosted Storage | Staging acceptance still required with hosted Supabase Storage and the target Chrome configuration. The browser fixture used the app handlers and SQL migrations with simulated Storage signing and conversion workers. |
| Production | Migration, deployment and policy activation pending. |

The next release step is staging validation with the migration installed and the quota-aware web app and extension pointed at the same test environment. Follow [the rollout runbook](ROLLOUT.md). Account authentication and Resend are a [separate design milestone](FUTURE_AUTH_RESEND.md).
