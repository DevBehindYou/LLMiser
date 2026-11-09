# M05-S2 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_charts.py, llmiser_local.py doc x3, LibreOffice render | Three decks converted; slide display captured |
| check-private.mjs slide-chart-context-ai | PASS: 0 errors, about 1,500 words, intro 86, H2 openers 36 to 39; warnings: one long sentence, rhythm, draft flag |
| preview.mjs slide-chart-context-ai | 0 geometry issues |

Finding during the build: the first reviewed copy labeled the churn series "(%)" while still storing fractions. Kept as charts-label-trap.pptx and used in the article as a caution, since it reproduces a realistic fixing mistake.

Distinctness: parent reports one chart; this support covers percent and currency formats, pie percentages, a truncated axis, the reviewed copy and when to send the image. Product observation for the owner: chart number formats and axis titles are dropped, so 4.2% converts as 0.042.
