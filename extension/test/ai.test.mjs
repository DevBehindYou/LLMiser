import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { aiSite, pasteIntoComposer } from '../src/ai.js';

function fixture(t,html,url='https://chatgpt.com/') {
  const dom=new JSDOM(html,{url,pretendToBeVisual:true});t.after(()=>dom.window.close());
  for(const key of ['window','document','location','getComputedStyle','HTMLTextAreaElement','InputEvent']) {
    const previous=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
    t.after(()=>previous?Object.defineProperty(globalThis,key,previous):delete globalThis[key]);
  }
  t.mock.method(dom.window.HTMLElement.prototype,'getClientRects',()=>[{}]);
  return dom.window.document;
}

test('AI detection matches exact HTTPS sites, not lookalikes or arbitrary tabs',()=>{
  assert.equal(aiSite('https://chatgpt.com/c/123').label,'ChatGPT');
  assert.equal(aiSite('https://claude.ai/new').label,'Claude');
  assert.equal(aiSite('https://gemini.google.com/app').label,'Gemini');
  for(const url of ['https://chatgpt.com.attacker.example','https://attacker.example/chatgpt.com','http://chatgpt.com','chrome://newtab',''])assert.equal(aiSite(url),null);
});

test('Paste inserts current plain text into an empty textarea and never sends',t=>{
  const doc=fixture(t,'<form><textarea id="prompt-textarea"></textarea><button>Send</button></form>');
  let submits=0, inputs=0;doc.querySelector('form').addEventListener('submit',event=>{event.preventDefault();submits++;});
  doc.querySelector('textarea').addEventListener('input',()=>inputs++);
  const text='# Current edit\n\n漢字🙂 <img src=x onerror=alert(1)>\n';
  assert.equal(pasteIntoComposer({site:'chatgpt',text}).ok,true);
  assert.equal(doc.querySelector('textarea').value,text);
  assert.equal(inputs,1);assert.equal(submits,0);assert.equal(doc.querySelector('img'),null);
});

test('Paste preserves a nonempty composer and refuses changed hosts or missing editors',t=>{
  const doc=fixture(t,'<textarea id="prompt-textarea">My existing prompt</textarea>');
  assert.match(pasteIntoComposer({site:'chatgpt',text:'new'}).error,/already has text/);
  assert.equal(doc.querySelector('textarea').value,'My existing prompt');
  assert.equal(pasteIntoComposer({site:'claude',text:'new'}).ok,false);
  doc.querySelector('textarea').remove();
  assert.match(pasteIntoComposer({site:'chatgpt',text:'new'}).error,/composer/);
});

test('rich-text paste uses plain insertText and leaves unsupported editors untouched',t=>{
  const doc=fixture(t,'<div contenteditable="true" role="textbox"></div>','https://claude.ai/new');
  const editor=doc.querySelector('div');Object.defineProperty(editor,'isContentEditable',{value:true});
  Object.defineProperty(editor,'innerText',{get(){return this.textContent;}});
  const calls=[];
  doc.execCommand=(command,_ui,text)=>{calls.push(command);editor.textContent=text;return true;};
  assert.equal(pasteIntoComposer({site:'claude',text:'**Markdown**\n漢字🙂'}).ok,true);
  assert.deepEqual(calls,['insertText']);
  editor.textContent='';doc.execCommand=()=>false;
  assert.equal(pasteIntoComposer({site:'claude',text:'new'}).ok,false);assert.equal(editor.textContent,'');
});
