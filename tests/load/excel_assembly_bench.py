"""Fresh-process Excel/result assembly comparison with generated data only.

python tests/load/excel_assembly_bench.py --case excel --mode current --sheets 6 --rows 5000
python tests/load/excel_assembly_bench.py --case assembly --mode current --characters 6000000

Repeat with --mode upstream and optionally --heap. No server/Storage calls.
"""
from __future__ import annotations

import argparse
import gc
import hashlib
import importlib.metadata
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import time
import tracemalloc
import types

os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["SUPABASE_URL"] = ""
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = ""
os.environ["INTERNAL_SHARED_SECRET"] = "offline-benchmark-only"
ROOT = Path(__file__).resolve().parents[2]
BASELINE = "3f0501ab01302abd0f8402a91741de63d2c256d7"


def peak_rss_mib():
    if sys.platform != "win32":
        import resource
        return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024**2 if sys.platform == "darwin" else 1024)
    import ctypes
    from ctypes import wintypes
    class Counters(ctypes.Structure):
        _fields_ = [(name, wintypes.DWORD) for name in ["cb", "PageFaultCount"]] + [(name, ctypes.c_size_t) for name in ["PeakWorkingSetSize", "WorkingSetSize", "QuotaPeakPagedPoolUsage", "QuotaPagedPoolUsage", "QuotaPeakNonPagedPoolUsage", "QuotaNonPagedPoolUsage", "PagefileUsage", "PeakPagefileUsage"]]
    counters = Counters()
    counters.cb = ctypes.sizeof(counters)
    probe = ctypes.windll.psapi.GetProcessMemoryInfo
    probe.argtypes = [wintypes.HANDLE, ctypes.POINTER(Counters), wintypes.DWORD]
    if not probe(wintypes.HANDLE(-1), ctypes.byref(counters), counters.cb):
        raise OSError("Could not read process memory")
    return counters.PeakWorkingSetSize / 1024**2


