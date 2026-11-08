# M08 visual ledger

Private render (inspectSvg clean). Preview inspected dark and light at 375px; geometry 0 issues on 5 SVGs.

| File | Kind | Data source | Review notes |
| --- | --- | --- | --- |
| banner.svg | Banner | Profile comparison | Illustration |
| profile-diff.svg | Comparison table | fixtures/out, run.json | Clean |
| compact-table.svg | Exact output excerpt | Standard and Compact outputs | First render showed "---" as one long dash: JetBrains Mono ligatures. Renderer now disables 'calt' and 'liga' for mono text (all campaign figures re-rendered) |
| rag-markers.svg | Exact output excerpt | RAG-ready output | Same ligature issue ("<!--" drawn as an arrow) fixed by the renderer change; re-inspected |
| choose-profile.svg | Decision | Article guidance | Clean |
