import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/bridge.js';

function chromeFixture(t,value) {
  const previous=Object.getOwnPropertyDescriptor(globalThis,'chrome');
  Object.defineProperty(globalThis,'chrome',{value,configurable:true,writable:true});
  t.after(()=>previous?Object.defineProperty(globalThis,'chrome',previous):delete globalThis.chrome);
}

test('Chrome capture is isolated and pinned to the injected document identity',async t=>{
  const calls=[];
  chromeFixture(t,{tabs:{query:async()=>[{id:5,url:'https://example.com'}]},scripting:{executeScript:async options=>{
    calls.push(options);
    return options.files ? [{frameId:0,documentId:'document-123'}] : [{result:{ok:true,draft:{markdown:'# Test',title:'Test',mode:'page'}}}];
  }}});
  const result=await api.capture({mode:'page'});
  assert.equal(result.markdown,'# Test');assert.equal(calls.length,2);
  assert.equal(calls[0].world,'ISOLATED');assert.deepEqual(calls[1].target,{tabId:5,documentIds:['document-123']});
});

test('revoked activeTab access gives actionable guidance without exposing raw Chrome errors',async t=>{
  chromeFixture(t,{tabs:{query:async()=>[{id:5}]},scripting:{executeScript:async()=>{throw new Error('RAW_PRIVATE_URL');}}});
  await assert.rejects(api.capture({mode:'page'}),error=>/toolbar icon/.test(error.message)&&!/RAW_PRIVATE/.test(error.message));
});

test('internal pages fail before injection',async t=>{
  chromeFixture(t,{tabs:{query:async()=>[{id:5,url:'chrome://settings'}]}});
  await assert.rejects(api.capture({mode:'page'}),/internal pages/);
});

test('session clear waits for pending writes so an old save cannot resurrect a draft',async t=>{
  let release;const gate=new Promise(resolve=>{release=resolve;});const saved=new Map();
  chromeFixture(t,{storage:{session:{set:async value=>{await gate;for(const [key,item] of Object.entries(value))saved.set(key,item);},remove:async key=>saved.delete(key),get:async key=>({[key]:saved.get(key)})}}});
  const write=api.saveDraft({markdown:'private draft',title:'Test'});
  const clear=api.clearDraft();release();await write;await clear;
  assert.equal(await api.loadDraft(),null);
});
