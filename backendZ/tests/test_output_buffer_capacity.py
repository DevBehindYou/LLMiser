"""Bound encoded output buffers while preserving preflight and full bytes."""
from types import SimpleNamespace
import threading
import time

from app import archive, archive_tasks


def test_final_upload_encoding_is_bounded_by_worker_capacity(monkeypatch):
    counts = {"live": 0, "peak": 0}
    lock = threading.Lock()
    class Payload(bytes):
        def __new__(cls, value):
            instance = super().__new__(cls, value)
            with lock:
                counts["live"] += 1
                counts["peak"] = max(counts["peak"], counts["live"])
            return instance
        def __del__(self):
            with lock:
                counts["live"] -= 1
    class Text(str):
        def encode(self, *args, **kwargs):
            return Payload(super().encode(*args, **kwargs))
    parts = [Text(f"part-{i}-日本語🙂") for i in range(10)]
    monkeypatch.setattr(archive, "split_parts", lambda *args: parts)
    monkeypatch.setattr(archive, "project_index", lambda *args: Text("INDEX-日本語"))
    monkeypatch.setattr(archive, "manifest", lambda *args: Text('{"value":"🙂"}'))
    written = {}
    class Store:
        def upload(self, path, data, content_type):
            assert isinstance(data, bytes)
            assert counts["live"] <= archive_tasks.WORKERS
            time.sleep(.01)
            with lock:
                written[path] = (data.decode(), len(data))
    result = archive_tasks.write_outputs(Store(), job_id="job", name="project.zip", profile="Standard", source_bytes=42, entries=[], ocr_texts={}, settings=SimpleNamespace(role="archive", instance="test"))
    assert len(written) == 12
    assert counts["live"] == 0
    assert counts["peak"] <= archive_tasks.WORKERS
    assert result["output_bytes"] == sum(size for text, size in written.values())
    for record in result["outputs"]:
        assert record["bytes"] == written[record["path"]][1]
    for index, part in enumerate(parts, start=1):
        assert written[f"jobs/job/output/combined-{index:03d}.md"][0] == part
