// Run after postgres_recovery.mjs against its disposable localhost CI database.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
if (process.env.PGDATABASE !== 'mdify_ci' || !['127.0.0.1','localhost'].includes(process.env.PGHOST)) throw new Error('Requires disposable mdify_ci on localhost');
const run = promisify(execFile);
const sql = async s => (await run('psql',['--no-psqlrc','-v','ON_ERROR_STOP=1','-At','-c',s],{timeout:30_000})).stdout.trim();
const subject='c'.repeat(64);
const files=n=>Array.from({length:n},(_,i)=>({file_id:randomUUID(),filename:`quota-${i}.txt`,extension:'txt',size:12,profile:'standard',source_type:'DOCUMENT',workload_type:'NORMAL'}));
const reserve=(manifest,id=randomUUID())=>sql(`select public.reserve_quota_batch('${subject}','${id}','${JSON.stringify(manifest)}','mdify-pro-files')`).then(JSON.parse);
const snapshot=()=>sql(`select public.quota_snapshot('${subject}')`).then(JSON.parse);
const reset=()=>sql('truncate public.jobs cascade; truncate public.job_storage_reservations; truncate quota_private.batches cascade; update quota_private.policy set enabled=true;');
await reset();
const racing=await Promise.all(Array.from({length:10},()=>reserve(files(3))));
assert.equal(racing.filter(r=>r.allowed).length,6);
assert.equal((await snapshot()).reserved,18);
const last=await Promise.all(Array.from({length:10},()=>reserve(files(1))));
assert.equal(last.filter(r=>r.allowed).length,2);
assert.equal((await snapshot()).remaining,0);
assert.equal(await sql('select count(*) from public.jobs'),'20');
console.log('PostgreSQL quota: parallel batches and last-slot races never exceed 20.');
await reset();
const manifest=files(2), id=randomUUID();
const replay=await Promise.all(Array.from({length:10},()=>reserve(manifest,id)));
for(const result of replay) assert.deepEqual(result.files,replay[0].files);
assert.equal(await sql('select count(*) from public.jobs'),'2');
assert.equal((await reserve(files(2),id)).code,'IDEMPOTENCY_CONFLICT');
console.log('PostgreSQL quota: concurrent identical replays create two jobs once.');
await reset();
const raceId=randomUUID();
const admitted=await reserve(files(1),raceId);
const job=admitted.files[0].job_id;
await sql(`select public.start_uploaded_job('${job}','mdify-pro-files',12)`);
const [claimed,released]=await Promise.all([
 sql(`select count(*) from public.claim_work_items('normal',4,1,'${job}')`),
 sql(`select public.release_quota_batch('${subject}','${raceId}')`),
]);
assert.equal(Number(claimed)+Number(released),1);
assert.equal((await snapshot()).used,Number(claimed));
console.log('PostgreSQL quota: first claim versus release has exactly one winner.');
await sql('update quota_private.policy set enabled=false');
