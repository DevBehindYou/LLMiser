# M04-S1 QA log

Status: DRAFTED, READY_FOR_REVIEW. draft: true. Title: registry proposal kept.

| Command (2026-11-09) | Result |
| --- | --- |
| make_guide.py, llmiser_local.py doc x2 | Two versions converted |
| check-private.mjs word-heading-styles-markdown | PASS: 0 errors, 1,496 words, intro 77, H2 openers 30 to 34; warnings: long sentences, rhythm, draft flag |
| preview.mjs word-heading-styles-markdown | 0 geometry issues after one width fix |

Corrections during drafting: an FAQ first said Word's levels "map down to ######"; Word has nine heading levels and only 1 to 6 map, so it now names Heading 4 to 6 explicitly (code-read).

Distinctness: parent shows one real versus one fake heading; this support covers seven formatting cases, the file-name title rule and a full outline check. Product observations for the owner: Word's Title style and custom heading styles convert as plain paragraphs; a document without an opening Heading 1 gets a title from its file name.
