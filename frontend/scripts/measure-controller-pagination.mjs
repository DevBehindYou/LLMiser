// Generated local PostgreSQL plans and response sizes; no network or production data.
import { freshDb } from '../test/sql/pgliteDb.mjs';
import { createPgliteSupabase } from '../test/sql/pgliteSupabase.mjs';
import { jobDetail,jobDetailPage } from '../lib/server/adminService.js';

const pg=await freshDb();
try {
  const jobs=(await pg.query("insert into jobs(status,original_filename) select 'COMPLETED','generated.zip' from generate_series(1,21) returning job_id")).rows.map(row=>row.job_id);
  for(const [index,id] of jobs.entries()) {
    const n=index===0?2000:1000;
    await pg.query("insert into content_nodes(job_id,node_type,sequence_index,logical_path) select $1,'TEXT_FILE',i,'src/file-' || i || '.txt' from generate_series(1,$2) i",[id,n]);
    await pg.query("insert into file_objects(job_id,bucket,object_path,kind,storage_status,created_at) select $1::uuid,'mdify-pro-files',$1::text || '/' || i || '.md','OUTPUT','ACTIVE',now()+i*interval '1 microsecond' from generate_series(1,$2) i",[id,n]);
    await pg.query("insert into work_items(job_id,task_type,pool,created_at) select $1,'CONVERT','normal',now()+i*interval '1 microsecond' from generate_series(1,$2) i",[id,n]);
    await pg.query("insert into job_events(job_id,event_type,message,details,created_at) select $1,'GENERATED','Generated benchmark event',jsonb_build_object('generated',repeat('x',256)),now()+i*interval '1 microsecond' from generate_series(1,$2) i",[id,n]);
  }
  await pg.exec('analyze jobs; analyze file_objects; analyze content_nodes; analyze work_items; analyze job_events;');
  const db=createPgliteSupabase(pg),id=jobs[0];
  const old={...(await db.rpc('get_job_tree',{p_job_id:id})),files:await db.select('file_objects',{job_id:`eq.${id}`,select:'file_id,kind,object_path,extension,mime_type,size_bytes,storage_status,created_at,deleted_at',order:'created_at.asc'})};
  const initial=await jobDetail(db,id);
  const plans={};
  for(const [section,table,key,pk] of [['files','file_objects','created_at','file_id'],['nodes','content_nodes','sequence_index','node_id'],['items','work_items','created_at','work_item_id'],['events','job_events','created_at','event_id']]) {
    const row=(await pg.query(`select row_to_json(p) as value from(select ${key},${pk} from ${table} where job_id=$1 order by ${key},${pk} offset 1499 limit 1)p`,[id])).rows[0].value;
    const explain=async(sql,params)=>(await pg.query('explain (analyze,buffers,format json) '+sql,params)).rows[0]['QUERY PLAN'][0];
    plans[section]={
      first:await explain(`select * from ${table} where job_id=$1 order by ${key},${pk} limit 50`,[id]),
      deep:await explain(`select * from ${table} where job_id=$1 and (${key}>$2 or (${key}=$2 and ${pk}>$3)) order by ${key},${pk} limit 50`,[id,row[key],row[pk]]),
      count:await explain(`select count(*) from ${table} where job_id=$1`,[id]),
    };
    let cursor=null,seen=new Set(),pages=0;
    do {const page=await jobDetailPage(db,id,section,{limit:100,cursor});for(const record of page.rows){if(seen.has(record[pk]))throw new Error('Duplicate');seen.add(record[pk]);}cursor=page.next;pages++;}while(cursor);
    if(seen.size!==2000)throw new Error('Missing '+section);
    plans[section].traversal={pages,rows:seen.size};
  }
  const result={checkedAt:new Date().toISOString(),engine:(await pg.query('select version() as version')).rows[0].version,
    fixture:{jobs:21,targetRowsPerSection:2000,totalRowsPerSection:22000},
    oldBytes:Buffer.byteLength(JSON.stringify(old)),initialBytes:Buffer.byteLength(JSON.stringify(initial)),
    initialRows:Object.fromEntries(['files','nodes','items','events'].map(section=>[section,initial[section].length])),plans};
  result.reductionPercent=100*(1-result.initialBytes/result.oldBytes);
  console.log(JSON.stringify(result,null,2));
} finally {await pg.close();}
