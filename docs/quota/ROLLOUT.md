# Guest file quota rollout

The additive migration ships with enforcement disabled. It extends the existing job and Storage path. The guest allowance is per browser identity and uses rolling admission timestamps. Global admission and storage capacity remain independent.

1. Run the branch checks, including `tests/integration/postgres_quota.mjs` against its disposable multi-connection PostgreSQL fixture. Inspect the exact tested branch revision.
2. Apply only `supabase/migrations/20261111000000_llmiser_guest_quota.sql` to an isolated Supabase project with the earlier migrations installed. Verify `select public.quota_policy();` shows disabled. Test the prior frontend against the additive schema. Avoid replaying the consolidated setup script against an existing deployment.
3. Configure `QUOTA_GUEST_SECRET` as a stable, independently generated random secret of at least 32 characters. Use one value per environment across instances. Rotation invalidates old guest identities and should be planned. The server refuses guest issuance if the secret is missing.
4. In staging, deploy the quota-aware app and build. Set `quota_private.policy.enabled` to true for its singleton row. Verify a real signed upload for each pool, 20 admissions followed by a rejected 21st, an entire batch rejection, resuming a successfully uploaded file, and an existing download after exhaustion. Check local-time display and keyboard operation.
5. Load the extension build in Chrome against an approved test setup. Verify the browser can share the host cookie between the app and the extension, including the browser's cookie restrictions. Use test fixtures. Verify that Storage requests omit credentials. The shipped extension targets the canonical production app and Storage origins, so use an isolated test build configured for staging for pre-release smoke tests.
6. Apply the same single migration in production before deploying this frontend. Keep policy disabled while verifying legacy uploads, recovery ticks and the new version. Make the updated extension available before enabling. Older clients receive an update-required response under enforcement.
7. Enable after the release evidence is recorded. Observe quota rejection counts, reservation expiry, orphan handling, queue delay and backend capacity through metadata-only diagnostics. Avoid logging cookies, upload URLs, filenames or file content.

Use this operator query in the target SQL Editor after independently verifying the project and environment:

```sql
select public.quota_policy();
update quota_private.policy set enabled = true where singleton;
```

Set `enabled = false` to suspend enforcement and allow ordinary admission again. Leave the additive migration installed so outstanding reserved jobs and new frontend calls retain their contracts. Existing metered jobs still obey their own reservation state. Before re-enabling, settle unmetered jobs created during the disabled period. Do not delete ledger rows, release started slots or reset the activation timestamp as a rollback procedure.

Signing closes after 45 minutes to leave headroom within the existing three-hour Storage guard. An existing input can still resume before its reservation expires. Unstarted quota slots release after expiry or terminal pre-start recovery. Started events remain charged for the original rolling window. The tick prunes eligible terminal ledger batches after seven days. This does not alter the 48-hour document retention policy.
