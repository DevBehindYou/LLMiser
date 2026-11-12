# Revised implementation contract

11 November 2026. Supersedes ambiguous clauses in the reviewed LLMiser Quota/Limits/Auth/Resend prompt. Implement guest quota now; design authentication/Resend separately. Follow 00_AUDIT.md and the implementation status rather than historical MDify paths.

1. Preserve existing conversion, deadlines, queue, storage admission, retention and result retrieval. Work only in LLMiser; use current source and docs/ai-handover/HANDOVER.md and PROGRESS.md. No STATE.yaml is assumed.
2. Exactly 20 accepted top-level files per server-issued guest identity per rolling 24 hours. Reserve before signing uploads. Count pending and started work, never child tasks. Whole batches are atomic and rejected if they do not fit.
3. Idempotency binds subject + request UUID + complete normalized file manifest. Identical replay returns the same jobs; conflicting replay returns 409. Network uncertainty is not proof of failure and cannot trigger a refund.
4. First durable worker claim starts charging permanently for the admission window. Pending expiry/release fences future claims. Started failures remain charged. New submissions are new charges; recovery of an existing job is not.
5. Preserve independent storage authorization guards. Expired quota cannot authorize worker dispatch even if an old signed URL still uploads bytes. Do not shorten byte reservations when releasing file quota.
6. Expose only service-role RPC wrappers, preferably SECURITY INVOKER with explicit table privileges. Sensitive tables can remain private. Do not attempt to call a non-exposed schema directly through the current PostgREST client.
7. Extension backend uploads are a current required path. Bootstrap server identity and explicitly test cookie sharing with host permissions. Never send app cookies or secrets to Storage. Missing/blocked identity fails with actionable UI, not a new identity per file.
8. Keep result access separate from quota enforcement and preserve old recovery links. Later account quota merges must not imply document transfer.
9. Use structured errors: DAILY_FILE_LIMIT with actual remaining, requested count, next-slot time and request-fit time; capacity errors remain distinct. Permanent quota errors are not automatic processing retries. Refresh status on focus and after outcomes.
10. Guest UI uses all six app languages, accessible announcements and explicit rolling-window text. Near-limit <=5, pending shown separately, downloads never disabled for exhaustion.
11. DB flag defaults disabled; apply additive schema before code and enable only after CI, real PostgreSQL races, native extension/browser acceptance and production configuration checks. Fail closed on unknown policy. No automatic production schema replay.
12. Keep bounded cleanup and metadata-only diagnostics. Never log tokens, signed URLs or input contents. Distinguish implemented, tested, merged, deployed, enabled and production-verified.
13. Future-only: verified Supabase account gets 50 total, not 20+50. Usage reconciliation uses immutable event IDs and one-time guest association. Supabase Auth handles passwords; Resend custom SMTP is separate. No signup, password reset, DNS changes or email credentials in this guest release.

Deliver audit, additive SQL, server and client integration, regression/concurrency tests, operational runbook, future-auth design and honest milestone evidence. Existing broad PR/release authorization does not replace required validation.
