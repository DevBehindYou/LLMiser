import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareUploads } from '../lib/models/quotaClient.js';
test('denied batch uploads no file bytes and preserves structured shortage', async () => {
  const calls=[];
  await assert.rejects(prepareUploads([new File(['fixture'],'a.txt')],'Standard',{fetchImpl:async (url,init)=>{
    calls.push(url);
    if(url==='/api/quota') return Response.json({enabled:true});
    assert.equal(init.credentials,'include');
    assert.equal(JSON.parse(init.body).files.length,1);
    return Response.json({code:'DAILY_FILE_LIMIT',remaining:0,detail:'Remove files'},{status:429});
  }}),error=>error.code==='DAILY_FILE_LIMIT');
  assert.deepEqual(calls,['/api/quota','/api/uploads/reserve']);
});
test('disabled quota leaves the existing transport intact',async()=>{
  const result=await prepareUploads([new File(['x'],'a.txt')],'Standard',{fetchImpl:async()=>Response.json({enabled:false})});
  assert.deepEqual(result.reservations,[null]);
});
