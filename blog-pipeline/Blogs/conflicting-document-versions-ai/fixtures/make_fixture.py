#!/usr/bin/env python3
"""Synthetic M12 fixture: two versions of a fictional travel policy.

The bodies are nearly identical. Two facts differ (receipt deadline and hotel
cap). Each version's effective date lives only in the page header and the
document properties, which is common in real files. File names are the
unhelpful "travel-policy.docx" and "travel-policy (1).docx".
All content is invented.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import io
import json
from pathlib import Path

from docx import Document

HERE = Path(__file__).resolve().parent


def policy(effective: str, receipts_days: int, hotel_cap: int, modified: dt.datetime) -> bytes:
    doc = Document()
    doc.sections[0].header.paragraphs[0].text = f"Travel Policy, effective {effective}"
    doc.core_properties.title = "Travel Policy"
    doc.core_properties.modified = modified
    doc.add_heading("Travel Policy (synthetic sample)", level=1)
    doc.add_heading("Expenses", level=2)
    doc.add_paragraph(f"Submit receipts within {receipts_days} days of the trip.")
    doc.add_paragraph(f"Hotel cap: {hotel_cap} USD per night in major cities.")
    doc.add_paragraph("Economy class is required for flights under six hours.")
    doc.add_heading("Approvals", level=2)
    doc.add_paragraph("Your manager approves trips before booking.")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def main() -> None:
    files = {
        "travel-policy.docx": policy("1 January 2026", 30, 180, dt.datetime(2026, 1, 5, 9, 0)),
        "travel-policy (1).docx": policy("1 July 2026", 14, 200, dt.datetime(2026, 6, 20, 9, 0)),
    }
    record = {}
    for name, data in files.items():
        (HERE / name).write_bytes(data)
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    truth = {
        "travel-policy.docx": {"effective": "2026-01-01", "receipts_days": 30, "hotel_cap_usd": 180},
        "travel-policy (1).docx": {"effective": "2026-07-01", "receipts_days": 14, "hotel_cap_usd": 200},
    }
    (HERE / "inputs.json").write_text(json.dumps({"label": "Synthetic policy versions; invented", "files": record, "truth": truth}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
