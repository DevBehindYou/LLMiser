import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshDb } from './sql/pgliteDb.mjs';
import { createPgliteSupabase } from './sql/pgliteSupabase.mjs';
import { jobDetail, jobDetailPage } from '../lib/server/adminService.js';
import { collectStoredFiles, mergeDetailPage } from '../lib/models/adminDetail.js';
import { createSupabase } from '../lib/server/supabaseRest.js';

test('detail pages on migrated Postgres retain tied and microsecond keys, scope and complete exports', async t => {
  const pg = await freshDb();
  t.after(() => pg.close());
  const db = createPgliteSupabase(pg);
  const job = async () => (await pg.query("insert into jobs(status,original_filename) values ('COMPLETED','generated.zip') returning job_id")).rows[0].job_id;
  const id = await job(), other = await job(), empty = await job();
  for (const jobId of [id, other]) {
    const args = [jobId];
    const stamp = "'2026-10-29T00:00:00Z'::timestamptz + ((i / 3) * interval '1 microsecond')";
    await pg.query(`insert into file_objects(job_id,bucket,object_path,kind,storage_status,created_at)
      select $1::uuid,'mdify-pro-files',$1::text || '/' || i || '.md',case when i%2=0 then 'OUTPUT' else 'INPUT' end,
      case when i%5=0 then 'DELETED' else 'ACTIVE' end,${stamp} from generate_series(1,123) i`, args);
    await pg.query(`insert into content_nodes(job_id,node_type,sequence_index,logical_path)
      select $1,'TEXT_FILE',i/3,'part-' || i from generate_series(1,123) i`, args);
    await pg.query(`insert into work_items(job_id,task_type,pool,created_at,payload)
      select $1,'CONVERT','normal',${stamp},jsonb_build_object('private','omitted') from generate_series(1,123) i`, args);
    await pg.query(`insert into job_events(job_id,event_type,created_at,details)
      select $1,'GENERATED',${stamp},jsonb_build_object('private','omitted') from generate_series(1,123) i`, args);
  }
  const detail = await jobDetail(db, id);
  const names = {files:['file_objects','file_id','created_at'],nodes:['content_nodes','node_id','sequence_index'],items:['work_items','work_item_id','created_at'],events:['job_events','event_id','created_at']};
  for (const [section,[table,key,order]] of Object.entries(names)) {
    assert.equal(detail[section].length,50);
    assert.equal(detail.pages[section].total,123);
    assert.ok(detail.pages[section].next);
    let result = detail;
    const lengths = [50];
    while (result.pages[section].next) {
      const page = await jobDetailPage(db,id,section,{cursor:result.pages[section].next});
      lengths.push(page.rows.length);
      result = mergeDetailPage(result,section,page);
    }
    assert.deepEqual(lengths,[50,50,23]);
    const expected = (await pg.query(`select ${key} from ${table} where job_id=$1 order by ${order},${key}`,[id])).rows.map(row=>row[key]);
    assert.deepEqual(result[section].map(row=>row[key]),expected,section);
    assert.ok(!('payload' in result[section][0]));
    assert.ok(!('details' in result[section][0]));
    assert.equal((await jobDetailPage(db,id,section,{limit:'999'})).rows.length,100);
    const short = await jobDetailPage({...db,selectPage:(table,filters)=>db.selectPage(table,{...filters,limit:'2'})},id,section,{limit:50});
    assert.equal(short.rows.length,2);
    assert.ok(short.next,'a server row cap must not silently end traversal');
  }
  assert.equal(detail.pages.files.active_total,99);
  assert.ok(!db.calls.some(call=>call[1]==='get_job_tree'));
  const filtered = await jobDetailPage(db,id,'files',{limit:1,stored:'1',kind:'OUTPUT'});
  const exported = await collectStoredFiles([id,other],{outputsOnly:true,loadPage:(jobId,section,params)=>jobDetailPage(db,jobId,section,{...params,limit:7})});
  assert.equal(exported.length,98);
  assert.equal(new Set(exported.map(file=>file.fileId)).size,98);
  await assert.rejects(jobDetailPage(db,other,'files',{cursor:filtered.next,stored:'1',kind:'OUTPUT'}),/Bad cursor/);
  await assert.rejects(jobDetailPage(db,id,'files',{cursor:filtered.next,stored:'1'}),/Bad cursor/);
  await assert.rejects(jobDetailPage(db,id,'events',{cursor:filtered.next}),/Bad cursor/);
  for (const limit of [0,-1,'NaN','1.2','1000','1 or true']) await assert.rejects(jobDetailPage(db,id,'files',{limit}),/page size/);
  for (const cursor of ['', '!', 'e30', 'a'.repeat(513)]) await assert.rejects(jobDetailPage(db,id,'files',{cursor}),/Bad cursor/);
  await assert.rejects(jobDetailPage(db,id,'__proto__'),/Unknown detail section/);
  await assert.rejects(jobDetailPage(db,id,'nodes',{stored:'1'}),/file filter/);
  await assert.rejects(jobDetailPage(db,id,'files',{kind:'secret'}),/file filter/);
  await assert.rejects(jobDetail(db,crypto.randomUUID()),error=>error.status===404);
  const blank = await jobDetail(db,empty);
  for (const section of Object.keys(names)) assert.deepEqual(blank.pages[section],{total:0,next:null,...(section==='files'?{active_total:0}:{})});
});

