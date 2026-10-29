from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import time
import threading
from types import SimpleNamespace
import uuid

from fastapi.testclient import TestClient
import httpx
import pytest

from app.common import deadlines as budget
from app.common.app_factory import create_app
from app.common.config import Settings
from app.common.storage import StorageClient
from conftest import SECRET

HEADER = 'X-LLMiser-Deadline-Ms'
def headers(seconds=60):
    return {'X-Internal-Secret':SECRET, HEADER:str(int((time.time()+seconds)*1000))}

@contextmanager
def active(seconds=60):
    value = budget.Budget(time.monotonic()+seconds)
    token = budget._current.set(value)
    try: yield value
    finally: budget._current.reset(token)

def expire(value):
    object.__setattr__(value,'end',time.monotonic()-1)

@pytest.mark.parametrize('raw',['','abc','-1','1.5','1e13','9'*17])
def test_invalid_deadline_is_authenticated_before_validation(client,raw):
    form = {'files':{'file':('a.txt',b'complete text')}}
    response = client.post('/api/v1/internal/convert',headers={'X-Internal-Secret':'wrong',HEADER:raw},**form)
    assert response.status_code == 401
    response = client.post('/api/v1/internal/convert',headers={'X-Internal-Secret':SECRET,HEADER:raw},**form)
    assert response.status_code == 400

def test_expired_deadline_does_not_call_converter(client,monkeypatch):
    monkeypatch.setattr(client.app.state.converter,'convert',lambda *a,**k:pytest.fail('expired parser started'))
    result = client.post('/api/v1/internal/convert',headers=headers(-1),files={'file':('a.txt',b'text')})
    assert result.status_code == 504
    assert result.headers['X-LLMiser-Deadline-Exceeded'] == '1'

def test_missing_deadline_and_valid_deadline_produce_identical_complete_results(client):
    results = [client.post('/api/v1/internal/convert',headers=h,files={'file':('a.txt','complete café 日本語 🙂'.encode())}).json() for h in [{'X-Internal-Secret':SECRET},headers()]]
    for key in ['content','filename','word_count','tokens_est']:
        assert results[0][key] == results[1][key]
    assert budget.current_budget() is None

def test_parse_consuming_budget_cannot_write_or_report_success():
    writes=[]
    def convert(*args,**kwargs):
        assert budget.current_budget() is not None # ASGI → sync worker propagation
        expire(budget.current_budget())
        return 'complete output',None
    engine=SimpleNamespace(engine_name='test',extensions={'txt'},validate=lambda *a:None,convert=convert)
    store=SimpleNamespace(download=lambda *a:b'text',upload=lambda *a:writes.append(a))
    settings=Settings(role='normal',instance='test',shared_secret=SECRET,max_upload_bytes=100,version='test')
    client=TestClient(create_app(settings,engine,storage=store))
    job=str(uuid.uuid4())
    response=client.post('/api/v1/internal/process',headers=headers(),json={'job_id':job,'input_path':f'jobs/{job}/input/source.txt','output_path':f'jobs/{job}/output/result.md','original_filename':'a.txt'})
    assert response.status_code == 504
    assert writes == []

def test_upload_workers_inherit_budget_and_do_not_leak_it():
    with active() as value, ThreadPoolExecutor(max_workers=2) as pool:
        assert list(pool.map(budget.budgeted_worker(lambda n:budget.current_budget()),range(6))) == [value]*6
        expire(value)
        with pytest.raises(budget.DeadlineExceeded):
            list(pool.map(budget.budgeted_worker(lambda n:pytest.fail('expired upload started')),range(6)))
    assert budget.current_budget() is None


def test_concurrent_requests_have_independent_budgets():
    barrier=threading.Barrier(2)
    seen=[]
    def convert(*args,**kwargs):
        value=budget.current_budget()
        barrier.wait(timeout=5)
        seen.append(value.remaining())
        return 'complete',None
    engine=SimpleNamespace(engine_name='test',extensions={'txt'},validate=lambda *a:None,convert=convert)
    settings=Settings(role='normal',instance='test',shared_secret=SECRET,max_upload_bytes=100,version='test')
    client=TestClient(create_app(settings,engine))
    def post(seconds):
        return client.post('/api/v1/internal/convert',headers=headers(seconds),files={'file':('a.txt',b'text')}).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert list(pool.map(post,[60,120])) == [200,200]
    assert min(seen) < 90 < max(seen)
    assert budget.current_budget() is None

def test_storage_timeout_shrinks_and_drip_read_checks_total_budget():
    with active(2) as value:
        class Stream(httpx.SyncByteStream):
            def __iter__(self):
                yield b'first'
                expire(value)
                yield b'last'
        def handler(request):
            assert all(0 < seconds <= 2 for seconds in request.extensions['timeout'].values())
            return httpx.Response(200,stream=Stream())
        store=StorageClient('https://storage.test','test','test',transport=httpx.MockTransport(handler))
        with pytest.raises(budget.DeadlineExceeded):
            store.download(f'jobs/{uuid.uuid4()}/input/source.txt',100)


def test_slow_upload_deadline_is_not_reported_as_storage_success():
    with active(60) as value:
        def handler(request):
            expire(value)
            return httpx.Response(200,json={})
        store=StorageClient('https://storage.test','test','test',transport=httpx.MockTransport(handler))
        with pytest.raises(budget.DeadlineExceeded):
            store.upload(f'jobs/{uuid.uuid4()}/output/result.md',b'complete','text/markdown')


def test_deadline_io_timeout_retains_deadline_marker_instead_of_peer_failover():
    with active(60) as value:
        def handler(request):
            expire(value)
            raise httpx.ReadTimeout('generated deadline timeout',request=request)
        store=StorageClient('https://storage.test','test','test',transport=httpx.MockTransport(handler))
        with pytest.raises(budget.DeadlineExceeded):
            store.download(f'jobs/{uuid.uuid4()}/input/source.txt',100)

def test_far_future_budget_is_clamped_and_duplicate_headers_rejected(client,monkeypatch):
    def convert(*a,**k):
        assert 0 < budget.current_budget().remaining() <= 300
        return 'complete',None
    monkeypatch.setattr(client.app.state.converter,'convert',convert)
    result=client.post('/api/v1/internal/convert',headers={'X-Internal-Secret':SECRET,HEADER:'9'*16},files={'file':('a.txt',b'text')})
    assert result.status_code == 200
    result=client.post('/api/v1/internal/convert',headers=[('X-Internal-Secret',SECRET),(HEADER,'1'),(HEADER,'2')],files={'file':('a.txt',b'text')})
    assert result.status_code == 400
