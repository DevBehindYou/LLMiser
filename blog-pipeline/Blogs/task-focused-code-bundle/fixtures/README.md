# M01-S3 fixture record

**Synthetic.** Toy "library-fines" Python project (invented). `make_fixture.py` writes repo/, bundle-incomplete/, bundle-traced/ and a ZIP of each; file lists and hashes in `bundles.json`. The traced bundle comes from `trace_imports("tests/test_fines.py")` (Python ast, project-package imports only) plus pyproject.toml and the package `__init__.py`.

Runs 2026-11-09 (Python 3.13, pytest 8.3.3, `PYTHONPATH=src python -m pytest -q -p no:cacheprovider tests/test_fines.py`):

| Bundle | Files | Result |
| --- | --- | --- |
| bundle-incomplete | 4 | Collection error: ModuleNotFoundError: No module named 'fines.calendar' |
| bundle-traced | 6 | FAILED: assert 0.0 == 0.25 |
| repo | 10 | FAILED: assert 0.0 == 0.25 |

LLMiser archive conversion (local code-level): bundle-traced 164 words, repo 367 words (backend word count of combined.md).
