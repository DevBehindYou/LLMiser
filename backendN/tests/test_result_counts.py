"""Final result statistics must retain Python's whitespace/token semantics."""
import random

import pytest
from app.common import profiles


@pytest.mark.parametrize("chunk_size", [1, 2, 7, 65536])
def test_chunk_boundaries_match_native_split(monkeypatch, chunk_size):
    monkeypatch.setattr(profiles, "COUNT_CHUNK_CHARS", chunk_size)
    rng = random.Random(20261028)
    alphabet = "abc 日本語🙂\r\n\t\v\f\x1c\x1d\x1e\x1f\x85\u00a0\u1680\u2000\u2028\u2029\u202f\u205f\u3000\ufeff"
    for text in ["", " ", "x" * 100, "a b", "\r\n", *["".join(rng.choice(alphabet) for _ in range(200)) for _ in range(100)]]:
        assert profiles.count_words(text) == len(text.split())


def test_large_unicode_result_and_unbroken_line_keep_complete_counts():
    for text in [("Unicode 日本語 🙂 and café\n" * 100000), "word" * 300000, " " * 100000]:
        assert profiles.count_words(text) == len(text.split())


@pytest.mark.parametrize("profile", profiles.PROFILES)
def test_profile_content_words_and_tokens_match_original(monkeypatch, profile):
    text = "# Report\n\n## Details\n\n" + ("word 日本語 🙂\x1c next\n" * 5000)
    actual = profiles.finalize_markdown(text, title="Report", original_name="generated.xlsx", size_bytes=42, engine="MarkItDown", profile=profile)
    monkeypatch.setattr(profiles, "count_words", lambda content: len(content.split()))
    expected = profiles.finalize_markdown(text, title="Report", original_name="generated.xlsx", size_bytes=42, engine="MarkItDown", profile=profile)
    assert actual == expected
