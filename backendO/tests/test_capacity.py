"""Decoded images must share the same process capacity as OCR."""

from concurrent.futures import ThreadPoolExecutor
import threading

import pytest
from PIL import Image

import app.converter as converter
from app.common.errors import ConversionRejected, EngineUnavailable
from conftest import image_bytes


def _convert(engine, data):
    return engine.convert(data, "png", filename="scan.png", title="scan")


def _assert_closed(image):
    with pytest.raises(ValueError, match="closed"):
        image.getpixel((0, 0))


def test_waiting_conversion_cannot_prepare_during_recognition(monkeypatch):
    first_recognizing = threading.Event()
    second_waiting = threading.Event()
    release_first = threading.Event()
    prepared_images = []

    class ObservedLock:
        def __init__(self):
            self.lock = threading.Lock()

        def __enter__(self):
            if first_recognizing.is_set():
                second_waiting.set()
            self.lock.acquire()

        def __exit__(self, *args):
            self.lock.release()

    prepare = converter._prepare

    def track_prepare(source):
        image = prepare(source)
        prepared_images.append(image)
        return image

    def recognize(image):
        if not first_recognizing.is_set():
            first_recognizing.set()
            assert release_first.wait(5), "test did not release first OCR job"
        # Prepared pixels must remain available until recognition finishes.
        assert image.getpixel((0, 0)) == 255
        return "recognized text", 0

    monkeypatch.setattr(converter, "_OCR_LOCK", ObservedLock())
    monkeypatch.setattr(converter, "_prepare", track_prepare)
    engine = converter.OcrConverter()
    monkeypatch.setattr(engine, "_recognize", recognize)
    data = image_bytes("PNG")
    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(_convert, engine, data)
        try:
            assert first_recognizing.wait(5)
            second = pool.submit(_convert, engine, data)
            assert second_waiting.wait(5)
            assert len(prepared_images) == 1
            assert not second.done()
        finally:
            release_first.set()
        assert first.result(timeout=5) == ("recognized text", None)
        assert second.result(timeout=5) == ("recognized text", None)
    assert len(prepared_images) == 2
    for image in prepared_images:
        _assert_closed(image)


@pytest.mark.parametrize("outcome", ["success", "no-text", "timeout", "missing-engine", "other-error"])
def test_prepared_pixels_and_capacity_released_after_recognition(monkeypatch, outcome):
    import pytesseract

    prepared = Image.new("L", (10, 10), 255)
    lock = threading.Lock()
    monkeypatch.setattr(converter, "_OCR_LOCK", lock)
    monkeypatch.setattr(converter, "_prepare", lambda source: prepared)
    engine = converter.OcrConverter()

    def recognize(image):
        assert image.getpixel((0, 0)) == 255
        if outcome == "timeout":
            raise RuntimeError("Tesseract process timeout")
        if outcome == "missing-engine":
            raise pytesseract.TesseractNotFoundError()
        if outcome == "other-error":
            raise RuntimeError("unexpected OCR failure")
        return ("" if outcome == "no-text" else "recognized text"), 0

    monkeypatch.setattr(engine, "_recognize", recognize)
    if outcome in ("success", "no-text"):
        result = _convert(engine, image_bytes("PNG"))
        assert result == (("recognized text", None) if outcome == "success" else
                          ("_No text detected in this image._", "no-text-detected"))
    else:
        expected = {"timeout": ConversionRejected, "missing-engine": EngineUnavailable,
                    "other-error": RuntimeError}[outcome]
        with pytest.raises(expected) as error:
            _convert(engine, image_bytes("PNG"))
        if outcome == "timeout":
            assert error.value.code == "ocr_timeout"
    _assert_closed(prepared)
    assert lock.acquire(blocking=False)
    lock.release()


def test_decode_failure_closes_source_and_releases_capacity(monkeypatch):
    lock = threading.Lock()
    monkeypatch.setattr(converter, "_OCR_LOCK", lock)
    opened_images = []
    open_checked = converter._open_checked

    def track_open(data, ext):
        source = open_checked(data, ext)
        opened_images.append(source)
        return source

    def fail_decode(source):
        raise OSError("broken pixel data")

    monkeypatch.setattr(converter, "_open_checked", track_open)
    monkeypatch.setattr(converter, "_prepare", fail_decode)
    with pytest.raises(ConversionRejected) as error:
        _convert(converter.OcrConverter(), image_bytes("PNG"))
    assert error.value.code == "decode_failed"
    _assert_closed(opened_images[0])
    assert lock.acquire(blocking=False)
    lock.release()


def test_validation_reads_headers_without_loading_pixels_or_taking_capacity(monkeypatch):
    data = image_bytes("PNG")

    def fail_load(*args, **kwargs):
        pytest.fail("validation decoded pixels")

    class UnavailableLock:
        def __enter__(self):
            pytest.fail("validation took OCR capacity")

    monkeypatch.setattr(Image.Image, "load", fail_load)
    monkeypatch.setattr(converter, "_OCR_LOCK", UnavailableLock())
    converter.OcrConverter().validate(data, "png")
