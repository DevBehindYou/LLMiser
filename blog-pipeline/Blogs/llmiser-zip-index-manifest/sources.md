# M10 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-ZIP-README | `backendZ/README.md` | Repository documentation | Three outputs, parts above 4 MB, limits, safety rules | C01, C02, C06 |
| S-CODE-ARCHIVE | `backendZ/app/archive.py`, `archive_tasks.py` | Repository code | normalize, casefold duplicates, project_index, manifest fields, nested depth | C03 to C09 |
| S-CODE-OUTPUTS | `frontend/components/converter/ResultOutputs.js` | Repository code | Original output files list and note | C01, C10, FAQ 6 |
| S-PRIVACY | `frontend/lib/legal/policies.js` | Policy | 48-hour default deletion | FAQ 6 |
| F-M10 | fixtures/ | LOCAL CODE-LEVEL RUN (Storage-path emulation with OCR) | out/PROJECT_INDEX.md, manifest.json, combined.md | C04 to C09 |
