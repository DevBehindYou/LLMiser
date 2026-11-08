#!/usr/bin/env python3
"""Builds the synthetic M01 fixture: a toy "invoice-tool" repository.

Everything here is invented. Credentials are obvious FAKE placeholders that
match no provider format, e-mail addresses use the reserved example.com
domain and IP addresses come from the RFC 5737 documentation range. No real
project, customer or operator data is involved.

Outputs (deterministic: fixed timestamps, seeded bytes, sorted entries):
  invoice-tool-original.zip  the whole working folder, as someone might zip it
  invoice-tool-sharing.zip   the reviewed sharing copy for one task:
                             "fix the rounding bug in invoice totals"
  inventory.json             every path, its planted category and the decision
"""

from __future__ import annotations

import hashlib
import io
import json
import random
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAMP = (2026, 11, 8, 12, 0, 0)

FILES: dict[str, tuple[str, str, bytes | str]] = {}


def add(path: str, category: str, decision: str, content: bytes | str) -> None:
    FILES[path] = (category, decision, content)


def png_with_text(lines: list[str]) -> bytes:
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new("RGB", (900, 60 + 46 * len(lines)), "white")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 30)
    except OSError:
        font = ImageFont.load_default()
    for i, text in enumerate(lines):
        draw.text((30, 30 + i * 46), text, fill="black", font=font)
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=False)
    return buf.getvalue()


