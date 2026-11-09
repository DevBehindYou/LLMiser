# M02-S2 research: verify-ocr-numbers

Researched 2026-11-09. Same access limits as M01 (named search engines blocked from this environment; no keyword tool, metrics UNMEASURED). SERP capture PENDING (R05).

Reader question: how to verify digits and labels without trusting fluent recognized text. Parent M02 owns the nine-check list (it already reports the M02 invoice's O-to-zero misread and the missing Qty column). This support adds a dedicated, field-level procedure with a new 24-field fixture in four copies, an exact-versus-digits-only comparison and a correction log.

Background (not cited in the article, house rule against naming engines): OCR research and engine documentation describe confusion between visually similar glyphs (O/0, l/1/I) and the loss of punctuation as common character-level errors; the M02 research ledger holds those reads (SRC-OCR-RESEARCH).

Product facts (backendO/app/converter.py, read at 9b3ed09): English only (OCR_LANG eng); text rebuilt line by line from word boxes, so values stay on their label's line when found; mean word confidence and word count are logged only; orientation check only below 75 mean confidence or under 3 words; warnings only auto-rotated-N and first-frame-only. Editing: the reader lets users edit converted Markdown before copy or download, and recent sessions store the conversion, not later edits (verified for M09).

Boundary: no financial recommendation; character fidelity on one page, not accuracy rates.
