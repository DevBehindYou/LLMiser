# Project Conversion: invoice-tool-sharing.zip

## Summary

- Files found: 13
- Converted: 12
- Text recognised in images: 0
- Skipped: 1
- Failed: 0

## Tree

```text
└── invoice-tool/
    ├── config/
    │   └── app.yaml
    ├── src/
    │   └── invoice/
    │       ├── __init__.py
    │       ├── cli.py
    │       └── totals.py
    ├── tests/
    │   └── test_totals.py
    ├── web/
    │   ├── src/
    │   │   └── app.js
    │   ├── package-lock.json
    │   └── package.json
    ├── .env.example
    ├── .gitignore
    ├── pyproject.toml
    ├── README.md
    └── requirements.lock
```

## Results

| Path | Type | Status | Engine |
|---|---|---|---|
| `invoice-tool/.env.example` | Sensitive | Skipped |  |
| `invoice-tool/.gitignore` | Code | Converted | Direct |
| `invoice-tool/config/app.yaml` | Code | Converted | Direct |
| `invoice-tool/pyproject.toml` | Code | Converted | Direct |
| `invoice-tool/README.md` | Text | Converted | Direct |
| `invoice-tool/requirements.lock` | Code | Converted | Direct |
| `invoice-tool/src/invoice/__init__.py` | Code | Converted | Direct |
| `invoice-tool/src/invoice/cli.py` | Code | Converted | Direct |
| `invoice-tool/src/invoice/totals.py` | Code | Converted | Direct |
| `invoice-tool/tests/test_totals.py` | Code | Converted | Direct |
| `invoice-tool/web/package-lock.json` | Code | Converted | Direct |
| `invoice-tool/web/package.json` | Code | Converted | Direct |
| `invoice-tool/web/src/app.js` | Code | Converted | Direct |

## Skipped and failed

| Path | Reason |
|---|---|
| `invoice-tool/.env.example` | may contain credentials, not converted |
