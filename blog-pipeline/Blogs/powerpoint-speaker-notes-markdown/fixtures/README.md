# M05-S1 fixture record

**Synthetic only.** Invented prices and dates. Generator: `make_deck.py` (python-pptx default template; PDFs exported with LibreOffice Impress headless). Hashes and slide 2 notes text: `deck-files.json`.

| File | SHA-256 (prefix) | Content |
| --- | --- | --- |
| pricing-update.pptx | dea375e7da4b4715 | 4 slides: notes on slide 2 (3 paragraphs, last two at indent level 1), none on slide 3, spaces only on slide 4 |
| pricing-update-reviewed.pptx | 03386c32a7ce24d9 | Caveat and start date moved onto slide 2, shorter note; source note on slide 3 |
| pricing-update.pdf | 154122b33b3de84e | Slides-only PDF export (LibreOffice default) |
| pricing-update-notes-pages.pdf | 520bfda97ddda643 | Notes-pages PDF export (ExportOnlyNotesPages) |

## Runs (2026-11-09T08:31Z, revision 525c026, application code identical to 8eb8c509)

`llmiser_local.py doc` for both .pptx files and `llmiser_local.py pdf` for both PDFs (single-pass path, no scanned pages): LOCAL CODE-LEVEL RUNS, markitdown 0.1.9, Standard profile.

## Expected versus observed

| Route | Expected for full notes coverage | Observed |
| --- | --- | --- |
| .pptx | slide 2 notes under slide 2, labeled | `### Notes:` with three lines; level-1 indent dropped; no section for slide 3 or slide 4 (spaces only) |
| slides-only PDF | notes present | no notes, no slide markers, titles as plain lines, first title split over two lines |
| notes-pages PDF | notes present and labeled | notes text present, unlabeled, one sentence split by wrapping, page numbers "2" and "4" as stray lines |
| reviewed .pptx | caveat visible on slide | caveat and start date as slide bullets; short note retained |

Code: the PPTX converter appends `### Notes:` plus the notes placeholder text only when that text is not blank.

## Limits

PDFs were exported with LibreOffice Impress, not PowerPoint. Notes typed in other shapes on the notes page were not tested. Not a live production conversion.
