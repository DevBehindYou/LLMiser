import test from 'node:test';
import assert from 'node:assert/strict';
import { sendToPool } from '../lib/server/dispatcher.js';
import { executeItem, runTick } from '../lib/server/jobQueue.js';
import { createSupabase } from '../lib/server/supabaseRest.js';
import { DEADLINE_HEADER, DEADLINE_EXCEEDED_HEADER, DeadlineExceededError, boundedTimeout } from '../lib/server/timeBudget.js';

const response = (status, body = {}, headers = {}) => new Response(JSON.stringify(body), {status, headers});
const request = (extra) => sendToPool({pool:'ocr', urls:['https://one.test','https://two.test'], jobId:'job', path:'/convert', secret:'s', makeInit:()=>({body:'generated'}), ...extra});

test('a slow transient failure leaves only the shared budget for the peer', async () => {
  const origin = 1_800_000_000_000;
  let clock = origin;
  const deadlines = [];
  const result = await request({deadlineMs:origin+300_000, now:()=>clock, fetchImpl:async (_, init)=>{
    deadlines.push(Number(init.headers[DEADLINE_HEADER]));
    assert.equal(init.headers['X-Internal-Secret'],'s');
    if (deadlines.length === 1) {clock += 140_000; return response(503);}
    return response(200, {complete:true});
  }});
  assert.equal(result.status,200);
  assert.deepEqual(deadlines,[origin+148_000,origin+238_000]);
  assert.equal(result.attempts,2);
});

test('exhausted budget skips the peer and preserves finalization time', async () => {
  let clock = 1_800_000_000_000;
  const deadlineMs = clock+300_000;
  let calls = 0;
  const result = await request({deadlineMs, now:()=>clock, fetchImpl:async()=>{calls++;clock+=230_000;return response(503);}});
  assert.equal(result.status,504);
  assert.equal(result.attempts,1);
  assert.equal(calls,1);
});

test('an expired route never constructs or sends another body', async () => {
  const result = await request({deadlineMs:Date.now()+60_000, makeInit:()=>assert.fail('body constructed'), fetchImpl:()=>assert.fail('fetch called')});
  assert.equal(result.status,504);
  assert.equal(result.attempts,0);
});

test('explicit backend deadline and response-body timeout do not retry', async () => {
  for (const kind of ['backend','body']) {
    let calls = 0;
    const result = await request({fetchImpl:async()=>{
      calls++;
      if (kind === 'backend') return response(504,{}, {[DEADLINE_EXCEEDED_HEADER]:'1'});
      return {status:200,ok:true,json:async()=>{throw new DOMException('Timed out','TimeoutError');}};
    }});
    assert.equal(result.status,504);
    assert.equal(calls,1);
  }
});

test('legacy backend 504 still permits the existing peer failover', async () => {
  let calls = 0;
  const result = await request({fetchImpl:async()=>response(++calls===1 ? 504 : 200)});
  assert.equal(result.status,200);
  assert.equal(calls,2);
});

test('response decoding consuming the budget cannot report success', async () => {
  let clock = 1_800_000_000_000;
  const deadlineMs = clock+300_000;
  const result = await request({deadlineMs, now:()=>clock,fetchImpl:async()=>({status:200,ok:true,json:async()=>{clock+=160_000;return {complete:true};}})});
  assert.equal(result.status,504);
  assert.equal(result.attempts,1);
});

test('database calls cannot start after the outer route budget expires', async () => {
  assert.equal(boundedTimeout(105,30,100),5);
  const db = createSupabase({url:'https://db.test',key:'test',bucket:'test'},()=>assert.fail('expired REST call started'),{deadlineMs:Date.now()-1});
  await assert.rejects(db.rpc('finish_work_item',{}),DeadlineExceededError);
});

test('tick stops claiming new items when only finalization time remains', async () => {
  const names = [];
  const db = {rpc:async name=>{names.push(name);return [];}};
  const result = await runTick(db,{deadlineMs:Date.now()+60_000,env:{NORMAL_BACKEND_URLS:'https://one.test'}});
  assert.equal(result.claimed,0);
  assert.deepEqual(names,['requeue_expired_work_items']);
});

test('an already claimed item records RETRY rather than false success on exhaustion', async () => {
  const recorded = [];
  const db = {bucket:'test',rpc:async(name,args)=>{recorded.push({name,args});return 'QUEUED';}};
  const item = {job_id:'job',work_item_id:'item',attempt_count:1,pool:'normal',task_type:'CONVERT',payload:{}};
  const result = await executeItem(db,item,{deadlineMs:Date.now()+60_000,env:{NORMAL_BACKEND_URLS:'https://one.test'},fetchImpl:()=>assert.fail('expired item dispatched')});
  assert.equal(result.outcome,'RETRY');
  assert.equal(recorded[0].args.p_error_code,'HTTP_504');
  assert.equal(recorded[0].args.p_result,null);
});
