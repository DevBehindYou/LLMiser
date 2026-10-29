from contextlib import contextmanager
import time
import pytest
from app import converter
from app.common import deadlines
from conftest import image_bytes

@contextmanager
def active(seconds):
    value=deadlines.Budget(time.monotonic()+seconds)
    token=deadlines._current.set(value)
    try: yield value
    finally: deadlines._current.reset(token)

def test_waiting_expired_ocr_does_not_decode(monkeypatch):
    monkeypatch.setattr(converter,'_open_checked',lambda *a:pytest.fail('expired OCR decoded image'))
    with active(-1),pytest.raises(deadlines.DeadlineExceeded):
        converter.OcrConverter().convert(image_bytes('PNG'),'png',filename='a.png',title='a')

def test_tesseract_timeout_preserves_result_save_reserve(monkeypatch):
    import pytesseract
    calls=[]
    def image_to_data(image,**kwargs):
        calls.append(kwargs['timeout'])
        return {'text':[],'conf':[],'block_num':[],'par_num':[],'line_num':[]}
    monkeypatch.setattr(pytesseract,'image_to_data',image_to_data)
    with active(15):
        converter.OcrConverter()._ocr(None,time.monotonic()+85)
    assert 0 < calls[0] <= 5

def test_ocr_budget_timeout_is_504_and_prepared_pixels_close(monkeypatch):
    prepared=[]
    original=converter._prepare
    def prepare(source):
        image=original(source)
        prepared.append(image)
        return image
    def recognize(*args):
        object.__setattr__(deadlines.current_budget(),'end',time.monotonic()-1)
        raise RuntimeError('Tesseract process timeout')
    engine=converter.OcrConverter()
    monkeypatch.setattr(converter,'_prepare',prepare)
    monkeypatch.setattr(engine,'_recognize',recognize)
    with active(60),pytest.raises(deadlines.DeadlineExceeded):
        engine.convert(image_bytes('PNG'),'png',filename='a.png',title='a')
    with pytest.raises(ValueError,match='closed'):
        prepared[0].getpixel((0,0))
