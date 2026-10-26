# Legacy hosting shell

This is the replacement for the old MDify **frontend deployment**, maintained inside LLMiser so deleting an old GitHub repository does not delete the replacement's source.

- The two known legacy hosts permanently redirect public paths to the equivalent LLMiser URL. Query strings are retained by Vercel. The existing domain-level redirects remain in place too.
- Other deployment hosts show a small, noindex LLMiser banner with an Open LLMiser link. There is no automatic JavaScript delay or intermediate banner on the public migration path.
- This package contains no converter, API handlers, controller, analytics, storage client, dependencies or runtime credentials. Legacy API paths do not redirect or forward request bodies; with no API handler they return 404. The custom 404 page shows the same banner.
- Only `public/` is published. Local notes, source repositories and environment files are not served.

## Existing Vercel project

Use the existing `mdify-app` project; retain its domains and redirects. Connect its Git source to `DevBehindYou/LLMiser`, branch `main`, with **Root Directory `legacy-site`**. The checked-in configuration selects Other/static, disables installation/build commands and publishes `public`. Never point the working `llmiser` project's root here: it stays `frontend`.

The legacy frontend's old environment settings are not consumed by this static package. Do not delete shared services, storage, secrets or scheduler resources while changing its deployment source. See [the retirement handover](../docs/LLMISER_LEGACY_RETIREMENT.md) for preserved dependencies and backup evidence.

For a local visual preview, serve `legacy-site/public` with an ordinary static server. This checks the banner only, not Vercel routing. Automated routing checks live in the frontend test suite; deployment HTTP checks remain necessary.
