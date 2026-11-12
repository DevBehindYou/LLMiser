# Verified accounts and transactional email

Design only, 12 November 2026. The guest release uses a secure browser cookie. The account milestone adds Supabase Auth email/password and confirmed email, with Resend custom SMTP for transactional mail.

## Account quota

- Validate the Supabase session server-side and use the verified user UUID. Unverified sessions retain the guest limit. Keep credentials and service keys server-only.
- The verified limit is 50 total top-level uploads over the same rolling 24 hours. Account activity is shared across devices.
- During sign-in or verification, lock the guest and account quota subjects in deterministic order. Associate that guest once and preserve unique event IDs, timestamps, in-flight reservations and prior account usage. Treat repeated association as idempotent. If the combined usage exceeds 50, reject new reservations until the required slots return.
- Decide how logout, browser sharing, account deletion and expired sessions affect guest association before implementation. Avoid granting result access as a side effect of reconciling quota usage. Keep upload/result access governed by their own authorization.

## Email setup

- Use the [Supabase email/password flow](https://supabase.com/docs/guides/auth/passwords) with confirmation and recovery. Allow only intended HTTPS redirects. Test expired, reused and invalid links and use neutral responses to reduce account enumeration.
- Verify a sending subdomain the operator controls, such as `auth.llmiser.devbehindyou.com` if selected. Add the records shown for that domain by [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction). Review sender identity, authentication and DMARC before sending.
- Use the supported [Resend SMTP integration](https://resend.com/docs/send-with-supabase-smtp). Store the API key in the provider configuration. Verify current SMTP settings, [Resend pricing and allowances](https://resend.com/pricing) and [Supabase sending limits](https://supabase.com/docs/guides/auth/auth-smtp) at rollout. Keep file quota and email rate limits independent.
- Test verification, resend, reset, delivery failures and throttling with test addresses. Review abuse controls, accessibility, all supported app languages, shared-browser access, data retention and account deletion before exposing signup.
