# M07 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-CODE-FORMATS | `frontend/lib/formats.js` | Repository code | Limits, extensions, validateUpload messages | C01, C02 |
| S-CODE-QUEUE | `frontend/lib/models/queueModel.js` | Repository code | planAddFiles, statuses | C03 to C05 |
| S-CODE-VM | `frontend/viewmodels/useConverterViewModel.js` | Repository code | CONCURRENCY = 2, convertAll, profile at job start, retry, notice text | C06, C07, C11 |
| S-CODE-UI | `frontend/components/converter/QueueRail.js`, `ExportActions.js` | Repository code | Button and link labels, export scopes | C09, C10 |
| S-CODE-NORMAL | `backendN/app/converter.py` | Repository code | Extension mismatch rejection message | C08 |
| S-PRIVACY | `frontend/lib/legal/policies.js` (/privacy) | Policy text | 48-hour default retention | C12 |
| F-M07 | fixtures/ (README.md) | Original fixture, LOCAL CODE-LEVEL RUN | queue-plan.json; out/*/run.json | C04, C05, C08 |
