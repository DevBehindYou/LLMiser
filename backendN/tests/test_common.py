import io
import os
from pathlib import Path

import pytest

from app.common.errors import ConversionRejected
from app.common.files import read_limited, sanitize_filename, split_name, title_from_stem
from app.common.profiles import ensure_title, finalize_markdown


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("report.pdf", "report.pdf"),
        ("../../etc/passwd", "passwd"),
        ("C:\\Users\\x\\doc.docx", "doc.docx"),
        ('bad<>:"|?*name.txt', "badname.txt"),
        ("", "upload"),
        (None, "upload"),
        ("...", "upload"),
    ],
)
def test_sanitize_filename(raw, expected):
    assert sanitize_filename(raw) == expected


def test_sanitize_filename_bounds_length_and_keeps_extension():
    name = sanitize_filename("a" * 400 + ".pdf")
    assert len(name) == 255 and name.endswith(".pdf")


def test_split_name():
    assert split_name("Report.Final.PDF") == ("Report.Final", "pdf")
    assert split_name("noext") == ("noext", "")
    assert split_name("bashrc") == ("bashrc", "")


def test_title_from_stem():
    assert title_from_stem("quarterly_report-v2") == "Quarterly Report V2"


def test_read_limited():
    assert read_limited(io.BytesIO(b"abc"), 3) == b"abc"
    with pytest.raises(ConversionRejected) as too_big:
        read_limited(io.BytesIO(b"abcd"), 3)
    assert too_big.value.status_code == 413
    with pytest.raises(ConversionRejected) as empty:
        read_limited(io.BytesIO(b""), 3)
    assert empty.value.status_code == 400


def test_ensure_title_adds_missing_h1():
    assert ensure_title("body text", "My Doc") == "# My Doc\n\nbody text\n"


def test_ensure_title_keeps_existing_h1_and_spaces_it():
    assert ensure_title("# Existing\nbody", "Ignored") == "# Existing\n\nbody\n"


def test_finalize_counts_words_and_tokens():
    content, words, tokens = finalize_markdown(
        "one two three", title="T", original_name="t.txt", size_bytes=2048, engine="E"
    )
    assert "(2.0 KB) · **Engine:** E" in content
    assert words == len(content.split())
    assert tokens == round(words * 1.33)


def test_health_exposes_only_valid_provider_revision(client, monkeypatch):
    monkeypatch.delenv("RENDER_GIT_COMMIT", raising=False)
    monkeypatch.delenv("VERCEL_GIT_COMMIT_SHA", raising=False)
    assert client.get("/api/v1/health").json() == {"status": "ok", "role": "normal", "instance": "N1", "version": "test"}
    monkeypatch.setenv("RENDER_GIT_COMMIT", "a" * 40)
    monkeypatch.setenv("UNRELATED_SECRET", "do-not-expose")
    assert client.get("/api/v1/health").json() == {"status": "ok", "role": "normal", "instance": "N1", "version": "test", "revision": "a" * 40}


def test_deployment_revision_is_limited_to_provider_commit_identifiers(monkeypatch):
    from app.common.config import deployment_revision
    monkeypatch.delenv("RENDER_GIT_COMMIT", raising=False)
    monkeypatch.delenv("VERCEL_GIT_COMMIT_SHA", raising=False)
    monkeypatch.setenv("UNRELATED_SECRET", "do-not-expose")
    assert deployment_revision() is None
    monkeypatch.setenv("RENDER_GIT_COMMIT", "not-a-commit")
    assert deployment_revision() is None
    monkeypatch.setenv("VERCEL_GIT_COMMIT_SHA", "A" * 40)
    assert deployment_revision() == "a" * 40
    monkeypatch.setenv("RENDER_GIT_COMMIT", "b" * 40)
    assert deployment_revision() == "b" * 40


def test_common_package_in_sync_with_other_backends():
    here = Path(__file__).resolve().parents[1] / "app" / "common"
    root = here.parents[2]
    others = [root / name / "app" / "common" for name in ("backendN", "backendO", "backendZ") if name != here.parents[1].name]
    present = [there for there in others if there.exists()]
    if not present:
        pytest.skip("no other backend present")
    for there in present:
        backend = there.parents[1].name
        for path in sorted(here.glob("*.py")):
            twin = there / path.name
            assert twin.exists(), f"{twin} missing"
            assert path.read_bytes() == twin.read_bytes(), f"app/common/{path.name} differs from {backend}"
        assert {p.name for p in there.glob("*.py")} == {p.name for p in here.glob("*.py")}, backend


def test_load_local_env_keeps_process_values(tmp_path, monkeypatch):
    from app.common.config import load_local_env

    env = tmp_path / ".env"
    env.write_text('# comment\nMDIFY_T_A=one\nexport MDIFY_T_B="two words"\nMDIFY_T_C=from-file\n\nnot a line\n', encoding="utf-8")
    monkeypatch.delenv("MDIFY_T_A", raising=False)
    monkeypatch.delenv("MDIFY_T_B", raising=False)
    monkeypatch.setenv("MDIFY_T_C", "from-process")
    load_local_env(env)
    assert os.environ["MDIFY_T_A"] == "one"
    assert os.environ["MDIFY_T_B"] == "two words"
    assert os.environ["MDIFY_T_C"] == "from-process"
    load_local_env(tmp_path / "missing.env")  # no file: nothing happens
    monkeypatch.delenv("MDIFY_T_A")
    monkeypatch.delenv("MDIFY_T_B")
