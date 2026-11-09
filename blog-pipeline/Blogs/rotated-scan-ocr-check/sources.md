# M02-S1 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-CODE-OCR | `backendO/app/converter.py` | Repository code | `_prepare` EXIF transpose; `_recognize` orientation rule and thresholds | C01, C02, C06 |
| F-M02S1 | fixtures/rotation-results.json, skew-*.txt | LOCAL CODE-LEVEL RUN | Seven-variant table | C03 to C05 |
| S-TESS-QUALITY | tessdoc ImproveQuality (background only, not linked) | Engine documentation | Skew degrades line segmentation | Background |
