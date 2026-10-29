import time
import pytest
from app import archive
from app.common.deadlines import current_budget
from test_archive_tasks import HEADERS,PROCESS,process_body,upload

def test_archive_expiry_is_not_hidden_as_one_bad_document(client,storage,converter,monkeypatch):
    original = converter.documents.__class__.__call__
    calls=[]
    def convert(self,*args):
        calls.append(True)
        text=original(self,*args)
        object.__setattr__(current_budget(),'end',time.monotonic()-1)
        return text
    monkeypatch.setattr(converter.documents.__class__,'__call__',convert)
    job=upload(storage,{'first.html':'<h1>Complete first</h1>','second.html':'<h1>Complete second</h1>'})
    response=client.post(PROCESS,headers={**HEADERS,'X-LLMiser-Deadline-Ms':str(int((time.time()+60)*1000))},json=process_body(job))
    assert response.status_code == 504
    assert len(calls) == 1
    assert not any('/output/' in name for name in storage.objects)

@pytest.mark.parametrize('endpoint',[PROCESS,'/api/v1/internal/archive/merge'])
def test_archive_expired_requests_fail_before_storage(client,storage,endpoint):
    job=upload(storage,{'note.txt':'complete'})
    body=process_body(job)
    if endpoint.endswith('merge'):
        body.update(partial_paths=[f'jobs/{job}/nodes/one/partial.json'],ocr=[])
    previous=dict(storage.objects)
    response=client.post(endpoint,headers={**HEADERS,'X-LLMiser-Deadline-Ms':'1'},json=body)
    assert response.status_code == 504
    assert storage.objects == previous
