// Explicit opt-in production smoke test. Uploads only generated, public test
// fixtures, never local user documents. Normal service retention applies.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import JSZip from 'jszip';
import { convertUpload } from '../src/uploads.js';

if (!process.argv.includes('--confirm-live')) throw new Error('This creates four real test jobs. Pass --confirm-live to run.');
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const sharp = require('sharp');
const docx = new JSZip();
docx.file('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
docx.file('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
docx.file('word/document.xml','<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>LLMiser extension DOCX test 2048</w:t></w:r></w:p></w:body></w:document>');
const archive = new JSZip();
archive.file('README.md','# LLMiser extension archive test 2048\n');
archive.file('config.json','{"fixture": "public synthetic test"}');
const png = await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220"><rect width="1200" height="220" fill="white"/><text x="45" y="125" font-family="Arial" font-size="48" fill="black">LLMiser extension OCR test 2048</text></svg>')).png().toBuffer();
const cases = [
  [new File(['<html><body><h1>LLMiser extension HTML test 2048</h1><p>Only useful context.</p></body></html>'],'llmiser-extension-smoke.html',{type:'text/html'}),/HTML test 2048/],
  [new File([await docx.generateAsync({type:'nodebuffer'})],'llmiser-extension-smoke.docx',{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),/DOCX test 2048/],
  [new File([png],'llmiser-extension-smoke.png',{type:'image/png'}),/OCR test 2048/],
  [new File([await archive.generateAsync({type:'nodebuffer'})],'llmiser-extension-smoke.zip',{type:'application/zip'}),/archive test 2048/],
];
for (const [file, expected] of cases) {
  const start = Date.now();
  const result = await convertUpload(file,'Standard');
  assert.match(result.markdown,expected);
  console.log(JSON.stringify({file:file.name,bytes:file.size,characters:result.markdown.length,seconds:Math.round((Date.now()-start)/100)/10,result:'PASS'}));
}
