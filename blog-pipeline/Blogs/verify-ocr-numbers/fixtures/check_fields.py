#!/usr/bin/env python3
"""M02-S2: compare every high-impact field in the recognized text with the
exact printed value (receipt-truth.json), character for character.

For each variant and field: exact, changed (with the observed string) or
missing. Also records whether a digits-only comparison, which ignores letters,
separators and signs, would have accepted the observed value. Writes
field-results.json and correction-log.csv (one row per mismatch, with the
correction confirmed against the source page).

  python check_fields.py
"""

from __future__ import annotations

import csv
import difflib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
TRUTH = json.loads((HERE / "receipt-truth.json").read_text())
RUNS = json.loads((HERE / "out" / "runs.json").read_text())


def digits(s: str) -> str:
    return re.sub(r"\D", "", s)


def find_line(lines: list[str], label: str) -> str | None:
    for ln in lines:
        if ln.startswith(label):
            return ln
    # Tolerate a misread label (for example "ltem" for "Item").
    best = max(lines, key=lambda ln: difflib.SequenceMatcher(None, ln[: len(label)], label).ratio(), default=None)
    if best and difflib.SequenceMatcher(None, best[: len(label)], label).ratio() >= 0.8:
        return best
    return None


def check_variant(text: str) -> list[dict]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    results = []
    rows: dict[str, list[str]] = {}
    for fld in TRUTH["fields"]:
        fid, label, value = fld["id"], fld["label"], fld["value"]
        observed = None
        if fid.startswith("row"):
            n, part = fid[3], fid.split("_", 1)[1]
            if label not in rows:
                ln = find_line(lines, label)
                rows[label] = ln[len(label):].split() if ln else None
            toks = rows[label]
            if toks is not None:
                want = {"qty": 0, "unit": 1, "amount": 2}[part]
                if len(toks) == 3:
                    observed = toks[want]
                else:
                    # Fewer values than columns: align by the expected values.
                    exp = [f["value"] for f in TRUTH["fields"] if f["id"].startswith(f"row{n}_")]
                    sm = difflib.SequenceMatcher(None, exp, toks)
                    mapped = {}
                    for tag, i1, i2, j1, j2 in sm.get_opcodes():
                        for k in range(i2 - i1):
                            mapped[i1 + k] = toks[j1 + k] if tag in ("equal", "replace") and j1 + k < j2 else None
                    observed = mapped.get(want)
        elif fid == "terms":
            ln = find_line(lines, "Terms")
            observed = ln
        else:
            ln = find_line(lines, label)
            observed = ln[len(label):].strip() if ln else None
            if ln and not ln.startswith(label):
                observed = ln.split(None, len(label.split()))[-1]
        if observed is None:
            status = "missing"
        elif observed == value:
            status = "exact"
        else:
            status = "changed"
        results.append({
            "id": fid,
            "kind": fld["kind"],
            "expected": value,
            "observed": observed,
            "status": status,
            "digits_only_would_pass": observed is not None and digits(observed) == digits(value),
        })
    return results


def main() -> None:
    out = {"label": "Field comparison of LOCAL CODE-LEVEL RUN outputs against the printed values", "date": RUNS["date"], "variants": {}}
    log_rows = []
    for run in RUNS["runs"]:
        text = (HERE / run["output"]).read_text()
        res = check_variant(text)
        counts = {s: sum(r["status"] == s for r in res) for s in ("exact", "changed", "missing")}
        out["variants"][run["variant"]] = {"counts": counts, "fields": res,
                                           "digits_only_hidden": [r["id"] for r in res if r["status"] == "changed" and r["digits_only_would_pass"]]}
        for r in res:
            if r["status"] != "exact":
                log_rows.append({
                    "variant": run["variant"],
                    "field": r["id"],
                    "printed_on_page": r["expected"],
                    "in_output": r["observed"] if r["observed"] is not None else "(not found)",
                    "problem": r["status"],
                    "corrected_to": r["expected"],
                    "checked_against": "receipt-truth.json (printed value)",
                })
    (HERE / "field-results.json").write_text(json.dumps(out, indent=2) + "\n")
    with (HERE / "correction-log.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(log_rows[0].keys()))
        w.writeheader()
        w.writerows(log_rows)
    for name, v in out["variants"].items():
        print(name, v["counts"], "digits-only would hide:", v["digits_only_hidden"])
        for r in v["fields"]:
            if r["status"] != "exact":
                print("   ", r["id"], repr(r["expected"]), "->", repr(r["observed"]), r["status"])


if __name__ == "__main__":
    main()
