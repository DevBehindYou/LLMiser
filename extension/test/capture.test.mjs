import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { captureDocument } from '../src/capture.js';
import { draftRecord, filenameFor, textStats } from '../src/model.js';

function fixture(t, html) {
  const dom=new JSDOM(`<html><head><title>Useful 漢字🙂</title></head><body>${html}</body></html>`,{url:'https://example.com/path/page?private=omitted#fragment'});
  t.after(()=>dom.window.close());
  return dom.window.document;
}

test('page capture preserves GFM, Unicode, links and safe code fences without mutating the page',t=>{
  const doc=fixture(t,'<h1>My guide</h1><p><strong>Useful</strong> and <em>clear</em>. <a href="../reference">Guide</a></p><ul><li>First</li><li>Second</li></ul><table><tr><th>Name</th><th>Value</th></tr><tr><td>漢字🙂</td><td>3</td></tr></table><pre><code class="language-js">const x = "```";\n// 漢字🙂\n</code></pre>');
  const before=doc.documentElement.outerHTML;
  const result=captureDocument(doc,{mode:'page'});
  assert.match(result.markdown,/# My guide/);
  assert.match(result.markdown,/\*\*Useful\*\*/);
  assert.match(result.markdown,/\[Guide\]\(https:\/\/example.com\/reference\)/);
  assert.match(result.markdown,/\| 漢字🙂 \| 3 \|/);
  assert.match(result.markdown,/````js\nconst x = "```";\n\/\/ 漢字🙂\n````/);
  assert.doesNotMatch(result.sourceUrl,/private|fragment/);
  assert.equal(doc.documentElement.outerHTML,before);
});

test('selection captures only selected rich text and fails instead of falling back to a whole page',t=>{
  const doc=fixture(t,'<p>Before <strong id="chosen">Selected 漢字🙂</strong> after</p><p>UNSELECTED_SECRET</p>');
  const selection=doc.defaultView.getSelection();
  const range=doc.createRange(); range.selectNodeContents(doc.getElementById('chosen')); selection.addRange(range);
  const result=captureDocument(doc,{mode:'selection',includeSource:false});
  assert.match(result.markdown,/Selected 漢字🙂/);
  assert.doesNotMatch(result.markdown,/Before|after|UNSELECTED|Source:/);
  selection.removeAllRanges();
  assert.throws(()=>captureDocument(doc,{mode:'selection'}),/Select text/);
});

test('partial multi-node selection respects text boundaries',t=>{
  const doc=fixture(t,'<p id="p">Before <b>bold section</b> after</p>');
  const p=doc.getElementById('p'); const range=doc.createRange();
  range.setStart(p.firstChild,3); range.setEnd(p.lastChild,3);
  doc.defaultView.getSelection().addRange(range);
  const result=captureDocument(doc,{mode:'selection',includeSource:false});
  assert.match(result.markdown,/ore \*\*bold section\*\* af/);
  assert.doesNotMatch(result.markdown,/Before|after/);
});

test('scripts, fields, editables, hidden nodes and unsafe links/resources do not enter output',t=>{
  const doc=fixture(t,'<h1>Visible</h1><script>SCRIPT_SECRET</script><p hidden>HIDDEN_SECRET</p><div style="display:none">CSS_SECRET</div><div style="opacity:0">TRANSPARENT_SECRET</div><div contenteditable><span>EDITABLE_SECRET</span></div><input value="FIELD_SECRET"><textarea>TEXTAREA_SECRET</textarea><form>FORM_SECRET</form><a href="javascript:alert(1)">safe label</a><img src="https://tracker.example/pixel" alt="A useful chart"><iframe src="https://remote.example">FRAME_SECRET</iframe>');
  const result=captureDocument(doc,{mode:'page',includeSource:false});
  assert.match(result.markdown,/safe label/); assert.match(result.markdown,/A useful chart/);
  assert.doesNotMatch(result.markdown,/SECRET|javascript:|tracker.example|remote.example/);
  assert.ok(result.warnings.some(x=>/Embedded/.test(x)));
  const withImages=captureDocument(doc,{mode:'page',includeImages:true,includeSource:false});
  assert.match(withImages.markdown,/!\[A useful chart\]\(https:\/\/tracker.example\/pixel\)/);
});

test('a selection inside a hidden or editable ancestor is rejected',t=>{
  const doc=fixture(t,'<div contenteditable="true"><p id="private">Should not capture</p></div>');
  const range=doc.createRange();range.selectNodeContents(doc.getElementById('private'));doc.defaultView.getSelection().addRange(range);
  assert.throws(()=>captureDocument(doc,{mode:'selection'}),/outside hidden content or form fields/);
});

test('article mode strips unrelated navigation and records a useful main article',t=>{
  const prose='This useful article explains the process in clear sentences, with enough details to identify its main content. '.repeat(12);
  const doc=fixture(t,`<nav>NAVIGATION_NOISE</nav><main><article><h1>A useful article</h1><p>${prose}</p><p>${prose}</p></article></main><footer>FOOTER_NOISE</footer>`);
  const result=captureDocument(doc,{mode:'article'});
  assert.match(result.markdown,/useful article/);assert.doesNotMatch(result.markdown,/NAVIGATION_NOISE|FOOTER_NOISE/);
});

test('headerless and merged tables preserve text and warn about fidelity',t=>{
  const doc=fixture(t,'<table><tr><td colspan="2">Heading</td></tr><tr><td>A</td><td>B</td></tr></table>');
  const result=captureDocument(doc,{mode:'page',includeSource:false});
  assert.match(result.markdown,/Heading/);assert.match(result.markdown,/A/);assert.match(result.markdown,/B/);
  assert.ok(result.warnings.some(x=>/Merged/.test(x)));assert.ok(result.warnings.some(x=>/no header/.test(x)));
});

test('oversized text and deeply nested pages fail explicitly rather than returning truncation',t=>{
  const doc=fixture(t,`<p>${'a'.repeat(2_000_001)}</p>`);
  assert.throws(()=>captureDocument(doc,{mode:'page'}),/too large/);
  const deep=fixture(t,'<div>'.repeat(125)+'deep'+'</div>'.repeat(125));
  assert.throws(()=>captureDocument(deep,{mode:'page'}),/too large/);
});

test('draft metadata is allowlisted, empty edits are valid, filenames and estimates handle Unicode',()=>{
  const draft=draftRecord({markdown:'',title:'Title',sourceUrl:'https://user:pass@example.com/path?q=secret#hash',rawHtml:'SECRET'});
  assert.equal(draft.markdown,'');assert.equal(draft.sourceUrl,'https://example.com/path');assert.equal(draft.rawHtml,undefined);
  assert.equal(filenameFor('CON'),'_CON.md');assert.equal(filenameFor('../my:file'),'..-my-file.md');
  assert.equal(filenameFor('漢字🙂'),'漢字🙂.md');
  assert.deepEqual(textStats('漢字🙂'),{characters:3,words:1,tokens:1});
});

test('selection traversal counts unselected siblings toward the node budget', t => {
  const doc=fixture(t,'<main><p id="start">Selected start</p><p id="end">Selected end</p></main>');
  const main=doc.querySelector('main');
  for(let index=0;index<40_001;index++) main.appendChild(doc.createElement('span'));
  const range=doc.createRange();
  range.setStart(doc.getElementById('start').firstChild,0);
  range.setEnd(doc.getElementById('end').firstChild,12);
  doc.defaultView.getSelection().addRange(range);
  assert.throws(()=>captureDocument(doc,{mode:'selection'}),/too large/);
});
