# M01-S1 fixture record

Reuses the M01 synthetic archives (`../../prepare-codebase-for-ai/fixtures/invoice-tool-original.zip`, SHA-256 540bfc9f..., and `invoice-tool-sharing.zip`, SHA-256 3cef472d...). All values FAKE; e-mails use example.com.

`review_zip.py` is an illustrative two-pass review (file-name rules and text-content patterns), reading entries in place and descending into nested ZIPs. It is not a complete secret scanner and is not part of LLMiser. Run 2026-11-09; outputs `review-original.json` and `review-sharing.json`.

| Archive | Entries incl. nested | Flagged by name | Flagged by content | Content only | Name only |
| --- | --- | --- | --- | --- | --- |
| original | 35 | 13 | 8 | config/settings.local.yaml | .git/HEAD, backup ZIP container, backup totals.py, screenshot-checkout.png, id_ed25519, totals (copy).py |
| sharing | 13 | 1 | 1 | none | none (.env.example flagged by both: empty template line matched) |

Notable misses: id_ed25519 (fake placeholder has no key header) was invisible to content patterns; the screenshot's text is unreadable to a text search; in tmp/debug-notes.txt a fake key written in a sentence did not match the assignment pattern (the file was flagged for an e-mail address).
