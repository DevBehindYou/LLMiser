# M02 outline (final, as drafted 2026-11-08)

Title (owner-selected, exact): 9 OCR Checks Before You Send Scanned Text to AI
Angle: fluent recognized text can still be wrong; nine checks tested on synthetic pages run through LLMiser's recognition code.
Listicle count: 9 numbered H2 sections.

1. TL;DR
2. Intro (83 words)
3. H2 What we tested: five synthetic files, figure nine-checks, local-run label, E08 link
4. H2 1. Text is actually present: signals, misleading blank-page line
5. H2 2. Page coverage and order: page labels only on recognized pages, 100-page limit, landmark method
6. H2 3. Rotation and orientation: weak-read rule, 90-degree sample result, no assumption either way
7. H2 4. Small or blurred text: clean versus degraded terms line, upscale and 200 dpi facts
8. H2 5. Numbers and decimal marks: 40. 50, arithmetic cross-check
9. H2 6. Dates and identifiers: PO 10O5-B to 1005-B, L5 to LS, ambiguous date
10. H2 7. Columns and reading order: two-column correct, degraded labels separated
11. H2 8. Table labels and values: dropped Qty column, figure field-comparison, rebuild or convert source
12. H2 9. Manual comparison with the original: figure verify-decision, field list, [unreadable in scan], figure final-checklist, English-only limit, /usecase
13. FAQ (6): automatic fixes, which pages were scanned, missing column, accuracy for AI, handwriting and languages, page limits
14. CTA

## Scope exclusions

- No PDF cost or token comparison (E06, E07).
- Rotation experiments (0, 90, 180, slight skew) in depth: M02-S1.
- Field-by-field correction log procedure: M02-S2.
- Page-type inventory of a mixed PDF: M02-S3.
- No vendor comparisons or accuracy percentages.
