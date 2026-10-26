import assert from 'node:assert/strict';
import { convertUpload, resumeUpload } from '../src/uploads.js';

if (!process.argv.includes('--confirm-live')) throw new Error('This creates one real synthetic test job. Pass --confirm-live to run.');
const controller = new AbortController();
let checkpoint;
try {
  await convertUpload(new File(['<html><body><h1>LLMiser popup recovery 2048</h1></body></html>'],'llmiser-popup-recovery.html',{type:'text/html'}),'Standard',{
    signal:controller.signal,onCheckpoint:async record=>{
      checkpoint=record;
      if(record.phase==='processing')controller.abort(); // Simulate closing after the upload.
    },
  });
  assert.fail('The interrupted popup must not finish');
} catch(error) { assert.equal(error.name,'AbortError'); }
assert.equal(checkpoint.phase,'processing');
let requests=0;
const result=await resumeUpload(checkpoint,{fetchImpl:(url,options)=>{
  assert.doesNotMatch(url,/\/uploads\/create|\/upload\/sign\//);requests++;
  return fetch(url,options);
}});
assert.match(result.markdown,/LLMiser popup recovery 2048/);
console.log(JSON.stringify({test:'Upload, close, resume existing job',result:'PASS',requests,characters:result.markdown.length}));
