"""Offline CSV parser comparison; one fresh process per mode/fixture.

Use --mode upstream/current --rows 50000 --concurrency 2 [--heap].
Set PYTHONPATH to a verified MarkItDown package when testing another version.
No servers, environment files, user documents or Storage calls are used.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import csv
import ctypes
import gc
import hashlib
from importlib.metadata import version
import io
import json
import os
from pathlib import Path
import sys
import threading
import time
import tracemalloc

# Guard before importing any parser dependency that may call load_dotenv.
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["SUPABASE_URL"] = ""
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = ""
os.environ["INTERNAL_SHARED_SECRET"] = "offline-benchmark-only"
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backendN"))

from app.converter import NormalConverter  # noqa: E402
from app.csv_converter import VERIFIED_VERSIONS  # noqa: E402
from markitdown.converters import CsvConverter  # noqa: E402


def peak_rss_mib():
    if sys.platform != "win32":
        import resource
        value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        return value / (1024**2 if sys.platform == "darwin" else 1024)
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=["upstream", "current"], required=True)
    parser.add_argument("--rows", type=int, default=50000)
    parser.add_argument("--concurrency", type=int, choices=[1, 2, 4], default=2)
    parser.add_argument("--heap", action="store_true", help="also trace Python allocations; timing then includes tracing overhead")
    args = parser.parse_args()
    if not 1 <= args.rows <= 100000:
        parser.error("rows must be between 1 and 100000")
    if version("markitdown") not in VERIFIED_VERSIONS:
        parser.error("use a verified MarkItDown version for a valid before/after comparison")
    source = io.StringIO(newline="")
    writer = csv.writer(source)
    writer.writerow(["id", "name", "amount", "note"])
    for index in range(args.rows):
        writer.writerow([index, f"record-{index}", index * 3.5, 'generated café 日本語 🙂 | quoted "value"'])
    data = source.getvalue().encode()
    source.close()
    if len(data) > 15 * 1024 * 1024:
        raise ValueError("fixture exceeds the deployed standalone upload cap")
    engine = NormalConverter()
    if args.mode == "upstream":
        # Latest registration at equal priority runs first; all detection,
        # normalization and wrapper work remains the same in both modes.
        engine._md.register_converter(CsvConverter())
    engine.validate(data, "csv")
    gc.collect()
    before_peak = peak_rss_mib()
    if args.heap:
        tracemalloc.start()
    start = threading.Barrier(args.concurrency)
    def convert(_):
        start.wait(timeout=30)
        return engine.convert(data, "csv", filename="generated.csv", title="generated")[0]
    started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        outputs = list(pool.map(convert, range(args.concurrency)))
    elapsed = time.perf_counter() - started
    peak = peak_rss_mib()
    heap = tracemalloc.get_traced_memory()[1] / 1024**2 if args.heap else None
    if args.heap:
        tracemalloc.stop()
    assert all(output == outputs[0] for output in outputs)
    assert "record-0" in outputs[0] and f"record-{args.rows-1}" in outputs[0]
    print(json.dumps({"mode": args.mode, "python": sys.version.split()[0], "markitdown": version("markitdown"), "rows": args.rows, "input_bytes": len(data), "concurrency": args.concurrency, "seconds": round(elapsed, 4), "tracemalloc_enabled": args.heap, "peak_python_heap_MiB": round(heap, 2) if heap is not None else None, "process_peak_before_MiB": round(before_peak, 2), "process_peak_after_MiB": round(peak, 2), "output_bytes_each": len(outputs[0].encode()), "output_sha256": hashlib.sha256(outputs[0].encode()).hexdigest(), "first_and_last_record": True, "host_capacity_claim": False}))


if __name__ == "__main__":
    main()
