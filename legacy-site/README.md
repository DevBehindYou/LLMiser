# Legacy hosting shell

This is the replacement for the old MDify **frontend deployment**, maintained inside LLMiser so deleting an old GitHub repository does not delete the replacement's source.

- The two known legacy hosts permanently redirect public paths to the equivalent LLMiser URL. Query strings are retained by Vercel. The existing domain-level redirects remain in place too.
- Other deployment hosts show a small, noindex LLMiser banner with an Open LLMiser link. There is no automatic JavaScript delay or intermediate banner on the public migration path.
- This package contains no converter, API handlers, controller, analytics, storage client, dependencies or runtime credentials. Its routing excludes API paths; with no API handler they return 404 and the custom 404 page shows the same banner. Existing domain-level routing can take precedence: the public `mdify-app.vercel.app` alias currently redirects every path, including API paths, to LLMiser. The old custom domain belongs to the working LLMiser project and its API is still served there. Do not infer public-domain API behavior from this static package alone.
- Only `public/` is published. Local notes, source repositories and environment files are not served.

## Existing Vercel project

Use the existing `mdify-app` project; retain its domains and redirects. Connect its Git source to `DevBehindYou/LLMiser`, branch `main`, with **Root Directory `legacy-site`**. The checked-in configuration selects Other/static, disables installation/build commands and publishes `public`. Never point the working `llmiser` project's root here: it stays `frontend`.

This cutover is deployed: production revision `c056e180525c4a0fc3c8a4702fe678fd2601a4d4`, deployment `FraWhBMCH5f3B3VK8QBJrf5JQ4ff`, ready on 26 October 2026. The hosted banner was verified on 27 October. Deployment-specific URLs retain Vercel authentication protection; do not disable it to expose a fallback preview. See the retirement guide for live routing evidence.

The legacy frontend's old environment settings are not consumed by this static package. Do not delete shared services, storage, secrets or scheduler resources while changing its deployment source. See [the retirement handover](../docs/LLMISER_LEGACY_RETIREMENT.md) for preserved dependencies and backup evidence.

For a local visual preview, serve `legacy-site/public` with an ordinary static server. This checks the banner only, not Vercel routing. Automated routing checks live in the frontend test suite; deployment HTTP checks remain necessary.
