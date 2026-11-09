# M05-S2 fixture record

**Synthetic only.** Invented churn, signup and revenue figures. Generator: `make_charts.py` (python-pptx native charts). Hashes: `chart-files.json`. Slide display: `render/` (LibreOffice PDF export of charts-original.pptx and PNG renders, for the "on the slide" column only).

| File | Content |
| --- | --- |
| charts-original.pptx | 1 Churn line chart, values 0.042/0.051/0.078 formatted 0.0%; 2 Plan vs actual line chart, value axis minimum 4.0; 3 Pie, values 45/30/25, labels show category and percentage; 4 Column chart, values 125000/131500/162250 formatted "$"#,##0, axis title Revenue (USD) |
| charts-label-trap.pptx | Units in chart and series titles plus a takeaway text box on each slide; churn values still 0.042 under series "Churn rate (%)" |
| charts-reviewed.pptx | As label-trap, churn values stored as 4.2/5.1/7.8 with format 0.0"%" |

## Runs (2026-11-09, revision 44584ce, application code identical to 8eb8c509)

`llmiser_local.py doc charts-{original,label-trap,reviewed}.pptx out-{...}`: LOCAL CODE-LEVEL RUNS, markitdown 0.1.9, Standard profile.

## Expected (slide display) versus observed (converted text)

| Chart | Slide shows (LibreOffice render) | Original output | Reviewed output |
| --- | --- | --- | --- |
| Churn | 4.2%, 5.1%, 7.8% | `### Chart: Churn`, 0.042, 0.051, 0.078 under "Churn" | takeaway sentence; 4.2, 5.1, 7.8 under "Churn rate (%)" (label-trap: 0.042 under "Churn rate (%)") |
| Plan vs actual | axis from 4 to 8, legend Plan, Actual | `### Chart: Signups`, Plan and Actual columns, values only | units in headers, takeaway "7.8k against 6.0k" |
| Revenue share | North 45%, South 30%, West 25% labels | 45.0, 30.0, 25.0 under "Revenue" | "Share of revenue (%)" header, takeaway |
| Quarterly revenue | $125,000 ... and axis title Revenue (USD) | 125000.0, 131500.0, 162250.0 under "Revenue"; axis title absent | "Revenue (USD)" header, takeaway "$162,250, up 23% on Q2" |

## Limits

One synthetic deck built with python-pptx, not saved by PowerPoint. Slide display rendered with LibreOffice. Not a live production conversion.
