#!/usr/bin/env python3
"""Run LLMiser's own conversion code locally on synthetic campaign fixtures.

This is a LOCAL CODE-LEVEL RUN of the repository's backends at the checked-out
revision. It is not a live production conversion: there is no upload, Storage,
queue, worker deadline, deployed version or OCR-pool handoff for images inside
a ZIP (the archive path below is the documented local multipart fallback, where
archive images are listed but not recognised). Label results accordingly.

Usage (one backend per process, because each backend has its own `app` package):

  python llmiser_local.py zip  INPUT.zip  OUTDIR [--profile Standard]
  python llmiser_local.py doc  INPUT.ext  OUTDIR [--profile Standard]
  python llmiser_local.py ocr  IMAGE.ext  OUTDIR [--profile Standard]
  python llmiser_local.py profiles INPUT.ext OUTDIR      (all four profiles, doc or zip)
  python llmiser_local.py pdf  INPUT.pdf  OUTDIR [--profile Standard]
      Storage-path PDF emulation using backendN.app.pdf_tasks functions in the
      production order: classify_pages, page_runs, sub_pdf + converter for
      native runs, render_page_png + backendO OCR (raw, in a subprocess) for
      scanned pages, then the merge labels and finalize_markdown. A PDF without
      scanned pages takes the single-pass document path, as in production.

Each run writes the output files and run.json (revision, date, versions, input
and output SHA-256, words and the backend's own estimated token count).
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
PROFILES = ("Standard", "Clean", "Compact", "RAG-ready")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def revision() -> str:
    try:
        return subprocess.check_output(["git", "-C", str(REPO), "rev-parse", "HEAD"], text=True).strip()
    except Exception:  # noqa: BLE001
        return "unknown"


def use_backend(name: str) -> None:
    sys.path.insert(0, str(REPO / name))


def versions() -> dict:
    out = {"python": sys.version.split()[0]}
    try:
        from importlib.metadata import version

        out["markitdown"] = version("markitdown")
    except Exception:  # noqa: BLE001
        pass
    try:
        out["tesseract"] = subprocess.check_output(["tesseract", "--version"], text=True, stderr=subprocess.STDOUT).splitlines()[0]
    except Exception:  # noqa: BLE001
        pass
    return out


def write(outdir: Path, name: str, text: str) -> dict:
    data = text.encode("utf-8")
    (outdir / name).write_bytes(data)
    return {"file": name, "bytes": len(data), "sha256": sha256(data)}


def run_zip(src: Path, outdir: Path, profile: str) -> dict:
    use_backend("backendZ")
    from app import archive  # type: ignore
    from app.common.files import split_name, title_from_stem  # type: ignore
    from app.common.profiles import finalize_markdown  # type: ignore
    from app.converter import DocumentEngine  # type: ignore

    data = src.read_bytes()
    entries = archive.process_archive(data, DocumentEngine(), ocr_available=False)
    stem, _ = split_name(src.name)
    title = title_from_stem(stem)
    # Same composition as app.archive_tasks.write_outputs (Storage path), minus OCR texts.
    content, words, tokens = finalize_markdown(
        archive.combined_body(entries, {}) or "_No convertible files were found in this archive._",
        title=title, original_name=src.name, size_bytes=len(data), engine=archive.ENGINE, profile=profile,
    )
    parts = archive.split_parts(content, title)
    files = []
    if len(parts) == 1:
        files.append(write(outdir, "combined.md", parts[0]))
    else:
        for i, part in enumerate(parts, start=1):
            files.append(write(outdir, f"combined-{i:03d}.md", part))
    files.append(write(outdir, "PROJECT_INDEX.md", archive.project_index(src.name, entries, {})))
    files.append(write(outdir, "manifest.json", archive.manifest(None, src.name, len(data), entries, {})))
    return {"kind": "zip", "words": words, "estimated_tokens_backend": tokens, "outputs": files,
            "entries": [{"path": e.path, "status": e.status, "type": e.node_type, "reason": e.skip_reason} for e in entries]}


def run_doc(src: Path, outdir: Path, profile: str) -> dict:
    use_backend("backendN")
    from app.common.files import split_name, title_from_stem  # type: ignore
    from app.common.profiles import finalize_markdown  # type: ignore
    from app.converter import NormalConverter  # type: ignore

    data = src.read_bytes()
    stem, ext = split_name(src.name)
    conv = NormalConverter()
    conv.validate(data, ext)
    markdown, note = conv.convert(data, ext, filename=src.name, title=title_from_stem(stem))
    content, words, tokens = finalize_markdown(markdown, title=title_from_stem(stem), original_name=src.name,
                                               size_bytes=len(data), engine=conv.engine_name, profile=profile)
    return {"kind": "doc", "note": note, "words": words, "estimated_tokens_backend": tokens,
            "outputs": [write(outdir, f"{stem}.{profile}.md", content)]}


def run_ocr(src: Path, outdir: Path, profile: str) -> dict:
    use_backend("backendO")
    from app.common.files import split_name, title_from_stem  # type: ignore
    from app.common.profiles import finalize_markdown  # type: ignore
    from app.converter import OcrConverter  # type: ignore

    data = src.read_bytes()
    stem, ext = split_name(src.name)
    conv = OcrConverter()
    ok, detail = conv.ready()
    if not ok:
        raise SystemExit(f"OCR engine not ready: {detail}")
    conv.validate(data, ext)
    markdown, note = conv.convert(data, ext, filename=src.name, title=title_from_stem(stem))
    content, words, tokens = finalize_markdown(markdown, title=title_from_stem(stem), original_name=src.name,
                                               size_bytes=len(data), engine=conv.engine_name, profile=profile)
    return {"kind": "ocr", "note": note, "ready": detail, "words": words, "estimated_tokens_backend": tokens,
            "outputs": [write(outdir, f"{stem}.{profile}.md", content)]}


def run_ocr_raw(src: Path) -> str:
    use_backend("backendO")
    from app.common.files import split_name, title_from_stem  # type: ignore
    from app.converter import OcrConverter  # type: ignore

    data = src.read_bytes()
    stem, ext = split_name(src.name)
    conv = OcrConverter()
    conv.validate(data, ext)
    markdown, note = conv.convert(data, ext, filename=src.name, title=title_from_stem(stem))
    return json.dumps({"text": markdown.strip() + "\n", "note": note})


def run_pdf(src: Path, outdir: Path, profile: str) -> dict:
    use_backend("backendN")
    import pypdfium2 as pdfium  # type: ignore
    from app import pdf_tasks  # type: ignore
    from app.common.files import split_name, title_from_stem  # type: ignore
    from app.common.profiles import finalize_markdown  # type: ignore
    from app.converter import NormalConverter  # type: ignore

    data = src.read_bytes()
    name = src.name
    stem, _ = split_name(name)
    pdf = pdfium.PdfDocument(data)
    pages = pdf_tasks.classify_pages(pdf)
    page_info = [{"page": p.number, "chars": p.chars, "image_coverage": round(p.image_coverage, 3), "kind": p.kind} for p in pages]
    scans = [p.number for p in pages if p.kind == "scan"]
    conv = NormalConverter()
    if not scans:
        pdf.close()
        result = run_doc(src, outdir, profile)
        return {**result, "path": "single-pass (no scanned pages)", "pages": page_info}
    ocr_pages = set(scans[: pdf_tasks.MAX_OCR_PAGES])
    skipped = scans[pdf_tasks.MAX_OCR_PAGES:]
    blocks, segments = [], []
    for kind, first, last in pdf_tasks.page_runs(pages):
        if kind == "native" or first not in ocr_pages:
            if kind == "scan":
                continue
            markdown, _w = conv.convert(pdf_tasks.sub_pdf(pdf, first, last), "pdf", filename=name, title=name, note_low_text=False)
            text = markdown.strip()
            segments.append({"kind": "native", "pages": [first, last], "chars": len(text)})
            if text:
                blocks.append(text)
        else:
            png = pdf_tasks.render_page_png(pdf, first)
            png_path = outdir / f"page-{first:03d}.png"
            png_path.write_bytes(png)
            out = subprocess.run([sys.executable, __file__, "ocr-raw", str(png_path), str(outdir)], capture_output=True, text=True)
            label = f"<!-- page {first}: text recognition -->"
            if out.returncode != 0:
                text, note = None, out.stderr.strip()[-300:]
            else:
                payload = json.loads(out.stdout)
                text, note = payload["text"], payload["note"]
            segments.append({"kind": "ocr", "pages": [first, first], "note": note, "chars": len((text or "").strip())})
            if text is None or not text.strip():
                blocks.append(f"{label}\n> \u26a0\ufe0f Page {first}: no text could be recognised.")
            else:
                blocks.append(f"{label}\n{text.strip()}")
    pdf.close()
    if skipped:
        listed = ", ".join(str(n) for n in skipped[:20]) + ("\u2026" if len(skipped) > 20 else "")
        blocks.append(f"> \u26a0\ufe0f {len(skipped)} more scanned pages were not read (LLMiser reads up to {pdf_tasks.MAX_OCR_PAGES} scanned pages per PDF): {listed}.")
    content, words, tokens = finalize_markdown("\n\n".join(blocks) or "_No text found in this document._", title=title_from_stem(stem),
                                               original_name=name, size_bytes=len(data), engine=pdf_tasks.ENGINE_HYBRID, profile=profile)
    return {"kind": "pdf", "path": "storage-path emulation (scanned pages present)", "pages": page_info, "segments": segments,
            "words": words, "estimated_tokens_backend": tokens, "outputs": [write(outdir, f"{stem}.{profile}.md", content)]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["zip", "doc", "ocr", "profiles", "pdf", "ocr-raw"])
    ap.add_argument("input")
    ap.add_argument("outdir")
    ap.add_argument("--profile", default="Standard", choices=PROFILES)
    args = ap.parse_args()
    src = Path(args.input).resolve()
    outdir = Path(args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)
    # OCR: set TESSDATA_PREFIX to a folder holding tessdata_fast 4.1.0 eng/osd, as backendO/Dockerfile does.
    if args.mode == "ocr-raw":
        print(run_ocr_raw(src))
        return 0
    started = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    runs = []
    if args.mode == "profiles":
        kind = "zip" if src.suffix.lower() == ".zip" else "doc"
        for profile in PROFILES:
            sub = outdir / profile
            sub.mkdir(exist_ok=True)
            runs.append({"profile": profile, **(run_zip if kind == "zip" else run_doc)(src, sub, profile)})
            # Reload the backend modules cleanly for the next profile run is not needed: same backend.
    else:
        fn = {"zip": run_zip, "doc": run_doc, "ocr": run_ocr, "pdf": run_pdf}[args.mode]
        runs.append({"profile": args.profile, **fn(src, outdir, args.profile)})
    record = {
        "label": "LOCAL CODE-LEVEL RUN of repository backend code; not a live production conversion",
        "date_utc": started,
        "revision": revision(),
        "versions": versions(),
        "input": {"file": src.name, "bytes": src.stat().st_size, "sha256": sha256(src.read_bytes())},
        "mode": args.mode,
        "runs": runs,
    }
    (outdir / "run.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: record[k] for k in ("date_utc", "revision", "mode")}), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
