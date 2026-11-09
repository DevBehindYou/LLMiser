# M04-S3 fixture record

**Synthetic only.** Invented policy, reviewers and dates; every change is harmless. Generator: `make_policy.py` (python-docx 1.2; tracked changes written as w:ins and w:del, hidden text as w:vanish, comments with python-docx's comment API). Expected text per view and hashes: `views.json`. Comparison: `compare_views.py` writes `view-results.json`.

| File | SHA-256 (prefix) | Content |
| --- | --- | --- |
| leave-draft.docx | f9f9ada185373f9e | C1 replacement 5 to 10 days (comment: approved by HR on 2 Nov); C2 inserted "Unused days expire on 31 March." (comment: pending legal review); C3 deleted "Managers may approve exceptions." (pending); H1 hidden run "Internal: figures not final." |
| leave-shared.docx | ae4274662ade00a8 | Reviewed sharing copy: C1 accepted, C2 and C3 rejected, legal-review note written as a sentence, hidden run removed, no comments |

## Runs (2026-11-09T08:27Z, revision 1b6634b, application code identical to 8eb8c509)

`scripts/campaign/llmiser_local.py doc leave-{draft,shared}.docx out-{...}`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter (DOCX path), markitdown 0.1.9, Standard profile.

## Expected versus observed

| Output | Expected if the file were shared as decided | Observed |
| --- | --- | --- |
| draft | decided reading | every-change-accepted reading plus the hidden line: "...10 days of leave into the next year. Unused days expire on 31 March." / "Requests go through the HR portal. Internal: figures not final."; "Managers may approve exceptions." absent; no comment text |
| shared | decided reading | exact match, four paragraphs |

## Limits

One synthetic draft from python-docx, not saved by Word. Moved text, formatting changes, comment replies and Word's stored view settings were not tested. Not a live production conversion.
