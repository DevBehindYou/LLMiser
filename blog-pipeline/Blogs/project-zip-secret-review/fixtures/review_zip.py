#!/usr/bin/env python3
"""M01-S1 fixture: two review passes over a sharing ZIP, without extracting.

Pass 1 (names): flags paths that look like credentials, logs, data exports,
temporary or backup files. Pass 2 (contents): searches text entries for
key/token/password assignments, e-mail addresses, private-key headers and
credentials inside URLs. Both passes descend into nested ZIPs, which a quick
look at the top level misses. Run on the M01 synthetic archives (FAKE values
only). This is an illustrative review script, not a complete secret scanner.

  python review_zip.py ARCHIVE.zip > result.json
"""

from __future__ import annotations

import io
import json
import re
import sys
import zipfile

NAME_RULES = {
    "env or credentials file": re.compile(r"(^|/)(\.env(\..*)?|credentials(\.json)?|secrets?\.(json|ya?ml|toml)|\.npmrc|\.netrc)$", re.I),
    "private key": re.compile(r"(^|/)id_(rsa|dsa|ecdsa|ed25519)$|\.(pem|key|p12|pfx)$", re.I),
    "log file": re.compile(r"\.log$", re.I),
    "data export": re.compile(r"\.(csv|tsv|xlsx|xls)$", re.I),
    "temp or backup": re.compile(r"(^|/)(tmp|temp|backup|backups)/|\.(bak|old|orig)$|(copy)", re.I),
    "image": re.compile(r"\.(png|jpe?g|gif|webp|bmp|tiff?)$", re.I),
    "git metadata": re.compile(r"(^|/)\.git/"),
}
CONTENT_RULES = {
    "key, token or password assignment": re.compile(r"(?i)\b[\w.-]*(api[_-]?key|token|secret|password|passwd)[\w.-]*\s*[:=]\s*\S+"),
    "e-mail address": re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+"),
    "private key header": re.compile(r"BEGIN [A-Z ]*PRIVATE KEY"),
    "credential in URL": re.compile(r"https?://[^\s/@]+@"),
}


def walk(zf: zipfile.ZipFile, prefix: str, out: list) -> None:
    for info in zf.infolist():
        if info.is_dir():
            continue
        path = prefix + info.filename
        data = zf.read(info)
        names = [label for label, rx in NAME_RULES.items() if rx.search(path)]
        hits = []
        if path.lower().endswith(".zip"):
            walk(zipfile.ZipFile(io.BytesIO(data)), path + "/", out)
        elif b"\x00" not in data[:4096]:
            text = data.decode("utf-8", "replace")
            for label, rx in CONTENT_RULES.items():
                for m in rx.finditer(text):
                    hits.append({"rule": label, "match": m.group(0)[:60]})
        out.append({"path": path, "name_flags": names, "content_hits": hits})


def main() -> None:
    entries: list = []
    with zipfile.ZipFile(sys.argv[1]) as zf:
        walk(zf, "", entries)
    entries.sort(key=lambda e: e["path"])
    flagged_name = [e["path"] for e in entries if e["name_flags"]]
    flagged_content = [e["path"] for e in entries if e["content_hits"]]
    summary = {
        "archive": sys.argv[1].rsplit("/", 1)[-1],
        "entries_including_nested": len(entries),
        "flagged_by_name": len(flagged_name),
        "flagged_by_content": len(flagged_content),
        "flagged_by_content_only": sorted(set(flagged_content) - set(flagged_name)),
        "flagged_by_name_only": sorted(set(flagged_name) - set(flagged_content)),
        "flagged_by_both": sorted(set(flagged_name) & set(flagged_content)),
    }
    print(json.dumps({"label": "Illustrative review script on synthetic FAKE data; not a complete scanner", "summary": summary, "entries": entries}, indent=2))


if __name__ == "__main__":
    main()
