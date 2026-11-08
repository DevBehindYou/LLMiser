# M02 visual ledger

Spec: `visuals.mjs`. Private render to `visuals/` (inspectSvg clean). Preview: `visuals/preview/contact-375.jpg`, geometry 0 issues on 5 SVGs.

| File | Kind | Data source | Review notes |
| --- | --- | --- | --- |
| banner.svg | Banner | Fixture order number PO 10O5-B and its recognized form | First render: magnifier covered the label and the highlight boxed the 5. Redrawn as a before/after with the letter O boxed and labeled "letter O"; re-inspected dark and light |
| nine-checks.svg | Process overview (3x3 flow) | Article structure; highlighted boxes = checks that caught errors in F-M02 | Clean in both themes |
| field-comparison.svg | Source-to-output comparison | fixtures/truth.json versus out-invoice-clean and out-invoice-degraded | Values re-checked against full outputs (degraded Total value present without its label, shown as "alone"). In the mono font the letter O and zero look alike, so the O is underlined in the original values; legend explains it |
| verify-decision.svg | Decision | Article guidance | Diamond text shortened to one line ("Decision depends on it?") after "it?" wrapped |
| final-checklist.svg | Checklist with limitation | Article guidance; English-only from backendO config | Clean |

Alt text and captions are as written in draft.md. Every caption either cites the local run or says Illustration.