def zip_bytes(entries: dict[str, bytes | str]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in sorted(entries):
            info = zipfile.ZipInfo(name, STAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            data = entries[name]
            zf.writestr(info, data.encode("utf-8") if isinstance(data, str) else data)
    return buf.getvalue()


# ── Task-relevant code, tests and manifests (kept) ─────────────────────────
add("invoice-tool/README.md", "context", "keep", """# invoice-tool

Small CLI that totals invoice lines and prints a summary.

Run `python -m invoice.cli lines.csv`. Tests: `pytest`.
""")
add("invoice-tool/.gitignore", "context", "keep", ".env\n.env.*\n!.env.example\nlogs/\ndist/\nbuild/\n.venv/\n__pycache__/\n.pytest_cache/\nweb/node_modules/\ntmp/\n")
add("invoice-tool/pyproject.toml", "manifest", "keep", """[project]
name = "invoice-tool"
version = "0.3.0"
requires-python = ">=3.11"
dependencies = ["babel==2.16.0"]

[project.optional-dependencies]
test = ["pytest==8.3.3"]
""")
add("invoice-tool/requirements.lock", "manifest", "keep", "babel==2.16.0\npytest==8.3.3\niniconfig==2.0.0\npluggy==1.5.0\npackaging==24.1\n")
add("invoice-tool/.env.example", "context", "keep", "# Copy to .env and fill in locally. Never commit real values.\nPAYMENTS_API_KEY=\nSMTP_PASSWORD=\n")
add("invoice-tool/config/app.yaml", "context", "keep", "currency: USD\nrounding: half_up\nlocale: en_US\n")
add("invoice-tool/src/invoice/__init__.py", "source", "keep", '"""Invoice totals."""\n')
add("invoice-tool/src/invoice/totals.py", "source", "keep", '''from decimal import Decimal, ROUND_HALF_UP


def line_total(quantity: int, unit_price: str) -> Decimal:
    """Price of one invoice line, rounded to cents."""
    return (Decimal(unit_price) * quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def invoice_total(lines: list[tuple[int, str]]) -> Decimal:
    # BUG under review: rounds each line, then sums. Finance wants the sum rounded once.
    return sum((line_total(q, p) for q, p in lines), Decimal("0"))
''')
add("invoice-tool/src/invoice/cli.py", "source", "keep", '''import csv
import sys

from invoice.totals import invoice_total


def main(path: str) -> None:
    with open(path, newline="") as handle:
        lines = [(int(row["qty"]), row["unit_price"]) for row in csv.DictReader(handle)]
    print(f"Total: {invoice_total(lines)}")


if __name__ == "__main__":
    main(sys.argv[1])
''')
add("invoice-tool/tests/test_totals.py", "test", "keep", '''from decimal import Decimal

from invoice.totals import invoice_total


def test_round_once_not_per_line():
    # Three lines of 0.005: rounded once the total is 0.015 -> 0.02.
    # Rounding each line first gives 0.01 + 0.01 + 0.01 = 0.03.
    assert invoice_total([(1, "0.005")] * 3) == Decimal("0.02")
''')
add("invoice-tool/web/package.json", "manifest", "keep", '{\n  "name": "invoice-web",\n  "version": "0.3.0",\n  "dependencies": { "left-pad": "1.3.0" }\n}\n')
add("invoice-tool/web/package-lock.json", "manifest", "keep", '{\n  "name": "invoice-web",\n  "lockfileVersion": 3,\n  "packages": {\n    "node_modules/left-pad": { "version": "1.3.0" }\n  }\n}\n')
add("invoice-tool/web/src/app.js", "source", "keep", "import leftPad from 'left-pad';\nexport const label = (n) => leftPad(String(n), 8);\n")

# ── 1. Secrets and local credentials ───────────────────────────────────────
add("invoice-tool/.env", "1-secrets", "remove", "PAYMENTS_API_KEY=FAKE-payments-key-NOT-REAL-0000\nSMTP_PASSWORD=FAKE-smtp-password-NOT-REAL\n")
add("invoice-tool/id_ed25519", "1-secrets", "remove", "FAKE PRIVATE KEY PLACEHOLDER. Not a real key. Stands in for a key copied into the project folder.\n")
add("invoice-tool/config/settings.local.yaml", "1-secrets", "remove", "# Local override, renamed from .env during a debugging session\npayments_api_key: FAKE-payments-key-NOT-REAL-0000\nsmtp_password: FAKE-smtp-password-NOT-REAL\n")
add("invoice-tool/.git/config", "1-secrets", "remove", '[remote "origin"]\n\turl = https://FAKE-token-NOT-REAL@git.example.com/acme/invoice-tool.git\n')
add("invoice-tool/.git/HEAD", "4-generated", "remove", "ref: refs/heads/main\n")

# ── 2. Private data and identifying logs ───────────────────────────────────
add("invoice-tool/logs/app-2026-11-02.log", "2-private-data", "remove", (
    "2026-11-02T09:14:03Z INFO  invoice sent to jordan.lee@example.com from 203.0.113.24\n"
    "2026-11-02T09:15:41Z WARN  retry payment for account 4410 (casey.morgan@example.com)\n"
    "2026-11-02T09:16:02Z ERROR rounding mismatch on invoice INV-1043: expected 0.02, got 0.03\n"
))
add("invoice-tool/data/customers-export.csv", "2-private-data", "remove",
    "name,email,city\nJordan Lee,jordan.lee@example.com,Springfield\nCasey Morgan,casey.morgan@example.com,Riverton\n")
add("invoice-tool/docs/screenshot-checkout.png", "2-private-data", "remove",
    png_with_text(["Checkout for Jordan Lee", "jordan.lee@example.com", "Invoice INV-1043 total 0.03"]))

# ── 3. Installed dependency directories ───────────────────────────────────
add("invoice-tool/web/node_modules/left-pad/index.js", "3-dependencies", "remove", "module.exports = function leftPad(s, n) { return String(s).padStart(n); };\n")
add("invoice-tool/web/node_modules/left-pad/package.json", "3-dependencies", "remove", '{ "name": "left-pad", "version": "1.3.0" }\n')
add("invoice-tool/.venv/lib/python3.12/site-packages/babel/__init__.py", "3-dependencies", "remove", "# Installed package copy (fixture stand-in)\n__version__ = '2.16.0'\n")

# ── 4. Generated build output ─────────────────────────────────────────────
add("invoice-tool/build/lib/invoice/totals.py", "4-generated", "remove", "# Generated copy of src/invoice/totals.py from an earlier build\n")
rng = random.Random(1043)
add("invoice-tool/dist/invoice_tool-0.3.0-py3-none-any.whl", "4-generated", "remove", bytes(rng.getrandbits(8) for _ in range(40_000)))

# ── 5. Caches and temporary files ─────────────────────────────────────────
add("invoice-tool/src/invoice/__pycache__/totals.cpython-312.pyc", "5-cache-temp", "remove", b"\x00\x00\x00\x00FAKE-bytecode" + bytes(rng.getrandbits(8) for _ in range(2_000)))
add("invoice-tool/.pytest_cache/v/cache/lastfailed", "5-cache-temp", "remove", '{\n  "tests/test_totals.py::test_round_once_not_per_line": true\n}\n')
add("invoice-tool/tmp/debug-notes.txt", "5-cache-temp", "remove",
    "Scratch notes 2026-11-02\nTried the payments sandbox with FAKE-payments-key-NOT-REAL-0000\nCustomer on the call: casey.morgan@example.com\n")

# ── 6. Irrelevant large binaries ──────────────────────────────────────────
add("invoice-tool/assets/demo-recording.mp4", "6-large-binary", "remove", bytes(rng.getrandbits(8) for _ in range(262_144)))

# ── 7. Duplicate or obsolete copies ───────────────────────────────────────
add("invoice-tool/src/invoice/totals_old.py", "7-duplicates", "remove",
    "# Obsolete version kept 'just in case'\ndef invoice_total(lines):\n    return round(sum(q * float(p) for q, p in lines), 2)\n")
add("invoice-tool/src/invoice/totals (copy).py", "7-duplicates", "remove", FILES["invoice-tool/src/invoice/totals.py"][2])
add("invoice-tool/backup/invoice-tool-2026-09.zip", "7-duplicates", "remove", zip_bytes({
    "invoice-tool/src/invoice/totals.py": "# September copy\ndef invoice_total(lines):\n    return sum(lines)\n",
    "invoice-tool/config/settings.old.yaml": "payments_api_key: FAKE-old-payments-key-NOT-REAL-9999\n",
}))


def main() -> None:
    original = {path: content for path, (_, _, content) in FILES.items()}
    sharing = {path: content for path, (_, decision, content) in FILES.items() if decision == "keep"}
    out = {}
    for name, entries in (("invoice-tool-original.zip", original), ("invoice-tool-sharing.zip", sharing)):
        data = zip_bytes(entries)
        (HERE / name).write_bytes(data)
        out[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "entries": len(entries)}
    inventory = {
        "label": "Synthetic fixture. All credentials are FAKE placeholders; e-mails use example.com; IPs use 203.0.113.0/24.",
        "task": "Fix the rounding bug in invoice totals (invoice_total rounds per line, should round once)",
        "archives": out,
        "files": [
            {"path": p, "category": c, "decision": d, "bytes": len(v.encode() if isinstance(v, str) else v)}
            for p, (c, d, v) in sorted(FILES.items())
        ],
    }
    (HERE / "inventory.json").write_text(json.dumps(inventory, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
