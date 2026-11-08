# Project Conversion: invoice-tool-original.zip

## Summary

- Files found: 35
- Converted: 21
- Text recognised in images: 0
- Skipped: 14
- Failed: 0

## Tree

```text
└── invoice-tool/
    ├── .git/
    │   ├── config
    │   └── HEAD
    ├── .pytest_cache/
    │   └── v/
    │       └── cache/
    │           └── lastfailed
    ├── .venv/
    │   └── lib/
    │       └── python3.12/
    │           └── site-packages/
    │               └── babel/
    │                   └── __init__.py
    ├── assets/
    │   └── demo-recording.mp4
    ├── backup/
    │   └── invoice-tool-2026-09.zip/
    │       └── invoice-tool/
    │           ├── config/
    │           │   └── settings.old.yaml
    │           └── src/
    │               └── invoice/
    │                   └── totals.py
    ├── build/
    │   └── lib/
    │       └── invoice/
    │           └── totals.py
    ├── config/
    │   ├── app.yaml
    │   └── settings.local.yaml
    ├── data/
    │   └── customers-export.csv
    ├── dist/
    │   └── invoice_tool-0.3.0-py3-none-any.whl
    ├── docs/
    │   └── screenshot-checkout.png
    ├── logs/
    │   └── app-2026-11-02.log
    ├── src/
    │   └── invoice/
    │       ├── __pycache__/
    │       │   └── totals.cpython-312.pyc
    │       ├── __init__.py
    │       ├── cli.py
    │       ├── totals (copy).py
    │       ├── totals.py
    │       └── totals_old.py
    ├── tests/
    │   └── test_totals.py
    ├── tmp/
    │   └── debug-notes.txt
    ├── web/
    │   ├── node_modules/
    │   │   └── left-pad/
    │   │       ├── index.js
    │   │       └── package.json
    │   ├── src/
    │   │   └── app.js
    │   ├── package-lock.json
    │   └── package.json
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── id_ed25519
    ├── pyproject.toml
    ├── README.md
    └── requirements.lock
```

## Results

| Path | Type | Status | Engine |
|---|---|---|---|
| `invoice-tool/.env` | Sensitive | Skipped |  |
| `invoice-tool/.env.example` | Sensitive | Skipped |  |
| `invoice-tool/.git/config` | File | Skipped |  |
| `invoice-tool/.git/HEAD` | File | Skipped |  |
| `invoice-tool/.gitignore` | Code | Converted | Direct |
| `invoice-tool/.pytest_cache/v/cache/lastfailed` | File | Skipped |  |
| `invoice-tool/.venv/lib/python3.12/site-packages/babel/__init__.py` | File | Skipped |  |
| `invoice-tool/assets/demo-recording.mp4` | Binary | Skipped |  |
| `invoice-tool/backup/invoice-tool-2026-09.zip` | ZIP | Converted | Archive |
| `invoice-tool/backup/invoice-tool-2026-09.zip/invoice-tool/config/settings.old.yaml` | Code | Converted | Direct |
| `invoice-tool/backup/invoice-tool-2026-09.zip/invoice-tool/src/invoice/totals.py` | Code | Converted | Direct |
| `invoice-tool/build/lib/invoice/totals.py` | File | Skipped |  |
| `invoice-tool/config/app.yaml` | Code | Converted | Direct |
| `invoice-tool/config/settings.local.yaml` | Code | Converted | Direct |
| `invoice-tool/data/customers-export.csv` | Document | Converted | MarkItDown |
| `invoice-tool/dist/invoice_tool-0.3.0-py3-none-any.whl` | File | Skipped |  |
| `invoice-tool/docs/screenshot-checkout.png` | Image | Skipped |  |
| `invoice-tool/id_ed25519` | Sensitive | Skipped |  |
| `invoice-tool/logs/app-2026-11-02.log` | Text | Converted | Direct |
| `invoice-tool/pyproject.toml` | Code | Converted | Direct |
| `invoice-tool/README.md` | Text | Converted | Direct |
| `invoice-tool/requirements.lock` | Code | Converted | Direct |
| `invoice-tool/src/invoice/__init__.py` | Code | Converted | Direct |
| `invoice-tool/src/invoice/__pycache__/totals.cpython-312.pyc` | File | Skipped |  |
| `invoice-tool/src/invoice/cli.py` | Code | Converted | Direct |
| `invoice-tool/src/invoice/totals (copy).py` | Code | Converted | Direct |
| `invoice-tool/src/invoice/totals.py` | Code | Converted | Direct |
| `invoice-tool/src/invoice/totals_old.py` | Code | Converted | Direct |
| `invoice-tool/tests/test_totals.py` | Code | Converted | Direct |
| `invoice-tool/tmp/debug-notes.txt` | Text | Converted | Direct |
| `invoice-tool/web/node_modules/left-pad/index.js` | File | Skipped |  |
| `invoice-tool/web/node_modules/left-pad/package.json` | File | Skipped |  |
| `invoice-tool/web/package-lock.json` | Code | Converted | Direct |
| `invoice-tool/web/package.json` | Code | Converted | Direct |
| `invoice-tool/web/src/app.js` | Code | Converted | Direct |

## Skipped and failed

| Path | Reason |
|---|---|
| `invoice-tool/.env` | may contain credentials, not converted |
| `invoice-tool/.env.example` | may contain credentials, not converted |
| `invoice-tool/.git/config` | dependency or build folder (smart project mode) |
| `invoice-tool/.git/HEAD` | dependency or build folder (smart project mode) |
| `invoice-tool/.pytest_cache/v/cache/lastfailed` | dependency or build folder (smart project mode) |
| `invoice-tool/.venv/lib/python3.12/site-packages/babel/__init__.py` | dependency or build folder (smart project mode) |
| `invoice-tool/assets/demo-recording.mp4` | binary file |
| `invoice-tool/build/lib/invoice/totals.py` | dependency or build folder (smart project mode) |
| `invoice-tool/dist/invoice_tool-0.3.0-py3-none-any.whl` | dependency or build folder (smart project mode) |
| `invoice-tool/docs/screenshot-checkout.png` | image text recognition needs direct upload |
| `invoice-tool/id_ed25519` | may contain credentials, not converted |
| `invoice-tool/src/invoice/__pycache__/totals.cpython-312.pyc` | dependency or build folder (smart project mode) |
| `invoice-tool/web/node_modules/left-pad/index.js` | dependency or build folder (smart project mode) |
| `invoice-tool/web/node_modules/left-pad/package.json` | dependency or build folder (smart project mode) |
