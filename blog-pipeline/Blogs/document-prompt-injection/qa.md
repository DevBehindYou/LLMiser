# M11 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Not published. Category SECURITY (new category label; owner may prefer GUIDE).

| Command (2026-11-09) | Result |
| --- | --- |
| render-private.mjs document-prompt-injection | banner + 4 figures |
| check-private.mjs document-prompt-injection | PASS: 0 errors, 1,523 words, intro 83, H2 openers 34 to 43 |
| preview.mjs document-prompt-injection | 0 geometry issues after two wrap fixes |

Reviewed risky-wording warnings: "isn't a guarantee" (negation, intended) and the FAQ "Does LLMiser remove prompt injection" (answered No). Safety: inert example, no model calls, no real accounts, no exfiltration or tool use.
