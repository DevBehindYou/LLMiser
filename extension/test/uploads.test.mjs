import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertUpload, signedStorageUrl, APP_ORIGIN, STORAGE_ORIGIN } from '../src/uploads.js';

const id='12345678-1234-1234-1234-123456789abc';
const signed=(path,job=id)=>`${STORAGE_ORIGIN}/storage/v1/object/${path}/mdify-pro-files/jobs/${job}/`;
const upload=signed('upload/sign')+'input/source.txt?token=test-only';
const output=signed('sign')+'output/result.md?token=test-only';
const json=(value,status=200)=>Response.json(value,{status});
const file=()=>new File(['synthetic fixture'], 'sample.txt', {type:'text/plain'});

test('file conversion uses private signed storage and existing job APIs, with no cookies or redirects',async()=>{
  const calls=[];
  const result=await convertUpload(file(),'Clean',{fetchImpl:async(url,init)=>{
    calls.push({url,init});
    assert.equal(init.credentials,'omit'); assert.equal(init.redirect,'error');
    assert.equal(init.referrerPolicy,'no-referrer');
    assert.equal(new Headers(init.headers).has('authorization'),false);
    if(url.endsWith('/api/uploads/create')) return json({job_id:id,upload_url:upload},201);
    if(url===upload) { assert.equal(init.method,'PUT'); assert.ok(init.body instanceof FormData); return json({}); }
    if(url.endsWith('/start')) return json({status:'COMPLETED',source_type:'DOCUMENT',result:{download_url:output}});
    if(url===output) return new Response('# Converted 漢字🙂\n');
    throw new Error('Unexpected URL');
  }});
  assert.equal(calls.length,4); assert.equal(result.markdown,'# Converted 漢字🙂\n');assert.equal(result.mode,'file');
  assert.equal(calls[0].url,`${APP_ORIGIN}/api/uploads/create`);
  assert.equal(JSON.parse(calls[0].init.body).profile,'Clean');
});

test('unexpected storage hosts, job IDs, unsigned links and wrong buckets are rejected',()=>{
  for(const bad of [upload.replace(STORAGE_ORIGIN,'https://attacker.example'),upload.replace(id,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),upload.replace('?token=test-only',''),upload.replace('mdify-pro-files','other-bucket'),upload.replace('/input/','/output/')]) {
    assert.throws(()=>signedStorageUrl(bad,id,true));
  }
  assert.equal(signedStorageUrl(output,id),output);
});

test('invalid files and profiles make no requests; failed admission sends no bytes',async()=>{
  let requests=0;
  const fetchImpl=async()=>{requests++;return json({detail:'Busy. Retry later.'},503);};
  await assert.rejects(convertUpload(new File(['x'],'bad.exe'),'Standard',{fetchImpl}),/Unsupported/);
  await assert.rejects(convertUpload(file(),'not-a-profile',{fetchImpl}),/profile/);
  assert.equal(requests,0);
  await assert.rejects(convertUpload(file(),'Standard',{fetchImpl}),/Busy/);assert.equal(requests,1);
});

test('archive parts are fetched in order',async()=>{
  const first=signed('sign')+'output/project-part-001.md?token=test-only';
  const second=signed('sign')+'output/project-part-002.md?token=test-only';
  const result=await convertUpload(file(),'Standard',{fetchImpl:async url=>{
    if(url.endsWith('/api/uploads/create')) return json({job_id:id,upload_url:upload});
    if(url===upload) return json({});
    if(url.endsWith('/start')) return json({status:'COMPLETED',source_type:'ARCHIVE',result:{filename:'project.md',download_url:first,outputs:[{name:'project-part-002.md',url:second},{name:'project-part-001.md',url:first}]}});
    if(url===first) return new Response('# Project (part 1 of 2)\n\nFirst\n');
    if(url===second) return new Response('# Project (part 2 of 2)\n\nSecond\n');
    throw new Error('Unexpected URL');
  }});
  assert.match(result.markdown,/First\nSecond/);
});

test('a failed archive part never yields a partially successful result',async()=>{
  const first=signed('sign')+'output/project-part-001.md?token=test-only';
  const second=signed('sign')+'output/project-part-002.md?token=test-only';
  await assert.rejects(convertUpload(file(),'Standard',{fetchImpl:async url=>{
    if(url.endsWith('/api/uploads/create'))return json({job_id:id,upload_url:upload});
    if(url===upload)return json({});
    if(url.endsWith('/start'))return json({status:'COMPLETED',source_type:'ARCHIVE',result:{filename:'project.md',download_url:first,outputs:[{name:'project-part-001.md',url:first},{name:'project-part-002.md',url:second}]}});
    if(url===first)return new Response('# Project (part 1 of 2)\n\nFirst');
    return new Response('Unavailable',{status:503});
  }}),/Could not download/);
});

test('aborting stops requests and oversized results fail without silent truncation',async()=>{
  const controller=new AbortController();controller.abort();
  await assert.rejects(convertUpload(file(),'Standard',{signal:controller.signal,fetchImpl:async(_url,init)=>{
    assert.equal(init.signal.aborted,true);throw new DOMException('Aborted','AbortError');
  }}),{name:'AbortError'});
  await assert.rejects(convertUpload(file(),'Standard',{fetchImpl:async url=>{
    if(url.endsWith('/api/uploads/create'))return json({job_id:id,upload_url:upload});
    if(url===upload)return json({});
    if(url.endsWith('/start'))return json({status:'COMPLETED',result:{download_url:output}});
    return new Response('a'.repeat(500_001));
  }}),/too large/);
});
