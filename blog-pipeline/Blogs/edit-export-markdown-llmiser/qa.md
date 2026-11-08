# M09 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Not published.

| Command (2026-11-08) | Result |
| --- | --- |
| render-private.mjs edit-export-markdown-llmiser | banner + 4 figures |
| check-private.mjs edit-export-markdown-llmiser | PASS: 0 errors, 1,356 words, intro 75, H2 openers 30 to 34 |
| preview.mjs edit-export-markdown-llmiser | 0 geometry issues |

Editorial review: exact title. A first-draft claim that Rendered view hides HTML comments was tested with the app's react-markdown version and found false (comments render as escaped text); the section was rewritten. The original-versus-edited behavior is reported from code-level runs; the browser export suite in tests/browser was not run in this session.
