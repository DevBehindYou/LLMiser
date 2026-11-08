# M04 fixture record (shared with M04-S1, S2, S3)

**Synthetic only.** Invented refund policy. Generator: `make_fixture.py` (python-docx 1.2.0; the tracked replacement is written as raw w:del/w:ins XML; the comment uses python-docx's comment API).

| File | SHA-256 |
| --- | --- |
| refund-policy.docx | 9d23564c2845f05342263e38854692a9e167fb1eafcf50af37f150fab1a2d98a |

## Run (2026-11-08, local code-level run of backendN NormalConverter, markitdown 0.1.9)

Output: `out/refund-policy.Standard.md`.

| Feature in the DOCX | Observed in Markdown |
| --- | --- |
| Heading 1 / Heading 2 | `# Refund Policy (synthetic sample)`, `## Eligibility` and others |
| Bold 18 pt Normal "Exceptions" | `**Exceptions**` |
| List Number with List Bullet 2 children, then more List Number items | `1. Final-sale items`, `* Clearance labels`, `* Bundles opened in store` (no indent), then `1. Gift cards`, `2. Digital downloads` |
| List Number 2 steps | `1.`, `2.`, `3.` |
| Table with merged "Refund" header over two columns | Empty header row `\|  \|  \|  \|`, then `\| Item condition \| Refund \| \|` as data |
| Tracked replacement "14 days" deleted, "30 days" inserted, with comment | "within 30 days of delivery"; no deleted text, no marks, no comment |
| Image with descr alt text | `![Bar chart: refunds were highest in February.](data:image/png;base64...)` |
| Footer "CONFIDENTIAL draft v3, not for customers" | Absent |
| "As Figure 1 above shows" | Kept verbatim |

Limits: one generated document, not authored in Microsoft Word. Not a live production conversion.
