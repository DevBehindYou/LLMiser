# M02-S1 research: rotated-scan-ocr-check

Researched 2026-11-09. Same access limits as M01; no separate SERP capture (PENDING, R05). Background (not cited, house rule against naming engines): the OCR engine's own quality guide says line segmentation degrades significantly on skewed pages and recommends rotating so text lines are horizontal (read 2026-11-08 for M02).

Product facts (backendO/app/converter.py): EXIF transpose; orientation check only when mean confidence < 75 or < 3 words; OSD proposal or 90/180/270 candidates; keep only if confidence improves by more than 5 and word count holds; warning codes auto-rotated-N.

Boundary: M02 owns the nine-check list; this support answers how orientation affected one specific sample, with measured runs.
