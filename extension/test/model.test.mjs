import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draftRecord, pendingJobRecord, filenameFor, textStats } from '../src/model.js';

test('file drafts retain empty edits and Unicode but reject old page drafts and arbitrary metadata',()=>{
  const draft=draftRecord({mode:'file',markdown:'',title:'File',sourceUrl:'MUST_NOT_KEEP',bytes:'MUST_NOT_KEEP'});
  assert.equal(draft.markdown,'');assert.equal(draft.sourceUrl,undefined);assert.equal(draft.bytes,undefined);
  assert.equal(draftRecord({mode:'page',markdown:'old page'}),null);
  assert.equal(filenameFor('CON'),'_CON.md');assert.equal(filenameFor('../my:file'),'..-my-file.md');
  assert.equal(filenameFor('漢字🙂'),'漢字🙂.md');
  assert.deepEqual(textStats('漢字🙂'),{characters:3,words:1,tokens:1});
});

test('pending upload records contain only a valid job ID, filename and lifecycle phase',()=>{
  const value={jobId:'12345678-1234-1234-1234-123456789abc',filename:'test.pdf',phase:'processing'};
  assert.deepEqual(pendingJobRecord({...value,signedUrl:'MUST_NOT_KEEP',token:'MUST_NOT_KEEP'}),value);
  for(const bad of [{...value,jobId:'bad'},{...value,phase:'unknown'},{...value,filename:''}])assert.equal(pendingJobRecord(bad),null);
});
