#!/usr/bin/env python3
"""M03-S2: re-save order-stale.xlsx with LibreOffice Calc set to always
recalculate Excel 2007+ files on load (OOXMLRecalcMode 0), using a throwaway
user profile, to produce order-recalculated.xlsx.

  python recalc_save.py
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
XCU = """<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<item oor:path="/org.openoffice.Office.Calc/Formula/Load"><prop oor:name="OOXMLRecalcMode" oor:op="fuse"><value>0</value></prop></item>
</oor:items>
"""


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        prof = Path(tmp) / "profile"
        (prof / "user").mkdir(parents=True)
        (prof / "user" / "registrymodifications.xcu").write_text(XCU)
        work = Path(tmp) / "in"
        work.mkdir()
        shutil.copy(HERE / "order-stale.xlsx", work / "order-recalculated.xlsx")
        out = Path(tmp) / "out"
        subprocess.run(["soffice", f"-env:UserInstallation=file://{prof}", "--headless", "--calc", "--convert-to", "xlsx",
                        "--outdir", str(out), str(work / "order-recalculated.xlsx")], check=True, capture_output=True)
        shutil.move(out / "order-recalculated.xlsx", HERE / "order-recalculated.xlsx")
    data = (HERE / "order-recalculated.xlsx").read_bytes()
    rec = json.loads((HERE / "order-files.json").read_text())
    rec["files"]["order-recalculated.xlsx"] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "order-files.json").write_text(json.dumps(rec, indent=2) + "\n")
    print(rec["files"]["order-recalculated.xlsx"])


if __name__ == "__main__":
    main()
