# M02-S1 fixture record

Input: M02 synthetic invoice `../../ocr-checks-before-ai/fixtures/invoice-clean.png` (SHA-256 47029fb8...). `rotation_runs.py` creates seven variants in memory (0, 90, 180, 270 degrees; 3 and 8 degree tilt; JPEG stored rotated with EXIF Orientation 6) and runs each through backendO `OcrConverter`, capturing the `mdify.ocr` orientation log. Input hashes per variant are in `rotation-results.json`. Tilted outputs saved as `skew-3.txt` and `skew-8.txt`.

Run 2026-11-09, LOCAL CODE-LEVEL RUN, tesseract 5.3.4, tessdata_fast 4.1.0 eng/osd.

| Variant | OSD ran | Applied | Mean conf | Similarity to upright | Notes |
| --- | --- | --- | --- | --- | --- |
| upright 0 | no | 0 | 94.5 | 1.000 | reference (Qty column missing, as in M02) |
| rotated 90 cw | no | 0 | 94.6 | 0.986 | read correctly without correction |
| rotated 180 | yes (180) | 180 | 94.5 | 1.000 | warning auto-rotated-180 |
| rotated 270 cw | yes (90) | 90 | 94.5 | 1.000 | warning auto-rotated-90 |
| skew 3 | no | 0 | 93.9 | 0.879 | C0O1-7781 read as C001-7781 |
| skew 8 | no | 0 | 77.3 | 0.274 | one line returned; 1.5% read as 15% |
| EXIF orientation 6 | no | 0 | 94.5 | 1.000 | tag applied before reading |

Limits: one clean synthetic page; production binary version not checked; whether warning codes are shown in the UI was not verified, so the article does not claim it.
