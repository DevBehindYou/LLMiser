# M02-S3 research: mixed-pdf-ocr-coverage

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05).

Reader question: how to confirm every page of a PDF that mixes text and scanned pages is represented. Parent M02 owns the nine-check list and already reports the three-page fixture (blank last page notice, page 2 label). This support adds the page inventory method and an eight-page packet with the classification edge cases the code implies.

Product facts (backendN/app/pdf_tasks.py at 2570dc6): `PageInfo.kind` scan if chars < 20 and image coverage >= 0.3; empty if chars 0 and coverage < 0.05; otherwise native. `page_runs` joins consecutive native and empty pages into one run; each scan is its own unit. `merge` labels OCR pages `<!-- page N: text recognition -->`, adds a warning line for an OCR page with no text and lists scans past MAX_OCR_PAGES (100). A PDF with no scans takes the single-pass path. NormalConverter returns "_No extractable text found in this document._" for an empty run (M02 observation).

Boundary: no page-routing guarantee beyond the observed run and the current code; recognition accuracy left to M02-S2; orientation to M02-S1.
