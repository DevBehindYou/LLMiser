# M04-S2 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_lists.py, LibreOffice PDF export, llmiser_local.py doc x3 | Three files converted; displayed numbering captured |
| check-private.mjs nested-word-lists-markdown | PASS: 0 errors, 1,561 words, intro 85, H2 openers 35 to 42; warnings: long sentences, draft flag |
| preview.mjs nested-word-lists-markdown | 0 geometry issues |

Corrections during drafting: the first reviewed copy indented bullets two levels at once by mistake and produced "* + Clearance labels"; kept as its own test file (steps-skip-level.docx) and fixed in the reviewed copy. A sentence pointing readers to the unpublished parent's finding was removed.

Parent consistency note for Phase D: M04's list section generalizes ("nesting can flatten") from a style-based list. This support shows real multilevel lists keep nesting. Consider adding "when levels come from separate list styles" to the parent when it is revised.

Product observations for the owner: an interrupting paragraph restarts Markdown numbering at 1; lettered sub-steps become numbers; style-based list levels flatten.