test('PostgREST exact page counts use GET/HEAD, preserve query keys and fail closed',async()=>{
  const calls=[];
  let body='[{"event_id":"x"}]',range='0-0/123',status=200;
  const db=createSupabase({url:'https://database.test',key:'test',bucket:'test'},async(url,init)=>{
    calls.push({url:new URL(url),init});
    return new Response(init.method==='HEAD'?null:body,{status,headers:{'content-range':range}});
  });
  const or='(created_at.gt.2026-10-29T00:00:00.000001+00:00,and(created_at.eq.2026-10-29T00:00:00.000001+00:00,event_id.gt.abc))';
  assert.deepEqual(await db.selectPage('job_events',{or,limit:50,order:'created_at.asc,event_id.asc'}),{rows:[{event_id:'x'}],total:123});
  assert.equal(calls[0].url.searchParams.get('or'),or);
  assert.equal(calls[0].init.headers.Prefer,'count=exact');
  assert.equal(calls[0].init.cache,'no-store');
  assert.equal(await db.count('job_events',{limit:1}),123);
  assert.equal(calls[1].init.method,'HEAD');
  range='*/0'; body='[]';
  assert.deepEqual(await db.selectPage('job_events',{}),{rows:[],total:0});
  for (const value of ['', '0-0/*','0-0/9007199254740992']) {
    range=value; await assert.rejects(db.selectPage('job_events',{}),/exact page count/);
  }
  range='0-0/1';
  for (const value of ['null','{}','not JSON']) {body=value;await assert.rejects(db.selectPage('job_events',{}),/exact page count/);}
  status=401; body='{"message":"denied"}'; await assert.rejects(db.selectPage('job_events',{}),error=>error.status===401);
});

const file = i=>({file_id:String(i),kind:'OUTPUT',storage_status:'ACTIVE',object_path:`generated/${i}.md`});
const page = (rows,total=rows.length,next=null)=>({section:'files',rows,total,next});
test('ZIP collection resolves all pages and refuses incomplete, changed, oversized or aborted lists',async()=>{
  let requests=0;
  const all=await collectStoredFiles(['a'],{loadPage:async(_job,_section,params)=>{
    requests++; assert.equal(params.stored,'1');
    return params.cursor?page([file(2)],2):page([file(1)],2,'next');
  }});
  assert.deepEqual(all.map(item=>item.fileId),['1','2']);
  assert.equal(requests,2);
  await assert.rejects(collectStoredFiles(['a'],{loadPage:async()=>page([file(1)],201)}),/At most 200/);
  await assert.rejects(collectStoredFiles(['a','b'],{maxFiles:1,loadPage:async()=>page([file(1)])}),/At most 1/);
  for(const loadPage of [
    async(_j,_s,p)=>p.cursor?Promise.reject(new Error('offline')):page([file(1)],2,'next'),
    async()=>page([file(1)],2,'next'),
    async(_j,_s,p)=>p.cursor?page([],2):page([file(1)],2,'next'),
    async(_j,_s,p)=>p.cursor?page([file(2)],3):page([file(1)],2,'next'),
    async()=>page([{...file(1),storage_status:'DELETED'}]),
    async()=>({rows:[],total:0,next:null}),
  ]) await assert.rejects(collectStoredFiles(['a'],{loadPage}));
  await assert.rejects(collectStoredFiles(['a'],{outputsOnly:true,loadPage:async()=>page([{...file(1),kind:'INPUT'}])}),/Stored files changed/);
  const controller=new AbortController();
  await assert.rejects(collectStoredFiles(['a'],{signal:controller.signal,loadPage:async()=>{controller.abort();return page([file(1)]);}}),error=>error.name==='AbortError');
});

test('merging a page deduplicates IDs while retaining other sections and updated metadata',()=>{
  const initial={files:[file(1)],events:[{event_id:'unchanged'}],pages:{files:{total:3,next:'a'},events:{total:1,next:null}}};
  const result=mergeDetailPage(initial,'files',page([{...file(1),size_bytes:42},file(2)],3,'b'));
  assert.equal(result.files.length,2);
  assert.equal(result.files[0].size_bytes,42);
  assert.equal(result.events,initial.events);
  assert.equal(result.pages.files.next,'b');
  assert.equal(initial.files.length,1);
});
