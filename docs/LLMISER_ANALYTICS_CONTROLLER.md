# Analytics and controller — 22 October 2026

## Web Analytics

The app already includes `@vercel/analytics` and imports `Analytics` from `@vercel/analytics/next` in `frontend/components/SiteAnalytics.js`. The root layout mounts it once. The wrapper drops query strings/fragments and excludes `/llmiser-controller` views. No conversion content or filenames are passed to custom events.

The LLMiser Vercel project is `albedo-projects/llmiser` (the owner's second account). Web Analytics was enabled in the dashboard, but the production script endpoint returned 404. With the owner's explicit approval, the existing production revision `ae3aa59` was redeployed with current project settings and the ignore-build step disabled for that redeploy. No unfinished optimization code was included.

Verified after redeployment:

- `https://llmiser.devbehindyou.com/_vercel/insights/script.js`: **200**, JavaScript.
- Normal browser visits to `/` and `/usecase` appeared in the production dashboard: **1 visitor, 2 page views**. These are acceptance-test visits, not a claim of organic traffic.
- Dashboard: [LLMiser Web Analytics](https://vercel.com/albedo-projects/llmiser/analytics).
- A private screenshot is retained at `project-docs/migration-evidence/vercel-analytics-2026-10-22.png`.

The dashboard's header can display the old custom domain because it is still one of this project's attached domains. That label does not change the app's canonicals or the permanent public redirects. View the Hostnames table to distinguish traffic origins.

Reference: [Vercel Web Analytics setup](https://vercel.com/docs/analytics/quickstart). Enabling the feature adds its routes after the next deployment. Do not add another Analytics component or install a duplicate package to fix a hosting activation issue.

## Controller access

Open [LLMiser controller](https://llmiser.devbehindyou.com/llmiser-controller).

| Login field | Server environment variable |
| --- | --- |
| Access key | `ADMIN_KEY_1` |
| Control key | `ADMIN_KEY_2` |

Use the values configured on the LLMiser frontend's Production environment. Both must be different and at least 24 characters. Do not put either key in `NEXT_PUBLIC_*`, repository documentation, screenshots or chat. The local ignored frontend environment file was used for the initial hosting import; the deployed Production settings determine which values work now.

Verified without credentials: the login page responds 200, `/api/admin/session` reports `configured: true, authenticated: false`, and `/api/admin/overview` returns 401 without a session. The page/API carry noindex headers. Authenticated dashboard queries and admin actions were **not** tested by these checks. Do not describe them as full controller acceptance.

Successful sign-in creates an HttpOnly, Secure, SameSite=Strict cookie scoped to `/api/admin`, expiring after 30 minutes. Both keys must match their corresponding fields. The legacy internal cookie/header names remain compatibility contracts.
