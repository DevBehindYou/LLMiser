"""Synthetic buffer-pressure comparison, not PDF fidelity or host capacity."""
from pathlib import Path
import ctypes
from concurrent.futures import ThreadPoolExecutor
import importlib.metadata
import json
import subprocess
import sys
import threading
import time
import types
import uuid

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'backendN'))
baseline = 'f596a2fa74050e7185d63294a421972e42f73d2b'
mode = sys.argv[1] if len(sys.argv) > 1 else 'current'
if mode not in ('baseline', 'current'):
    raise SystemExit('usage: pdf_buffer_bench.py [baseline|current]')
if mode == 'baseline':
    source = subprocess.check_output(['git', '-C', str(root), 'show', baseline + ':backendN/app/pdf_tasks.py'], text=True, encoding='utf-8')
else:
    source = (root / 'backendN/app/pdf_tasks.py').read_text(encoding='utf-8')
module = types.ModuleType('pdf_buffer_bench_tasks')
sys.modules[module.__name__] = module
exec(compile(source, 'bench_pdf_tasks.py', 'exec'), module.__dict__)
import pypdfium2
from fastapi.testclient import TestClient
from app.common.app_factory import create_app
from app.common.config import Settings

class Pdf:
    def __init__(self, data): pass
    def close(self): pass

pypdfium2.PdfDocument = Pdf
module.classify_pages = lambda pdf: [module.PageInfo(n, 0, 1) for n in range(1, 7)]
module.render_page_png = lambda pdf, number: b'x' * (4 * 1024 * 1024)

class Converter:
    def validate(self, data, ext): pass

class Store:
    def __init__(self):
        self.barrier = threading.Barrier(2)
        self.bytes = 0
        self.writes = 0
        self.lock = threading.Lock()
    def download(self, *args):
        self.barrier.wait(timeout=10)
        return b'%PDF-synthetic'
    def upload(self, path, body, content_type):
        time.sleep(.02)  # Keep concurrent payloads alive for a slow write.
        with self.lock:
            self.bytes += len(body)
            self.writes += 1

def peak_rss_mib():
    if sys.platform != 'win32':
        import resource
        value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        return value / (1024**2 if sys.platform == 'darwin' else 1024)
    from ctypes import wintypes
    class Memory(ctypes.Structure):
        _fields_ = [(name, wintypes.DWORD) for name in ['cb', 'PageFaultCount']] + [(name, ctypes.c_size_t) for name in ['PeakWorkingSetSize', 'WorkingSetSize', 'QuotaPeakPagedPoolUsage', 'QuotaPagedPoolUsage', 'QuotaPeakNonPagedPoolUsage', 'QuotaNonPagedPoolUsage', 'PagefileUsage', 'PeakPagefileUsage']]
    counters = Memory()
    counters.cb = ctypes.sizeof(counters)
    fn = ctypes.windll.psapi.GetProcessMemoryInfo
    fn.argtypes = [wintypes.HANDLE, ctypes.POINTER(Memory), wintypes.DWORD]
    assert fn(wintypes.HANDLE(-1), ctypes.byref(counters), counters.cb)
    return counters.PeakWorkingSetSize / 1024**2

store = Store()
settings = Settings(role='normal', instance='local-bench', shared_secret='test-only-secret', max_upload_bytes=15*1024*1024, version='synthetic')
app = create_app(settings, Converter(), storage=store)
module.register(app)
def run(_):
    job = str(uuid.uuid4())
    with TestClient(app) as client:
        response = client.post('/api/v1/internal/pdf/analyze', headers={'X-Internal-Secret': 'test-only-secret'}, json={'job_id': job, 'input_path': f'jobs/{job}/input/source.pdf', 'output_path': f'jobs/{job}/output/result.md', 'original_filename': 'synthetic.pdf'})
        assert response.status_code == 200, response.text
        assert len(response.json()['scans']) == 6

started = time.perf_counter()
with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(run, range(2)))
elapsed = time.perf_counter() - started
assert store.writes == 12 and store.bytes == 48*1024*1024
print(json.dumps({'mode': mode, 'baseline_revision': baseline, 'python': sys.version.split()[0], 'fastapi': importlib.metadata.version('fastapi'), 'pypdfium2': importlib.metadata.version('pypdfium2'), 'fixture': 'synthetic 6 x 4MiB page payloads, 20ms discard writes, two synchronized requests; fake native PDF decoder', 'concurrency': 2, 'writes': store.writes, 'bytes': store.bytes, 'wall_seconds': round(elapsed, 4), 'peak_process_RSS_MiB': round(peak_rss_mib(), 2), 'capacity_claim': False}))
