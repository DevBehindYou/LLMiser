import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/bridge.js';

function chromeFixture(t,value) {
  const previous=Object.getOwnPropertyDescriptor(globalThis,'chrome');
  Object.defineProperty(globalThis,'chrome',{value,configurable:true,writable:true});
  t.after(()=>previous?Object.defineProperty(globalThis,'chrome',previous):delete globalThis.chrome);
}
function storageFixture(t,{gate=Promise.resolve()}={}) {
  const saved=new Map();
  chromeFixture(t,{storage:{session:{
    set:async value=>{await gate;for(const [key,item] of Object.entries(value))saved.set(key,item);},
    remove:async keys=>{for(const key of [].concat(keys))saved.delete(key);},
    get:async key=>({[key]:saved.get(key)})
  }}});
  return saved;
}
const checkpoint={jobId:'12345678-1234-1234-1234-123456789abc',filename:'test.pdf',phase:'processing'};

test('AI paste uses only the active tab, isolated execution and the exact current text',async t=>{
  const calls=[];
  chromeFixture(t,{tabs:{query:async()=>[{id:5,url:'https://chatgpt.com/c/123'}]},scripting:{executeScript:async options=>{calls.push(options);return [{frameId:0,result:{ok:true}}];}}});
  assert.equal((await api.detectAI()).label,'ChatGPT');
  assert.equal(await api.paste('# Edited Markdown'),'ChatGPT');
  assert.deepEqual(calls[0].target,{tabId:5});assert.equal(calls[0].world,'ISOLATED');
  assert.deepEqual(calls[0].args,[{site:'chatgpt',text:'# Edited Markdown'}]);
});

test('AI permission failures show actionable guidance without raw Chrome errors',async t=>{
  chromeFixture(t,{tabs:{query:async()=>[{id:5,url:'https://claude.ai/new'}]},scripting:{executeScript:async()=>{throw new Error('RAW_PRIVATE_URL');}}});
  await assert.rejects(api.paste('text'),error=>/toolbar icon/.test(error.message)&&!/RAW_PRIVATE/.test(error.message));
});

test('unsupported tabs never inject a script',async t=>{
  chromeFixture(t,{tabs:{query:async()=>[{id:5,url:'chrome://settings'}]}});
  assert.equal(await api.detectAI(),null);await assert.rejects(api.paste('text'),/Open ChatGPT/);
  assert.equal(api.capture,undefined);
});

test('session Clear waits for pending writes and removes both drafts and job recovery records',async t=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});storageFixture(t,{gate});
  const write=api.saveDraft({markdown:'private draft',title:'Test',mode:'file'});
  const pending=api.savePendingJob(checkpoint);const clear=api.clearDraft();
  release();await write;await pending;await clear;
  assert.equal(await api.loadDraft(),null);assert.deepEqual(await api.loadPendingJobs(),[]);
});

test('recovery records are allowlisted and updating/removing one keeps the other jobs',async t=>{
  storageFixture(t);
  await api.savePendingJob({...checkpoint,signedUrl:'MUST_NOT_RETAIN',bytes:'MUST_NOT_RETAIN'});
  const other={...checkpoint,jobId:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'};
  await api.savePendingJob(other);
  assert.deepEqual(await api.loadPendingJobs(),[checkpoint,other]);
  await api.savePendingJob({...checkpoint,phase:'uploading'});
  assert.equal((await api.loadPendingJobs()).length,2);
  await api.removePendingJob(checkpoint.jobId);assert.deepEqual(await api.loadPendingJobs(),[other]);
  await api.clearDraft();
});
