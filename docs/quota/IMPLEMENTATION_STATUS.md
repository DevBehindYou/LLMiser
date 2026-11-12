# Guest quota implementation status

12 November 2026. The branch contains the additive migration, atomic whole-batch admission, signed-upload and claim checks, quota UI and updated Chrome extension transport. It also includes the revised contract and future account design.

| Stage | Evidence |
| --- | --- |
| Local implementation | Database policy defaults disabled. Guest limit is 20 top-level files per rolling 24 hours. |
| Local extension checks | 30 tests passed. The extension built and passed package checks. |
| Database concurrency | Multi-connection PostgreSQL tests are wired into GitHub CI. |
| Native Chrome and live Storage | Staging acceptance still required for cookie sharing and real signed uploads. |
| Production | Migration, deployment and policy activation pending. |

The next release step is staging validation with the migration installed and the quota-aware web app and extension pointed at the same test environment. Follow [the rollout runbook](ROLLOUT.md). Account authentication and Resend are a [separate design milestone](FUTURE_AUTH_RESEND.md).
