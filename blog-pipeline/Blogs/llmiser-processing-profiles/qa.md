# M08 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Not published.

| Command (2026-11-08) | Result |
| --- | --- |
| render-private.mjs llmiser-processing-profiles | banner + 4 figures |
| check-private.mjs llmiser-processing-profiles | PASS: 0 errors, 1,380 words, intro 67, H2 openers 29 to 42 |
| preview.mjs llmiser-processing-profiles | 0 geometry issues |

Editorial review: exact title; describes code behavior, which contradicts the site FAQ wording on Compact (logged in research.md for the owner). FAQ on changing profiles corrected during QA to remove and re-add (done items are not reconverted by Convert all). Metadata parent aligned with the registry (E08).

## Product observations for the owner

1. Compact deletes every "---" in the document, which empties Markdown table separator rows (tables stop rendering), changes text such as "March---April", and removes blank lines inside code. It also applies to ZIP results.
2. RAG-ready inserts `<!-- chunk-boundary -->` inside fenced code blocks before lines that start with "## ".
3. Site FAQ says Compact "also" removes the source note's sibling behaviors; code keeps the source note in Compact.
