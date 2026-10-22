import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { freshDb } from './pgliteDb.mjs';

async function fixture(t) {
  const db = await freshDb(); t.after(() => db.close());
  await db.exec(`
    create schema net; create schema vault;
    create table vault.decrypted_secrets(name text, decrypted_secret text);
    insert into vault.decrypted_secrets values ('mdify_cron_secret','test-only'),
      ('mdify_keepwarm_url_o1','https://ocr-one.example'),('mdify_keepwarm_url_o2','https://ocr-two.example');
    create table net._http_response(id bigint,status_code integer,timed_out boolean,error_msg text);
    create table net.calls(id bigint generated always as identity,method text,url text,timeout_ms integer);
    create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer)
      returns bigint language sql as $$ insert into net.calls(method,url,timeout_ms) values('POST',url,timeout_milliseconds) returning id $$;
    create function net.http_get(url text,timeout_milliseconds integer)
      returns bigint language sql as $$ insert into net.calls(method,url,timeout_ms) values('GET',url,timeout_milliseconds) returning id $$;
  `);
  const scalar = async sql => Object.values((await db.query(sql)).rows[0])[0];
  return { db, scalar };
}

test('idle cron runs database maintenance without sending HTTP; active work keeps the minute cadence', async t => {
  const { db, scalar } = await fixture(t);
  await db.exec("insert into public.jobs(status,created_at) values('UPLOADING',now()-interval '3 hours')");
  assert.equal(await scalar('select public.dispatch_jobs_tick()'), null);
  assert.equal(await scalar('select count(*)::int from net.calls'), 0);
  assert.equal(await scalar('select status from public.jobs'), 'CANCELLED');
  await db.exec("insert into public.jobs(status) values('QUEUED')");
  const id = await scalar('select public.dispatch_jobs_tick()');
  assert.ok(id);
  assert.equal(await scalar('select public.dispatch_jobs_tick()'), null, 'pending HTTP cannot multiply ticks');
  assert.equal(await scalar('select count(*)::int from net.calls'), 1);
  assert.equal(await scalar('select url from net.calls'), 'https://llmiser.devbehindyou.com/api/jobs/tick');
  assert.equal(await scalar('select timeout_ms from net.calls'), 300000);
  await db.exec(`insert into net._http_response values(${id},200,false,null)`);
  assert.ok(await scalar('select public.dispatch_jobs_tick()'), 'completed response allows the next pass');
  assert.equal(await scalar('select status_code from public.scheduled_http_requests order by request_id limit 1'), 200);
});

test('lost requests cannot suppress scheduling forever and outcome logs never retain transport secrets', async t => {
  const { db, scalar } = await fixture(t);
  await db.exec("insert into public.jobs(status) values('PROCESSING')");
  const id = await scalar('select public.dispatch_jobs_tick()');
  await db.exec("update public.scheduled_http_requests set requested_at=now()-interval '7 minutes'");
  assert.ok(await scalar('select public.dispatch_jobs_tick()'));
  assert.equal(await scalar(`select error from public.scheduled_http_requests where request_id=${id}`), 'no response recorded');
  const next = await scalar('select max(request_id) from public.scheduled_http_requests');
  await db.exec(`insert into net._http_response values(${next},null,false,'https://private.example?token=not-for-logs')`);
  await scalar('select public.record_scheduled_http_responses()');
  assert.equal(await scalar(`select error from public.scheduled_http_requests where request_id=${next}`), 'transport error');
  assert.doesNotMatch(JSON.stringify((await db.query('select * from public.scheduled_http_requests')).rows), /private|token|test-only/);
  await db.exec('set role anon');
  await assert.rejects(db.query('select public.dispatch_jobs_tick()'), /permission denied/);
  await assert.rejects(db.query('select * from public.scheduled_http_requests'), /permission denied/);
});

