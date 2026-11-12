import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { freshDb } from './pgliteDb.mjs';

const subject = 'a'.repeat(64);
const manifest = n => Array.from({ length: n }, (_, i) => ({ file_id: randomUUID(), filename: `fixture-${i}.txt`, extension: 'txt', size: 12, content_type: 'text/plain', profile: 'standard', source_type: 'DOCUMENT', workload_type: 'NORMAL' }));
test('quota admission, lifecycle, permissions and expiry use shipped SQL', async t => {
  const db = await freshDb();
  t.after(() => db.close());
  const snapshot = async () => (await db.query('select public.quota_snapshot($1) as result', [subject])).rows[0].result;
  const reserve = async (files, id = randomUUID()) => (await db.query('select public.reserve_quota_batch($1,$2,$3,\'mdify-pro-files\') as result', [subject, id, JSON.stringify(files)])).rows[0].result;
  const reset = async () => db.exec('truncate public.jobs cascade; truncate public.job_storage_reservations; truncate quota_private.batches cascade; update quota_private.policy set enabled=true;');
  assert.equal((await db.query('select public.quota_policy() as p')).rows[0].p.enabled, false);

  await t.test('20 files reserve once; conflicting replay and 21st are denied', async () => {
    await reset();
    const files = manifest(20), id = randomUUID();
    const first = await reserve(files, id);
    assert.equal(first.allowed, true);
    assert.equal(first.files.length, 20);
    assert.deepEqual((await reserve(files, id)).files, first.files);
    assert.equal((await reserve(manifest(1), id)).code, 'IDEMPOTENCY_CONFLICT');
    const denied = await reserve(manifest(1));
    assert.equal(denied.code, 'DAILY_FILE_LIMIT');
    assert.equal(denied.remaining, 0);
    assert.equal((await snapshot()).reserved, 20);
    assert.equal((await db.query('select count(*)::int n from public.jobs')).rows[0].n, 20);
  });
  await t.test('whole selection rejects with actual remaining; release is idempotent', async () => {
    await reset();
    const id = randomUUID();
    await reserve(manifest(19), id);
    const denied = await reserve(manifest(2));
    assert.equal(denied.remaining, 1);
    assert.equal(denied.requested, 2);
    assert.equal((await db.query('select count(*)::int n from public.jobs')).rows[0].n, 19);
    assert.equal((await db.query('select public.release_quota_batch($1,$2) as n', [subject,id])).rows[0].n, 19);
    assert.equal((await db.query('select public.release_quota_batch($1,$2) as n', [subject,id])).rows[0].n, 0);
    assert.equal((await snapshot()).remaining, 20);
    assert.equal((await db.query('select count(*)::int n from public.job_storage_reservations')).rows[0].n, 19, 'byte guards are not refunded');
  });
  await t.test('worker claim charges once, including retries; started slots cannot refund', async () => {
    await reset();
    const id = randomUUID();
    const { files } = await reserve(manifest(1),id);
    const job = files[0].job_id;
    await db.query("select public.start_uploaded_job($1,'mdify-pro-files',12)",[job]);
    assert.equal((await snapshot()).used,0);
    const claim = await db.query("select * from public.claim_work_items('normal',4,1,$1)",[job]);
    assert.equal(claim.rows.length,1);
    assert.equal((await snapshot()).used,1);
    assert.equal((await snapshot()).reserved,0);
    assert.equal((await db.query('select public.release_quota_batch($1,$2) as n',[subject,id])).rows[0].n,0);
    await db.query("update public.work_items set status='QUEUED' where job_id=$1",[job]);
    await db.query("select * from public.claim_work_items('normal',4,1,$1)",[job]);
    assert.equal((await snapshot()).used,1);
    await db.exec("update quota_private.slots set admitted_at=clock_timestamp()-interval '24 hours 1 second'");
    assert.equal((await snapshot()).remaining,20);
  });
  await t.test('retry resumes an existing upload after its signing window closes', async () => {
    await reset();
    const id = randomUUID();
    const { files: [file] } = await reserve(manifest(1), id);
    const authorization = async () => (await db.query('select public.quota_upload($1,$2,$3) as result',
      [subject, id, file.file_id])).rows[0].result;
    assert.equal((await authorization()).upload_required, true);
    await db.exec("update quota_private.slots set admitted_at=clock_timestamp()-interval '46 minutes'");
    assert.equal((await authorization()).code, 'UPLOAD_WINDOW_EXPIRED');
    await db.query("insert into storage.objects(bucket_id,name,metadata) values('mdify-pro-files',$1,'{\"size\":12}')",
      [`jobs/${file.job_id}/input/source.txt`]);
    const replay = await authorization();
    assert.equal(replay.job_id, file.job_id);
    assert.equal(replay.upload_required, false);
    assert.equal((await snapshot()).reserved, 1);
  });
  await t.test('expired reservation cannot sign or dispatch and does not starve valid work', async () => {
    await reset();
    const id = randomUUID(), old = await reserve(manifest(1), id);
    await db.query("select public.start_uploaded_job($1,'mdify-pro-files',12)",[old.files[0].job_id]);
    await db.exec("update quota_private.slots set expires_at=clock_timestamp()-interval '1 second'");
    assert.equal((await snapshot()).remaining,20);
    assert.equal((await reserve(manifest(1),id)).code,'IDEMPOTENCY_CONFLICT');
    const signed = (await db.query('select public.quota_upload($1,$2,$3) as r',[subject,id,old.files[0].file_id])).rows[0].r;
    assert.equal(signed.code,'QUOTA_RESERVATION_EXPIRED');
    const fresh = await reserve(manifest(1));
    await db.query("select public.start_uploaded_job($1,'mdify-pro-files',12)",[fresh.files[0].job_id]);
    const claim = await db.query("select * from public.claim_work_items('normal',4,1)");
    assert.equal(claim.rows.length,1);
    assert.equal(claim.rows[0].job_id,fresh.files[0].job_id);
  });
  await t.test('legacy inserts and anonymous RPCs cannot mint quota jobs', async () => {
    await reset();
    await assert.rejects(db.query("select public.create_reserved_upload_job('mdify-pro-files','a.txt','txt',12,null,'standard','DOCUMENT','NORMAL')"),/QUOTA_RESERVATION_REQUIRED/);
    await db.exec('set role anon');
    try {
      await assert.rejects(db.query('select public.quota_snapshot($1)',[subject]),/permission denied/);
      await assert.rejects(db.query('select * from quota_private.slots'),/permission denied/);
    } finally { await db.exec('reset role'); }
  });
  await t.test('existing capacity failure rolls back all files and quota slots', async () => {
    await reset();
    await db.exec('update quota_private.policy set enabled=false');
    await db.exec("insert into public.jobs(status) select 'UPLOADING' from generate_series(1,31)");
    await db.exec('update quota_private.policy set enabled=true');
    assert.equal((await reserve(manifest(2))).code,'BATCH_CAPACITY');
    assert.equal((await snapshot()).reserved,0);
    assert.equal((await db.query('select count(*)::int n from public.jobs')).rows[0].n,31);
  });
});
