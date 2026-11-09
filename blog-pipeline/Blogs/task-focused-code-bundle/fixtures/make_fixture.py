#!/usr/bin/env python3
"""M01-S3 synthetic fixture: one bug, three bundles.

Toy library-fines project (invented). The bug: business_days_between()
excludes the return day, so a book due Friday and returned Monday owes 0.00
instead of 0.25. The question names a failing test; the bundle must contain
the test, its caller, the helper and the config the caller reads.

  trace_imports() follows "from fines.x import" statements from the failing
  test through src/, which is how the traced bundle is chosen.

Writes repo/ (the full project), bundle-incomplete/, bundle-traced/ and a
ZIP of each, plus bundles.json.
"""

from __future__ import annotations

import ast
import hashlib
import io
import json
import shutil
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAMP = (2026, 11, 9, 12, 0, 0)

FILES = {
    "pyproject.toml": "[project]\nname = \"library-fines\"\nversion = \"0.2.0\"\n",
    "src/fines/__init__.py": "",
    "src/fines/config.py": "RATE_PER_DAY = 0.25\nHOLIDAYS = []\n",
    "src/fines/calendar.py": (
        "import datetime as dt\n\n\n"
        "def business_days_between(start: dt.date, end: dt.date, holidays=()) -> int:\n"
        "    \"\"\"Business days after start, up to and including end.\"\"\"\n"
        "    days, day = 0, start\n"
        "    while day < end - dt.timedelta(days=1):  # BUG: stops one day early\n"
        "        day += dt.timedelta(days=1)\n"
        "        if day.weekday() < 5 and day not in holidays:\n"
        "            days += 1\n"
        "    return days\n"
    ),
    "src/fines/fines.py": (
        "from fines.calendar import business_days_between\n"
        "from fines.config import HOLIDAYS, RATE_PER_DAY\n\n\n"
        "def late_fee(due, returned):\n"
        "    if returned <= due:\n"
        "        return 0.0\n"
        "    return round(business_days_between(due, returned, HOLIDAYS) * RATE_PER_DAY, 2)\n"
    ),
    "src/fines/report.py": "def monthly_report(rows):\n    return f\"{len(rows)} fines this month\"\n",
    "src/fines/emailer.py": "def reminder(email):\n    return f\"Reminder sent to {email}\"\n",
    "tests/test_fines.py": (
        "import datetime as dt\n\nfrom fines.fines import late_fee\n\n\n"
        "def test_friday_due_monday_return():\n"
        "    # Due Friday 6 Nov 2026, returned Monday 9 Nov: one business day late.\n"
        "    assert late_fee(dt.date(2026, 11, 6), dt.date(2026, 11, 9)) == 0.25\n"
    ),
    "tests/test_report.py": "from fines.report import monthly_report\n\n\ndef test_report():\n    assert monthly_report([1, 2]) == '2 fines this month'\n",
    "docs/history.md": "# History\n\n" + "Notes from earlier releases.\n" * 40,
}


def trace_imports(start: str) -> list[str]:
    """Files reachable from `start` through `from fines.x import` statements."""
    seen, todo = set(), [start]
    while todo:
        path = todo.pop()
        if path in seen:
            continue
        seen.add(path)
        for node in ast.walk(ast.parse(FILES[path])):
            if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("fines."):
                todo.append("src/" + node.module.replace(".", "/") + ".py")
    return sorted(seen)


def write_tree(root: Path, names) -> None:
    if root.exists():
        shutil.rmtree(root)
    for name in names:
        p = root / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(FILES[name])


def zbytes(names) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in sorted(names):
            info = zipfile.ZipInfo("library-fines/" + name, STAMP)
            info.external_attr = 0o644 << 16
            zf.writestr(info, FILES[name])
    return buf.getvalue()


def main() -> None:
    traced = trace_imports("tests/test_fines.py") + ["pyproject.toml", "src/fines/__init__.py"]
    bundles = {
        "repo": sorted(FILES),
        "bundle-incomplete": ["tests/test_fines.py", "src/fines/fines.py", "src/fines/__init__.py", "pyproject.toml"],
        "bundle-traced": sorted(set(traced)),
    }
    record = {}
    for name, names in bundles.items():
        write_tree(HERE / name, names)
        data = zbytes(names)
        (HERE / f"{name}.zip").write_bytes(data)
        record[name] = {"files": names, "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "bundles.json").write_text(json.dumps({"label": "Synthetic library-fines project", "traced_from": "tests/test_fines.py", "bundles": record}, indent=2) + "\n")
    print(json.dumps({k: len(v["files"]) for k, v in record.items()}))


if __name__ == "__main__":
    main()
