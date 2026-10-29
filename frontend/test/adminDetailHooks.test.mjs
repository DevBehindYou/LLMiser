import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { adminApi } from '../lib/models/adminApi.js';
import { readDictionaries } from '../scripts/check-i18n.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const directory = fs.mkdtempSync(path.join(root,'.locale-runtime-'));
after(()=>{assert.equal(path.dirname(directory),root);fs.rmSync(directory,{recursive:true,force:true});});
const require = createRequire(import.meta.url);
const { transform } = require('next/dist/build/swc');
const sources = ['components/i18n/I18nContext','viewmodels/useAdminViewModel','components/admin/JobDetail','components/admin/ContentTreeView','components/admin/ui'];
const targets = new Map(sources.map((source,i)=>[fileURLToPath(new URL(`../${source}.js`,import.meta.url)),path.join(directory,`${i}.mjs`)]));
for(const [input,output] of targets) {
  const source=fs.readFileSync(input,'utf8').replace(/from\s*(['"])(\.[^'"]+)\1/g,(_match,_quote,specifier)=>{
    const resolved=path.resolve(path.dirname(input),specifier.endsWith('.js')?specifier:`${specifier}.js`);
    return `from ${JSON.stringify(pathToFileURL(targets.get(resolved)||resolved).href)}`;
  });
  const compiled=await transform(source,{filename:input,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'es6'}});
  fs.writeFileSync(output,compiled.code);
}
const [contextModule,hookModule,detailModule]=await Promise.all([0,1,2].map(i=>import(pathToFileURL(path.join(directory,`${i}.mjs`)))));
const { I18nContext }=contextModule;
const { useAdminJobDetailViewModel }=hookModule;
const { DetailPageControl }=detailModule;
const noop=()=>{}, options={handleError:()=>false,notify:noop,onChanged:noop};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const makeDetail=jobId=>({job:{job_id:jobId},files:[],nodes:[],items:[],events:[],pages:Object.fromEntries(['files','nodes','items','events'].map(s=>[s,{total:2,next:`${jobId}-${s}`}]))});

test('real controller hook ignores stale jobs/refreshes and isolates concurrent section loading and retry',async t=>{
  const originalJob=adminApi.job,originalPage=adminApi.jobPage;
  const jobs=[],pages=[];
  adminApi.job=(id,signal)=>{const request={id,signal,...deferred()};jobs.push(request);return request.promise;};
  adminApi.jobPage=(id,section,params,signal)=>{const request={id,section,params,signal,...deferred()};pages.push(request);return request.promise;};
  let vm,renderer;
  function Probe({id}){vm=useAdminJobDetailViewModel(id,options);return null;}
  t.after(()=>{act(()=>renderer?.unmount());adminApi.job=originalJob;adminApi.jobPage=originalPage;});
  act(()=>{renderer=create(React.createElement(Probe,{id:'a'}));});
  act(()=>renderer.update(React.createElement(Probe,{id:'b'})));
  assert.ok(jobs[0].signal.aborted);
  await act(async()=>{jobs[1].resolve(makeDetail('b'));});
  await act(async()=>{jobs[0].resolve(makeDetail('a'));});
  assert.equal(vm.detail.job.job_id,'b');
  let first,duplicate,independent;
  act(()=>{first=vm.loadMore('files');duplicate=vm.loadMore('files');independent=vm.loadMore('events');});
  assert.equal(pages.length,2,'same-section duplicate click must issue one request');
  assert.ok(vm.pageState.files.loading && vm.pageState.events.loading);
  await act(async()=>{pages[0].reject(new Error('offline'));await first;await duplicate;});
  assert.equal(vm.pageState.files.error,'offline');
  assert.ok(vm.pageState.events.loading);
  await act(async()=>{pages[1].resolve({section:'events',rows:[{event_id:'event-b'}],total:2,next:null});await independent;});
  assert.equal(vm.detail.events[0].event_id,'event-b');
  let retry;
  act(()=>{retry=vm.loadMore('files');});
  assert.equal(vm.pageState.files.error,null);
  let refresh;
  act(()=>{refresh=vm.reload();});
  assert.ok(pages[2].signal.aborted);
  await act(async()=>{jobs[2].resolve(makeDetail('b'));await refresh;});
  await act(async()=>{pages[2].resolve({section:'files',rows:[{file_id:'stale'}],total:2,next:null});await retry;});
  assert.deepEqual(vm.detail.files,[],'a refresh replaces all four sections and discards stale pages');
  let more;
  act(()=>{more=vm.loadMore('nodes');});
  act(()=>renderer.update(React.createElement(Probe,{id:'c'})));
  assert.equal(vm.detail,null);
  assert.ok(pages[3].signal.aborted);
  await act(async()=>{pages[3].resolve({section:'nodes',rows:[{node_id:'old'}],total:2,next:null});await more;jobs[3].resolve(makeDetail('c'));});
  assert.equal(vm.detail.job.job_id,'c');
  assert.deepEqual(vm.detail.nodes,[]);
});

test('pagination controls render localized counts, busy state and accessible retry in all six languages',()=>{
  const dictionaries=readDictionaries();
  for(const [locale,messages] of Object.entries(dictionaries)) {
    const vm={detail:{files:[{file_id:'1'}],pages:{files:{total:1234,next:'n'}}},pageState:{files:{loading:true,error:'Network error. Check your connection.'}},loadMore:noop};
    const html=renderToStaticMarkup(React.createElement(I18nContext.Provider,{value:{locale,messages}},React.createElement(DetailPageControl,{section:'files',vm})));
    assert.ok(html.includes('aria-live="polite"'));
    assert.ok(html.includes('role="alert"'));
    assert.ok(html.includes(messages['Load more']));
    assert.ok(html.includes(messages.Retry));
    assert.ok(html.includes((1234).toLocaleString(locale)));
    assert.ok(html.includes('disabled=""'));
    assert.ok(!html.includes('{v0}'));
  }
});
