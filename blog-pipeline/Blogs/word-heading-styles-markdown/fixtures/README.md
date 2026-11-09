# M04-S1 fixture record

**Synthetic only.** Invented company and onboarding text. Generator: `make_guide.py` (python-docx 1.2 default template). Blocks and hashes: `guide-files.json`.

| File | SHA-256 (prefix) | Content |
| --- | --- | --- |
| guide-original.docx | see guide-files.json | Mixed habits: Title style, Heading 1 to 3, bold 16 pt Normal, custom "Section Heading" based on Heading 2, Normal with outline level 1, Heading 1 then Heading 3, a sentence in Heading 3, an empty Heading 2 |
| guide-reviewed.docx | see guide-files.json | Same text: Heading 1 title, Heading 2 sections, Heading 3 subsections, Normal body and sentence |

## Runs (2026-11-09, revision 2a91b82, application code identical to 8eb8c509)

`scripts/campaign/llmiser_local.py doc guide-{original,reviewed}.docx out-{...}`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter (DOCX path) and finalize_markdown, markitdown 0.1.9, Standard profile.

## Expected versus observed

| Formatting | Expected for a reader | Observed in Markdown |
| --- | --- | --- |
| Title style "Northwind Onboarding Guide" | top heading | plain paragraph; `# Guide Original` (from the file name) added above it by ensure_title |
| Heading 1 "Overview" | heading | `# Overview` |
| Heading 2 "Before your first day" | heading | `## Before your first day` |
| Bold 16 pt Normal "Accounts and access" | heading | `**Accounts and access**` |
| Custom "Section Heading" "Your first week" | heading | plain paragraph, no bold |
| Normal + outline level "Policies" | heading | plain paragraph |
| Heading 1 "Contacts" then Heading 3 "Helpdesk" | consecutive levels | `# Contacts`, `### Helpdesk` (skipped level carried over) |
| Heading 3 sentence "Badges must be worn at all times." | body text | `### Badges must be worn at all times.` |
| Empty Heading 2 | nothing | nothing |
| Reviewed copy | consistent outline | `# Northwind Onboarding Guide` first (no file-name title), all sections `##`, subsections `###`, sentence as text |

Code: the DOCX conversion's default style map turns Heading 1 to 6 (by style ID or name) into h1 to h6; other styles, including Title and custom styles, become paragraphs. `backendN/app/common/profiles.py` `ensure_title` keeps an opening `# ` line or adds `# {title from file name}`.

## Limits

One synthetic document from the python-docx default template, not a Word-saved file. Heading 4 to 6 mapping is code-read, not run. Not a live production conversion.
