// Exercise the shipped handlers. Only adapt Next's extensionless imports for
// Node's test runner; the handler and its admission/dispatch code stay intact.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function route(name) {
  const url=new URL(`../app/api/${name}/route.js`,import.meta.url);
  const source=fs.readFileSync(url,'utf8').replace(/from '([^']+)'/g,(_,specifier)=>{
    const resolved=specifier==='next/server' ? new URL('../node_modules/next/server.js',import.meta.url) : new URL(specifier+'.js',url);
    return `from '${resolved.href}'`;
  });
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const lease='00000000-0000-4000-8000-000000000001';
const params={params:{id:'00000000-0000-4000-8000-000000000002'}};
async function isolated(run) {
  const keys=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','BACKEND_SHARED_SECRET','NODE_ENV','VERCEL','NORMAL_BACKEND_URLS'];
  const before=Object.fromEntries(keys.map(k=>[k,process.env[k]])); const oldFetch=globalThis.fetch;
  Object.assign(process.env,{SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test-only-key',BACKEND_SHARED_SECRET:'test-only-secret',NODE_ENV:'production',VERCEL:'1',NORMAL_BACKEND_URLS:'http://backend.test'});
  try { await run(); }
  finally {globalThis.fetch=oldFetch; for(const k of keys) {if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];}}
}
const json=(body,status=200)=>Response.json(body,{status});
const uploadRequest=(body)=>new Request('https://mdify.test',{method:'POST',headers:{'content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1'},body});
function multipart() {
  const form=new FormData(); form.append('file',new File(['synthetic text'],'fixture.txt')); form.append('profile','Standard');
  return new Request('https://mdify.test',{method:'POST',headers:{'x-vercel-forwarded-for':'192.0.2.1'},body:form});
}

test('every public work route denies requests before reading bodies or reaching storage/backends',async()=>isolated(async()=>{
  const actions=[];
  globalThis.fetch=async(url,init)=>{
    assert.equal(url,'https://db.test/rest/v1/rpc/admit_public_request');
    const body=JSON.parse(init.body); actions.push(body.p_action); assert.match(body.p_client_hash,/^[a-f0-9]{64}$/);
    return json({allowed:false,status:429,retry_after:10});
  };
  for(const name of ['uploads/create','convert','jobs/[id]/start','jobs/[id]/advance','wake']) {
    const request={headers:new Headers({'x-vercel-forwarded-for':'192.0.2.1'}),get body(){assert.fail('Rejected body was read');}};
    const response=await (await route(name)).POST(request,params);
    assert.equal(response.status,429,name); assert.equal(response.headers.get('retry-after'),'10');
  }
  assert.deepEqual(actions,['upload','convert','start','advance','wake']);
}));

test('saved-result downloads re-sign all outputs and only redirect to a registered output', async () => isolated(async () => {
  const handler = await route('jobs/[id]/download');
  let deleted = false; let processing = false;
  const signed = [];
  globalThis.fetch = async (url, init) => {
    if (url.includes('/rest/v1/jobs?')) return json([{ job_id: params.params.id, status: deleted ? 'DELETED' : processing ? 'PROCESSING' : 'COMPLETED', source_type: 'ARCHIVE', files_deleted_at: deleted ? '2026-10-21T00:00:00Z' : null }]);
    if (url.includes('/rest/v1/file_objects?')) return json([{ file_id: 'registered' }]);
    if (url.includes('/rest/v1/work_items?')) return json([{ result: {
      filename: 'project.md', primary_output: 'jobs/output/part-1.md', outputs: [
        { name: 'project-part-001.md', path: 'jobs/output/part-1.md' },
        { name: 'project-part-002.md', path: 'jobs/output/part-2.md' },
        { name: 'PROJECT_INDEX.md', path: 'jobs/output/index.md' },
        { name: 'manifest.json', path: 'jobs/output/manifest.json' },
      ],
    } }]);
    assert.match(url, /\/storage\/v1\/object\/sign\//);
    assert.equal(JSON.parse(init.body).expiresIn, 600);
    signed.push(url);
    return json({ signedURL: '/object/sign/test-bucket/output?token=fresh' });
  };
  const endpoint = `https://llmiser.test/api/jobs/${params.params.id}/download`;
  const response = await handler.GET(new Request(endpoint), params);
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.source_type, 'ARCHIVE'); assert.equal(body.result.outputs.length, 4);
  assert.equal(body.download_url, body.result.download_url, 'legacy primary-link response stays supported');
  assert.equal(signed.length, 4); assert.doesNotMatch(JSON.stringify(body), /jobs\/output/);
  const named = await handler.GET(new Request(endpoint + '?output=manifest.json'), params);
  assert.equal(named.status, 307); assert.match(named.headers.get('location'), /download=manifest.json/);
  assert.equal(named.headers.get('cache-control'), 'no-store');
  assert.equal(signed.length, 5, 'a named download signs only the selected output');
  const unknown = await handler.GET(new Request(endpoint + '?output=https%3A%2F%2Fevil.test'), params);
  assert.equal(unknown.status, 404); assert.equal(unknown.headers.get('location'), null);
  assert.equal(signed.length, 5, 'unknown outputs do not create any signed links');
  deleted = true;
  const gone = await handler.GET(new Request(endpoint), params);
  assert.equal(gone.status, 410); assert.equal(gone.headers.get('cache-control'), 'no-store');
  deleted = false; processing = true;
  assert.equal((await handler.GET(new Request(endpoint), params)).status, 409);
}));

test('missing admission migration returns a safe 503 without multipart fallback or dispatch',async()=>isolated(async()=>{
  let calls=0; globalThis.fetch=async()=>{calls++;return json({message:'private database failure'},404);};
  const response=await(await route('uploads/create')).POST(uploadRequest('{}'));
  assert.equal(response.status,503); assert.doesNotMatch(await response.text(),/private/); assert.equal(calls,1);
}));

test('upload JSON is bounded and rejects null/arrays before creating any rows',async()=>isolated(async()=>{
  let calls=0; globalThis.fetch=async(url)=>{calls++;assert.match(url,/admit_public_request$/);return json({allowed:true,lease_id:null});};
  for(const body of ['null','[]','{bad']) assert.equal((await(await route('uploads/create')).POST(uploadRequest(body))).status,400);
  assert.equal((await(await route('uploads/create')).POST(uploadRequest('x'.repeat(8193)))).status,413);
  assert.equal(calls,4);
}));

test('multipart validation errors release their lease before returning',async()=>isolated(async()=>{
  const calls=[]; globalThis.fetch=async(url)=>{calls.push(url);return json(url.endsWith('admit_public_request')?{allowed:true,lease_id:lease}:true);};
  const response=await(await route('convert')).POST(uploadRequest('{}'));
  assert.equal(response.status,400); assert.equal(calls.length,2); assert.match(calls[1],/release_public_multipart$/);
}));

test('successful multipart dispatch releases the lease; timeout retains it for expiry',async()=>isolated(async()=>{
  const handler=await route('convert'); let timeout=false; const calls=[];
  globalThis.fetch=async(url)=>{
    calls.push(url);
    if(url.endsWith('admit_public_request'))return json({allowed:true,lease_id:lease});
    if(url.endsWith('release_public_multipart'))return json(true);
    assert.match(url,/internal\/convert$/);
    if(timeout)throw new DOMException('timed out','TimeoutError');
    return json({filename:'fixture.md',content:'synthetic text'});
  };
  assert.equal((await handler.POST(multipart())).status,200); assert.match(calls.at(-1),/release_public_multipart$/);
  calls.length=0; timeout=true;
  assert.equal((await handler.POST(multipart())).status,504); assert.equal(calls.length,2);
  assert.ok(calls.every(url=>!url.endsWith('release_public_multipart')));
}));

test('a successful peer retry conservatively retains the lease for the uncertain first attempt',async()=>isolated(async()=>{
  process.env.NORMAL_BACKEND_URLS='http://backend.test,http://peer.test';
  let attempts=0;let released=false;
  globalThis.fetch=async(url)=>{
    if(url.endsWith('admit_public_request'))return json({allowed:true,lease_id:lease});
    if(url.endsWith('release_public_multipart')){released=true;return json(true);}
    attempts++;return attempts===1?json({detail:'upstream failed'},502):json({filename:'fixture.md',content:'synthetic text'});
  };
  assert.equal((await(await route('convert')).POST(multipart())).status,200);
  assert.equal(attempts,2);assert.equal(released,false);
}));

test('full or missing active-job admission returns safe Retry-After without signing an upload',async()=>isolated(async()=>{
 const handler=await route('uploads/create');
 for(const unavailable of [false,true]){
  const calls=[];
  globalThis.fetch=async(url)=>{
   calls.push(url);
   if(url.endsWith('admit_public_request'))return json({allowed:true,lease_id:null});
   if(url.endsWith('create_reserved_upload_job'))return unavailable?json({message:'private missing function'},404):json({allowed:false,retry_after:30});
   assert.fail('Unexpected Storage or database call: '+url);
  };
  const res=await handler.POST(uploadRequest(JSON.stringify({filename:'fixture.txt',size:12})));
  assert.equal(res.status,503);assert.equal(res.headers.get('Retry-After'),'30');
  assert.equal(res.headers.get('Cache-Control'),'no-store');assert.doesNotMatch(await res.text(),/private/);
  assert.ok(calls.some(u=>u.endsWith('create_reserved_upload_job')));
 }
}));