def old_module(name, relative):
    source = subprocess.check_output(["git", "-C", str(ROOT), "show", f"{BASELINE}:{relative}"], text=True, encoding="utf-8")
    module = types.ModuleType(name)
    sys.modules[name] = module
    exec(compile(source, relative, "exec"), module.__dict__)
    return module


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--case", choices=["excel", "assembly", "counts"], required=True)
    parser.add_argument("--mode", choices=["upstream", "current"], required=True)
    parser.add_argument("--ext", choices=["xlsx", "xls"], default="xlsx")
    parser.add_argument("--sheets", type=int, default=6)
    parser.add_argument("--rows", type=int, default=5000)
    parser.add_argument("--characters", type=int, default=6000000)
    parser.add_argument("--heap", action="store_true")
    parser.add_argument("--fixture", help=argparse.SUPPRESS)
    args = parser.parse_args()
    if not 1 <= args.sheets <= 12 or not 1 <= args.rows <= 30000 or not 1 <= args.characters <= 16000000:
        parser.error("fixture parameters exceed the bounded offline corpus")
    if args.case == "assembly" and args.characters > 6000000:
        parser.error("four generated Unicode entries must fit the existing 40 MiB output cap")
    if args.case == "excel" and not args.fixture:
        # Generate outside the measured child so writer memory does not mask
        # parser peaks. Generated workbooks stay in the ignored corpus folder.
        sys.path.insert(0, str(ROOT / "backendN/tests"))
        from excel_fixtures import make_dense_book
        directory = ROOT / "tests/load/.corpus"
        directory.mkdir(parents=True, exist_ok=True)
        fixture = directory / f"excel-memory-{args.ext}-{args.sheets}-{args.rows}.{args.ext}"
        data = make_dense_book(args.ext, args.sheets, args.rows)
        if len(data) > 15 * 1024 * 1024:
            raise ValueError("workbook exceeds deployed input limit")
        fixture.write_bytes(data)
        subprocess.run([sys.executable, __file__, *sys.argv[1:], "--fixture", str(fixture)], check=True)
        return

    uploaded = {}
    if args.case == "excel":
        sys.path.insert(0, str(ROOT / "backendN"))
        from app.converter import NormalConverter
        from app.excel_converter import VERIFIED_VERSIONS
        from markitdown.converters import XlsxConverter, XlsConverter
        if importlib.metadata.version("markitdown") not in VERIFIED_VERSIONS:
            parser.error("use a verified MarkItDown version for comparison")
        data = Path(args.fixture).read_bytes()
        engine = NormalConverter()
        if args.mode == "upstream":
            engine._md.register_converter(XlsxConverter() if args.ext == "xlsx" else XlsConverter())
        engine.validate(data, args.ext)
        def run():
            output = engine.convert(data, args.ext, filename=f"generated.{args.ext}", title="generated")[0]
            assert all(f"sheet-{sheet}-row-{args.rows-1}" in output for sheet in range(args.sheets))
            return output
    else:
        sys.path.insert(0, str(ROOT / "backendZ"))
        from app import archive, archive_tasks
        from app.common import profiles
        if args.mode == "upstream":
            profiles = old_module("bench_old_profiles", "backendZ/app/common/profiles.py")
            archive_tasks = old_module("bench_old_archive_tasks", "backendZ/app/archive_tasks.py")
            archive_tasks.finalize_markdown = profiles.finalize_markdown
        chunk = "| Generated café 日本語 🙂 | 315 | word value |\n"
        text = (chunk * (args.characters // len(chunk) + 1))[:args.characters]
        if args.case == "counts":
            def run():
                return profiles.finalize_markdown(text, title="generated", original_name="generated.xlsx", size_bytes=42, engine="MarkItDown")
        else:
            from app.common.config import Settings
            settings = Settings(role="archive", instance="offline", shared_secret="test-only", max_upload_bytes=15*1024*1024, version="bench")
            entries = [archive.Entry(path=f"sheet-{i}.xlsx", node_type="DOCUMENT", classification="DOCUMENT", status="DONE", content=f"# Sheet {i}\n\n{text}\nEND-{i}-日本語🙂", node_id=f"00000000-0000-4000-8000-{i:012d}") for i in range(4)]
            lock = threading.Lock()
            class Store:
                def upload(self, path, data, content_type):
                    time.sleep(.02)
                    with lock:
                        uploaded[path] = (len(data), hashlib.sha256(data).hexdigest())
            def run():
                result = archive_tasks.write_outputs(Store(), job_id="00000000-0000-4000-8000-000000000001", name="generated.zip", profile="Standard", source_bytes=42, entries=entries, ocr_texts={}, settings=settings)
                assert result["output_bytes"] == sum(size for size, digest in uploaded.values())
                return json.dumps({"result": result, "uploads": uploaded}, sort_keys=True)
    gc.collect()
    before = peak_rss_mib()
    if args.heap:
        tracemalloc.start()
    started = time.perf_counter()
    output = run()
    seconds = time.perf_counter() - started
    peak = peak_rss_mib()
    heap = tracemalloc.get_traced_memory()[1] / 1024**2 if args.heap else None
    if args.heap:
        tracemalloc.stop()
    words = tokens = None
    if isinstance(output, tuple):
        output, words, tokens = output
    print(json.dumps({"case": args.case, "mode": args.mode, "python": sys.version.split()[0], "markitdown": importlib.metadata.version("markitdown"), "pandas": importlib.metadata.version("pandas"), "ext": args.ext, "sheets": args.sheets, "rows": args.rows, "characters_per_entry": args.characters, "seconds": round(seconds, 4), "tracing": args.heap, "process_peak_before_MiB": round(before, 2), "process_peak_after_MiB": round(peak, 2), "peak_python_heap_MiB": round(heap, 2) if heap is not None else None, "output_bytes": len(output.encode()), "output_sha256": hashlib.sha256(output.encode()).hexdigest(), "word_count": words, "tokens_est": tokens, "uploaded_bytes": sum(size for size, digest in uploaded.values()), "host_capacity_claim": False}))


if __name__ == "__main__":
    main()
