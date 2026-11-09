#!/usr/bin/env python3
"""M01-S2 synthetic fixture: which dependency files a reviewer needs.

A toy Node project imports a fictional money library ("acme-money", invented)
from a locally patched, vendored copy. The question under review: why does
invoice total(2.675) return 2.67 instead of 2.68? The answer depends on the
exact library version and on the local patch, so the bundles differ in what
they let a reviewer see.

  full.zip            working folder: source, test, manifest, lockfile,
                      node_modules (installed copy) and vendor/ (patched copy)
  a-source-only.zip   src and test
  b-manifest.zip      + package.json (version range only)
  c-lockfile.zip      + package-lock.json (exact version)
  d-patch-kept.zip    + the patched copy moved to patches/ (vendor/ is skipped
                      by LLMiser's folder rule, so it is renamed in the copy)
All names and code are invented.
"""

from __future__ import annotations

import hashlib
import io
import json
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
STAMP = (2026, 11, 9, 12, 0, 0)

SRC = {
    "shop/src/invoice.js": "const { round } = require('../vendor/acme-money/round');\n\nfunction total(amount) {\n  return round(amount, 2);\n}\n\nmodule.exports = { total };\n",
    "shop/test/invoice.test.js": "const { total } = require('../src/invoice');\n\ntest('rounds half up to cents', () => {\n  expect(total(2.675)).toBe(2.68); // fails: returns 2.67\n});\n",
}
MANIFEST = {"shop/package.json": json.dumps({"name": "shop", "version": "1.4.0", "dependencies": {"acme-money": "^2.1.0"}, "devDependencies": {"jest": "^29.7.0"}}, indent=2) + "\n"}
LOCK = {"shop/package-lock.json": json.dumps({"name": "shop", "lockfileVersion": 3, "packages": {"node_modules/acme-money": {"version": "2.1.4", "resolved": "https://registry.example.com/acme-money-2.1.4.tgz"}, "node_modules/jest": {"version": "29.7.0"}}}, indent=2) + "\n"}
INSTALLED = {
    "shop/node_modules/acme-money/package.json": json.dumps({"name": "acme-money", "version": "2.1.4"}) + "\n",
    "shop/node_modules/acme-money/round.js": "// 2.1.4: rounds half to even (banker's rounding)\nmodule.exports.round = (x, d) => Number(x.toFixed(d));\n",
    "shop/node_modules/acme-money/CHANGELOG.md": "## 2.2.0\n- round() now rounds half up\n\n## 2.1.4\n- round() rounds half to even\n",
}
VENDOR = {
    "shop/vendor/acme-money/round.js": "// Local patch of acme-money 2.1.4 (kept in vendor/ by this team)\n// Uses toFixed, which works on binary floating point: 2.675 is stored as 2.67499999...\nmodule.exports.round = (x, d) => Number(x.toFixed(d));\n",
    "shop/vendor/acme-money/PATCH.md": "Patched from acme-money 2.1.4 to remove a logging call. Rounding unchanged.\n",
}
PATCHES = {k.replace("shop/vendor/", "shop/patches/"): v for k, v in VENDOR.items()}
README = {"shop/README.md": "# shop\n\nQuestion for review: why does total(2.675) return 2.67, not 2.68?\nThe rounding code is a patched copy of acme-money, kept under patches/ in this sharing copy (vendor/ in the working folder).\n"}


def zbytes(entries: dict) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in sorted(entries):
            info = zipfile.ZipInfo(name, STAMP)
            info.external_attr = 0o644 << 16
            zf.writestr(info, entries[name])
    return buf.getvalue()


def main() -> None:
    variants = {
        "full.zip": {**SRC, **MANIFEST, **LOCK, **INSTALLED, **VENDOR},
        "a-source-only.zip": {**SRC},
        "b-manifest.zip": {**SRC, **MANIFEST},
        "c-lockfile.zip": {**SRC, **MANIFEST, **LOCK},
        "d-patch-kept.zip": {**SRC, **MANIFEST, **LOCK, **PATCHES, **README},
    }
    record = {}
    for name, entries in variants.items():
        data = zbytes(entries)
        (HERE / name).write_bytes(data)
        record[name] = {"entries": sorted(entries), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic Node project; acme-money is fictional", "variants": record}, indent=2) + "\n")
    print({k: len(v["entries"]) for k, v in record.items()})


if __name__ == "__main__":
    main()
