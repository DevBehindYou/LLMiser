import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { setImmediate as tick } from 'node:timers/promises';
import { JSDOM } from 'jsdom';
import { mountPanel } from '../src/ui/controller.js';
const html=fs.readFileSync(new URL('../sidepanel.html',import.meta.url),'utf8');
const draft={markdown:'# Original\n',title:'Sample',sourceUrl:'https://example.com',mode:'page',warnings:[]};

async function setup(t,overrides={}) {
  const dom=new JSDOM(html,{url:'https://extension.test'});t.after(()=>dom.window.close());
  const calls={saved:[],copied:[],downloads:[],cleared:0,uploads:[],pasted:[]};
  const api={loadDraft:async()=>null,capture:async()=>draft,saveDraft:async d=>calls.saved.push(d),clearDraft:async()=>calls.cleared++,copy:async text=>calls.copied.push(text),download:(text,name)=>calls.downloads.push({text,name}),authorizeUploads:async()=>true,convertUpload:async file=>{calls.uploads.push(file.name);return {...draft,title:file.name,mode:'file'};},detectAI:async()=>({id:'chatgpt',label:'ChatGPT'}),paste:async text=>{calls.pasted.push(text);return 'ChatGPT';},...overrides};
  const controller=await mountPanel(dom.window.document,api);
  return {doc:dom.window.document,window:dom.window,calls,controller};
}

test('capture/edit/immediate copy and download use the latest text, including an empty edit',async t=>{
  const {doc,window,calls,controller}=await setup(t);
  doc.getElementById('capture-page').click();await tick();
  const editor=doc.getElementById('editor');editor.value='# Edited 漢字🙂\n';editor.dispatchEvent(new window.Event('input'));
  doc.getElementById('copy').click();doc.getElementById('download').click();await tick();
  assert.equal(calls.copied[0],'# Edited 漢字🙂\n');assert.equal(calls.downloads[0].text,calls.copied[0]);
  editor.value='';editor.dispatchEvent(new window.Event('input'));doc.getElementById('download').click();
  assert.equal(calls.downloads[1].text,'');await controller.flush();
  assert.equal(calls.saved.at(-1).markdown,'');
});

function dropFiles(doc,window,files) {
  const event=new window.Event('drop',{bubbles:true,cancelable:true});
  Object.defineProperty(event,'dataTransfer',{value:{files}});
  doc.getElementById('dropzone').dispatchEvent(event);
  assert.equal(event.defaultPrevented,true);
}

test('dropping files only queues them; Convert uploads valid files and Paste waits for its own click',async t=>{
  const {doc,window,calls}=await setup(t);
  dropFiles(doc,window,[new window.File(['test'],'a.txt'),new window.File(['bad'],'bad.exe')]);
  assert.equal(calls.uploads.length,0);assert.equal(calls.pasted.length,0);
  assert.match(doc.getElementById('file-queue').textContent,/Unsupported/);
  doc.getElementById('convert-files').click();await tick();await tick();
  assert.deepEqual(calls.uploads,['a.txt']);assert.equal(calls.pasted.length,0);
  assert.match(doc.getElementById('ai-target').textContent,/ChatGPT detected/);
  doc.getElementById('editor').value='# Edited for AI';
  doc.getElementById('paste').click();await tick();
  assert.deepEqual(calls.pasted,['# Edited for AI']);
  assert.match(doc.getElementById('status').textContent,/nothing was sent/);
});

test('denied upload permission sends no files and Clear aborts late conversion results',async t=>{
  const first=await setup(t,{authorizeUploads:async()=>false});
  dropFiles(first.doc,first.window,[new first.window.File(['test'],'a.txt')]);
  first.doc.getElementById('convert-files').click();await tick();
  assert.equal(first.calls.uploads.length,0);assert.match(first.doc.getElementById('status').textContent,/not granted/);
  let release,signal;const pending=new Promise(resolve=>{release=resolve;});
  const second=await setup(t,{convertUpload:(_file,_profile,options)=>{signal=options.signal;return pending;}});
  dropFiles(second.doc,second.window,[new second.window.File(['test'],'a.txt')]);
  second.doc.getElementById('convert-files').click();await tick();
  second.doc.getElementById('clear').click();assert.equal(signal.aborted,true);
  release(draft);await tick();assert.equal(second.calls.saved.length,0);
  assert.equal(second.doc.getElementById('editor').value,'');assert.equal(second.doc.getElementById('file-queue').children.length,0);
});

test('the Converter screen has no secondary navigation or automatic paste control',async t=>{
  const {doc}=await setup(t);
  assert.equal(doc.querySelectorAll('main').length,1);assert.equal(doc.querySelector('nav'),null);
  assert.equal(doc.getElementById('open-app'),null);
  assert.equal(doc.getElementById('paste').disabled,true);
});

test('reviewing multiple converted files retains each file edit during this panel session',async t=>{
  const {doc,window}=await setup(t);
  dropFiles(doc,window,[new window.File(['a'],'a.txt'),new window.File(['b'],'b.txt')]);
  doc.getElementById('convert-files').click();await tick();await tick();
  const buttons=doc.querySelectorAll('#file-queue button');
  buttons[0].click();await tick();
  const editor=doc.getElementById('editor');editor.value='Edited first file';editor.dispatchEvent(new window.Event('input'));
  buttons[1].click();await tick();buttons[0].click();await tick();
  assert.equal(editor.value,'Edited first file');
});

test('clearing during extraction cannot restore a late result or saved draft',async t=>{
  let release;const pending=new Promise(resolve=>{release=resolve;});
  const {doc,calls}=await setup(t,{capture:()=>pending});
  doc.getElementById('capture-page').click();doc.getElementById('clear').click();
  release(draft);await tick();
  assert.equal(calls.cleared,1);assert.equal(calls.saved.length,0);
  assert.equal(doc.getElementById('editor').value,'');assert.equal(doc.getElementById('copy').disabled,true);
});

test('session failure stays visible and leaves the result exportable',async t=>{
  const {doc}=await setup(t,{saveDraft:async()=>{throw new Error('quota');}});
  doc.getElementById('capture-page').click();await tick();
  assert.match(doc.getElementById('status').textContent,/could not be saved/);
  assert.equal(doc.getElementById('copy').disabled,false);
});

test('restored content is text only, and a capture error preserves existing edits',async t=>{
  const {doc}=await setup(t,{loadDraft:async()=>({...draft,title:'<img src=x onerror=alert(1)>',markdown:'<script>alert(1)</script>'}),capture:async()=>{throw new Error('Select text first');}});
  assert.equal(doc.getElementById('document-title').querySelector('img'),null);
  doc.getElementById('capture-selection').click();await tick();
  assert.equal(doc.getElementById('editor').value,'<script>alert(1)</script>');
  assert.match(doc.getElementById('status').textContent,/Select text first/);
});
