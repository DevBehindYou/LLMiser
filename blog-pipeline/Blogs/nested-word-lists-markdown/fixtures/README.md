# M04-S2 fixture record

**Synthetic only.** Invented procedure text. Generator: `make_lists.py` (python-docx 1.2 default template plus numbering XML written directly: abstractNum 90 = decimal / lowerLetter / bullet, abstractNum 93 = decimal / bullet; numId 91 and 92 restart at 1). Hashes: `steps-files.json`. Displayed numbering: `wp-render/*.pdf` (LibreOffice headless export, text extracted with pypdfium2).

| File | SHA-256 (prefix) | Content |
| --- | --- | --- |
| steps-original.docx | 3a79d8b77f6406c0 | Part A real multilevel list with a Normal note between steps 2 and 3 (same list continues); Part B new list restarting at 1; Part C List Number items with List Bullet 2 children |
| steps-reviewed.docx | 93da0c22a06b6ac1 | Note folded into step 2; Part C rebuilt as one list (numbered level 0, bullet level 1) |
| steps-skip-level.docx | 867e6ce575284a99 | Part C as one list with bullets placed at level 2 directly under a level 0 item |

## Runs (2026-11-09T08:23Z, revision b8406d3, application code identical to 8eb8c509)

`scripts/campaign/llmiser_local.py doc steps-{original,reviewed,skip-level}.docx out-{...}`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter (DOCX path), markitdown 0.1.9, Standard profile.

## Expected (displayed) versus observed (Markdown)

| Item | Displayed by LibreOffice | Original Markdown | Reviewed Markdown |
| --- | --- | --- | --- |
| Pack the device | 1. | `1.` | `1.` |
| Remove the SIM card, Wipe personal files | a., b. under 1 | `1.`, `2.` indented under 1 | same |
| Photos, Downloads | bullets under b | `*` indented under item 2 of the sub-list | same |
| Print the return label | 2. | `2.` | `2. Print the return label. Labels expire after 7 days.` |
| Note | paragraph | paragraph | folded into step 2 |
| Drop off the parcel | 3. | `1.` (new list) | `3.` |
| Check the confirmation email, Keep the receipt | 1., 2. (restart intended) | `1.`, `2.` | same |
| Final-sale items | 1. | `1.` | `1.` |
| Clearance labels, Opened bundles | bullets under item 1 | top-level `*` between two lists | `*` indented under item 1 |
| Gift cards | 2. | `1.` | `2.` |
| skip-level file | bullets under item 1 | `   * + Clearance labels` / `     + Opened bundles` | n/a |

## Limits

Expected numbering comes from LibreOffice's display, not Microsoft Word. The documents were built with python-docx, not saved by Word. Not a live production conversion.
