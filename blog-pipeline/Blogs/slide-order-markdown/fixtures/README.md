# M05-S3 fixture record

**Synthetic only.** Invented error code and procedure. Generator: `make_flow.py` (python-pptx default template; PowerPoint sections written as a p14:sectionLst extension). Hashes: `flow-files.json`.

| File | SHA-256 (prefix) | Content |
| --- | --- | --- |
| flow-original.pptx | 6294f952a2865865 | Sections Diagnosis (slides 1 to 5) and Resolution (slide 6); slide 2 Section Header "Diagnosis"; slides 3 and 5 with "Step N of 3" text boxes at 0.1 in, above the title; slides 3 and 4 both titled "Symptoms"; slide 6 on the Blank layout with a 40 pt "Fix" text box and "As the previous slide shows..." |
| flow-reviewed-first-attempt.pptx | 22bb122142c1d7c6 | First reviewed version: divider description typed into the Section Header text placeholder |
| flow-reviewed.pptx | b85aec0025272e2f | Unique titles carrying the step, title placeholders everywhere, divider description in the title, backward reference written out |

## Runs (2026-11-09T08:39Z, revision d2834c4, application code identical to 8eb8c509)

`llmiser_local.py doc` for all three files and `llmiser_local.py profiles flow-original.pptx out-profiles`: LOCAL CODE-LEVEL RUNS, markitdown 0.1.9.

## Expected versus observed

| Item | Expected for a reader | Original | Reviewed |
| --- | --- | --- | --- |
| Slide order | 1 to 6 | 1 to 6 with slide number comments | same |
| Section names | Diagnosis, Resolution | "Resolution" absent; "Diagnosis" only as slide 2's title | absent; divider title states the purpose |
| Step labels | with their slide's title | printed before the `#` heading (end of the previous slide's section) | inside the titles |
| Slide 4 title | distinct from slide 3 | `# Symptoms` twice | `# Step 1, continued: Mobile app only` |
| Slide 6 title | a heading | no heading; "Fix" plain line, content under `# Cause` for heading-based reading | `# Step 3: Fix` |
| Backward reference | understandable alone | "As the previous slide shows" | "Because the token expires early (step 2)" |
| Divider description (first attempt) | under its heading | printed above `# Diagnosis: steps 1 and 2` | n/a |
| RAG-ready profile | chunk per slide | 0 chunk-boundary markers (slide titles are `# `) | not run |

Code: the PPTX converter sorts a slide's shapes by (top, left) and writes `# ` only for the title placeholder. Layout geometry in the default template: Section Header text placeholder at 3.18 in, title at 4.82 in.

## Limits

One synthetic deck from python-pptx's default layouts; other templates place placeholders differently. Not a live production conversion.
