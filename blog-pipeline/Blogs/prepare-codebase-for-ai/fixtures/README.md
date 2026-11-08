# M01 fixture record

**Synthetic only.** Every credential is a FAKE placeholder that matches no provider format. E-mail addresses use example.com and IP addresses come from 203.0.113.0/24 (RFC 5737 documentation range). Names are invented.

## Inputs

Generator: `make_fixture.py` (deterministic: fixed ZIP timestamps, seeded random bytes, sorted entries). Inventory with the planted category and keep/remove decision for every path: `inventory.json`.

| File | Entries | Bytes | SHA-256 |
| --- | --- | --- | --- |
| invoice-tool-original.zip | 33 | 325231 | 540bfc9f213f35153281fc50d19fe69764167ad3cde52c288754dca748ea20e6 |
| invoice-tool-sharing.zip | 13 | 3222 | 3cef472da32c9fd2e52cdbbf14ce47009151a5131092a2625904347ea3222281 |

The original ZIP size listed in an earlier generator run (before the test values were corrected) is superseded. Hashes above are the ones the outputs were produced from; `out-*/run.json` repeats them.

Task the sharing copy serves: fix the rounding bug in `invoice_total` (rounds per line, should round once).

## Runs (2026-11-08, revision 06261c1, local code-level runs, not production)

| Run | Command | Result |
| --- | --- | --- |
| Test in sharing copy | `PYTHONPATH=src python -m pytest -q -p no:cacheprovider` (pytest 8.3.3, Python 3.13) | 1 failed: `test_round_once_not_per_line` (expected 0.02, got 0.03). The planted bug reproduces from the copy alone. |
| Archive, original | `scripts/campaign/llmiser_local.py zip invoice-tool-original.zip out-original` | 35 index rows (33 entries plus 2 from the nested backup ZIP). Converted: 21, counting the nested ZIP row itself. Skipped: 14. Failed: 0. combined.md 484 words, backend estimate 644 tokens |
| Archive, sharing copy | `... zip invoice-tool-sharing.zip out-sharing` | 13 rows: 12 converted, `.env.example` skipped by name. combined.md 289 words, backend estimate 384 tokens |
| OCR of planted screenshot | `TESSDATA_PREFIX=<tessdata_fast 4.1.0> ... ocr ocr-input/screenshot-checkout.png out-ocr-screenshot` | Text returned exactly: "Checkout for Jordan Lee", "jordan.lee@example.com", "Invoice INV-1043 total 0.03" |

Versions: Python 3.13.18, markitdown 0.1.9 (inside the backend's verified 0.1.8/0.1.9 range), tesseract 5.3.4 with tessdata_fast 4.1.0 eng/osd (production Dockerfile uses the same models; its Debian tesseract binary version was not checked).

## Expected versus observed

| Item | Expected from code reading | Observed |
| --- | --- | --- |
| .env, .env.example, id_ed25519 | Skipped by name | Skipped, "may contain credentials, not converted" |
| config/settings.local.yaml (fake key) | Converted (name not matched) | Converted, key lines in combined.md |
| .git, .venv, node_modules, build, dist, __pycache__, .pytest_cache | Listed, not converted | Same |
| logs/*.log, data/*.csv, tmp/*.txt | Converted | Converted (CSV as Markdown table) |
| assets/demo-recording.mp4 (256 KiB random) | Binary skip | "binary file" |
| docs/screenshot-checkout.png | Local fallback: listed, not recognized. Production: OCR work item | Local: "image text recognition needs direct upload". OCR code on the same file returned its text |
| backup ZIP (nested) | One level opened and converted | Converted, including settings.old.yaml with the older fake key |

## Limits of this evidence

- Not a live production conversion: no upload, Storage, queue, deadlines or deployed workers. Production would additionally run the PNG through the OCR pool.
- One toy project. Word counts are this fixture's only. No general savings claim follows.
