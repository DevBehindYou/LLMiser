# M08 source ledger

| ID | Source | Type | Checked passage or evidence | Used for |
| --- | --- | --- | --- | --- |
| S-GFM | [GFM spec, tables](https://github.github.com/gfm/#tables-extension-) | Specification | "The delimiter row consists of cells whose only content are hyphens" | C06 |
| S-COMMONMARK | [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) (campaign SRC-MARKDOWN) | Specification | "The content of a code fence is treated as literal text" | C09 |
| S-CODE-PROFILES | `backendN/app/common/profiles.py` | Repository code | ensure_title, source line, Clean, Compact, RAG-ready rules | C02 to C10 |
| S-CODE-QUEUE | `frontend/lib/models/queueModel.js`, `viewmodels/useConverterViewModel.js` | Repository code | selectConvertible (pending or error only), profile per job | FAQ 5 |
| F-M08 | fixtures/ | Original fixture, LOCAL CODE-LEVEL RUN | out/*, run.json | C03 to C10 |
