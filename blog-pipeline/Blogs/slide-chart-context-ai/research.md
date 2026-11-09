# M05-S2 research: slide-chart-context-ai

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05). No external source was needed for the claims; all are local runs or code reads.

Reader question: what chart information must accompany a text-only slide export. Parent M05 reports one chart's title and values surviving and the axis title and trend lost. This support isolates four formatting-borne contexts (percent format, truncated axis, pie percentages, currency format and axis title), tests the fix, and records the mislabel trap found while fixing.

Product facts: the markitdown PPTX converter writes `### Chart: {title}` and a table of categories by series from the chart's stored data; number formats, axis titles, axis scaling and data labels are not read (observed). Pictures in slides contribute alt text only (M05 fixture).

Boundary: no claim about how models read charts; the advice is to put context in text and send images when shape is the evidence.