test('OCR pings coalesce, use confirmed successes for the short timeout, and isolate invalid targets', async t => {
  const { db, scalar } = await fixture(t);
  assert.equal(await scalar('select public.keepwarm_ping()'), 2);
  assert.equal(await scalar('select public.keepwarm_ping()'), 0);
  assert.equal(await scalar('select count(*)::int from net.calls'), 2);
  assert.equal(await scalar('select min(timeout_ms) from net.calls'), 90000);
  await db.exec(`insert into net._http_response select id,200,false,null from net.calls;
    update public.keepwarm_pings set requested_at=now()-interval '3 minutes';`);
  assert.equal(await scalar('select public.keepwarm_ping()'), 2);
  assert.equal(await scalar('select min(timeout_ms) from net.calls'), 10000);
  await db.exec("update public.keepwarm_pings set requested_at=now()-interval '3 minutes'; update vault.decrypted_secrets set decrypted_secret='https://host.example/private?secret=no' where name='mdify_keepwarm_url_o1'");
  assert.equal(await scalar('select public.keepwarm_ping()'), 1);
  assert.equal(await scalar("select count(*)::int from public.keepwarm_pings where error='not sent: invalid URL or queue failure'"), 1);
  assert.doesNotMatch(JSON.stringify((await db.query('select * from public.keepwarm_pings')).rows), /secret=no/);
});

test('missing/duplicate tick secret fails closed, and failed OCR responses do not select an awake timeout', async t => {
  const { db, scalar } = await fixture(t);
  await db.exec("insert into public.jobs(status) values('QUEUED'); delete from vault.decrypted_secrets where name='mdify_cron_secret'");
  await assert.rejects(db.query('select public.dispatch_jobs_tick()'), /Expected one mdify_cron_secret/);
  assert.equal(await scalar('select count(*)::int from net.calls'), 0);
  await db.exec("insert into vault.decrypted_secrets values('mdify_cron_secret','a'),('mdify_cron_secret','b')");
  await assert.rejects(db.query('select public.dispatch_jobs_tick()'), /Expected one mdify_cron_secret/);
  assert.equal(await scalar('select public.keepwarm_ping()'), 2);
  await db.exec(`insert into net._http_response select id,503,false,null from net.calls;
    update public.keepwarm_pings set requested_at=now()-interval '3 minutes';`);
  assert.equal(await scalar('select public.keepwarm_ping()'), 2);
  assert.equal(await scalar('select min(timeout_ms) from net.calls'), 90000);
});

test('production cutover updates existing jobs in place, is repeatable, and leaves cleanup/warm schedules alone', async t => {
  const { db, scalar } = await fixture(t);
  await db.exec(`create schema cron;
    create table cron.job(jobid bigint,jobname text,schedule text,command text);
    insert into cron.job values(1,'mdify-jobs-tick','* * * * *','legacy tick'),
      (2,'mdify-keepwarm-record','5 0 * * *','select public.keepwarm_record();'),
      (3,'mdify-cleanup-expired-jobs','*/30 * * * *','existing cleanup'),
      (4,'mdify-keepwarm-ocr','*/30 12-23 * * *','select public.keepwarm_ping();');
    create function cron.alter_job(job_id bigint,schedule text default null,command text default null)
      returns void language sql as $$ update cron.job j set schedule=coalesce($2,j.schedule),command=coalesce($3,j.command) where j.jobid=$1 $$;
    create table vault.secrets(id uuid default gen_random_uuid(),name text);
    insert into vault.secrets(name) values('mdify_keepwarm_url_o1'),('mdify_keepwarm_url_o2');
    create function vault.update_secret(secret_id uuid,new_secret text) returns void language sql as $$
      update vault.decrypted_secrets d set decrypted_secret=$2 from vault.secrets s where s.id=$1 and s.name=d.name $$;
  `);
  const script = fs.readFileSync(new URL('../../../supabase/llmiser-cron-cutover.sql', import.meta.url), 'utf8');
  await db.exec(script); await db.exec(script);
  assert.equal(await scalar('select count(*)::int from cron.job'), 4);
  assert.equal(await scalar("select command from cron.job where jobid=1"), 'select public.dispatch_jobs_tick();');
  assert.equal(await scalar("select schedule from cron.job where jobid=2"), '*/5 * * * *');
  assert.equal(await scalar("select command from cron.job where jobid=3"), 'existing cleanup');
  assert.equal(await scalar("select schedule from cron.job where jobid=4"), '*/30 12-23 * * *');
  assert.equal(await scalar("select decrypted_secret from vault.decrypted_secrets where name='mdify_keepwarm_url_o1'"), 'https://llmiser-ocr-o1o.onrender.com');
  await db.exec("insert into cron.job values(5,'mdify-jobs-tick','* * * * *','duplicate')");
  await assert.rejects(db.exec(script), /Expected one existing tick/);
  await db.exec('rollback');
});
