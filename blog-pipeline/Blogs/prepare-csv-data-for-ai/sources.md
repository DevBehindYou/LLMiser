# M06 source ledger

| ID | Source | Type | Checked passage or evidence | Used for |
| --- | --- | --- | --- | --- |
| S-RFC4180 | [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180) (campaign SRC-CSV), informational | Specification | Rules 3, 6 and 7 as quoted in research.md | C04, C08, C11 |
| S-PY-CSV | [Python csv module](https://docs.python.org/3/library/csv.html) | Official documentation (background, not linked) | Default excel dialect | C01 background |
| S-CODE-CSV | `backendN/app/csv_converter.py` | Repository code | csv.reader default, header and padding logic, charset detection, BOM strip | C01, C02 |
| S-CODE-FORMATS | `frontend/lib/formats.js` | Repository code | csv, tsv accepted; 15 MB | C13 |
| F-M06 | fixtures/ (README.md), local runs 2026-11-08 | Original fixture, LOCAL CODE-LEVEL RUN | out-*/ | C03 to C12 |
| F-M03 | ../excel-data-checks-for-ai/fixtures/probe-text-ids | Original fixture | CSV kept 00123 and 02134 | C09 |
