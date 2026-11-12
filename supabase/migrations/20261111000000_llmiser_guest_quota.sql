-- Apply before quota-aware frontend. Enforcement remains OFF until verified.
begin;
create schema if not exists quota_private;
revoke all on schema quota_private from public, anon, authenticated;
grant usage on schema quota_private to service_role;

create table if not exists quota_private.policy (
  singleton boolean primary key default true check(singleton),
  enabled boolean not null default false,
  activated_at timestamptz,
  guest_limit integer not null default 20 check(guest_limit between 1 and 100),
  version integer not null default 1 check(version > 0)
);
insert into quota_private.policy(singleton) values(true) on conflict do nothing;
create or replace function quota_private.activate_policy() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  new.activated_at := old.activated_at;
  if new.enabled and new.activated_at is null then new.activated_at := clock_timestamp(); end if;
  return new;
end $$;
drop trigger if exists quota_activation on quota_private.policy;
create trigger quota_activation before update on quota_private.policy
for each row execute function quota_private.activate_policy();

create table if not exists quota_private.batches (
  subject_hash text not null check(subject_hash ~ '^[a-f0-9]{64}$'),
  request_id uuid not null,
  manifest_hash text not null check(manifest_hash ~ '^[a-f0-9]{64}$'),
  admitted_at timestamptz not null,
  primary key(subject_hash,request_id)
);
create table if not exists quota_private.slots (
  slot_id uuid primary key default gen_random_uuid(),
  subject_hash text not null,
  request_id uuid not null,
  file_id uuid not null,
  job_id uuid unique,
  state text not null default 'reserved' check(state in ('reserved','started','released','expired')),
  admitted_at timestamptz not null,
  expires_at timestamptz not null,
  started_at timestamptz,
  unique(subject_hash,request_id,file_id),
  foreign key(subject_hash,request_id) references quota_private.batches on delete cascade,
  check ((state='started') = (started_at is not null))
);
create index if not exists quota_subject_window on quota_private.slots(subject_hash,admitted_at);
create index if not exists quota_batch_expiry on quota_private.batches(admitted_at);
alter table public.jobs add column if not exists quota_slot_id uuid;
-- Deliberately no cascading job FK: deleting a result cannot refund usage.
alter table quota_private.policy enable row level security;
alter table quota_private.batches enable row level security;
alter table quota_private.slots enable row level security;
revoke all on all tables in schema quota_private from public,anon,authenticated;
grant select on quota_private.policy to service_role;
grant select,insert,update,delete on quota_private.batches,quota_private.slots to service_role;

create or replace function public.quota_policy() returns jsonb
language sql security invoker set search_path='' as $$
 select jsonb_build_object('enabled',enabled,'limit',guest_limit,'windowHours',24,'policyVersion',version)
 from quota_private.policy where singleton;
$$;

create or replace function public.quota_snapshot(p_subject_hash text,p_requested integer default 1) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare p quota_private.policy; t timestamptz; used_n integer; reserved_n integer; n integer;
 next_at timestamptz; fit_at timestamptz;
begin
 if p_subject_hash is null or p_subject_hash !~ '^[a-f0-9]{64}$' or p_requested not between 1 and 20 then raise exception 'invalid quota request'; end if;
 perform pg_advisory_xact_lock(hashtextextended('llmiser-quota:'||p_subject_hash,0));
 t:=clock_timestamp();
 select * into strict p from quota_private.policy where singleton;
 select count(*) filter(where state='started'),count(*) filter(where state='reserved') into used_n,reserved_n
 from quota_private.slots where subject_hash=p_subject_hash and admitted_at>t-interval '24 hours'
 and (state='started' or (state='reserved' and expires_at>t));
 n:=used_n+reserved_n;
 with releases as (
  select case when state='started' then admitted_at+interval '24 hours' else least(expires_at,admitted_at+interval '24 hours') end as at
  from quota_private.slots where subject_hash=p_subject_hash and admitted_at>t-interval '24 hours'
  and (state='started' or (state='reserved' and expires_at>t))
 ), ordered as (select at,row_number() over(order by at) as rn from releases)
 select min(at),min(at) filter(where rn=greatest(1,n+p_requested-p.guest_limit)) into next_at,fit_at from ordered;
 return jsonb_build_object('enabled',p.enabled,'tier','guest','limit',p.guest_limit,'used',used_n,'reserved',reserved_n,
 'remaining',greatest(0,p.guest_limit-n),'windowHours',24,'requested',p_requested,
 'nextSlotAvailableAt',next_at,'requestedAvailableAt',case when n+p_requested<=p.guest_limit then t else fit_at end,
 'serverTime',t,'policyVersion',p.version);
end $$;

-- All legacy job creators must pass through a slot when policy is enabled.
create or replace function quota_private.bind_job() returns trigger
language plpgsql security invoker set search_path='' as $$
declare sid uuid; s quota_private.slots;
begin
 sid:=nullif(current_setting('llmiser.quota_slot',true),'')::uuid;
 if sid is null and not (select enabled from quota_private.policy where singleton) then return new; end if;
 select * into s from quota_private.slots where slot_id=sid;
 if s.slot_id is null or s.job_id is not null or s.state<>'reserved' or s.expires_at<=clock_timestamp() then
  raise exception using errcode='PT428',message='QUOTA_RESERVATION_REQUIRED';
 end if;
 new.quota_slot_id:=sid;
 return new;
end $$;
drop trigger if exists llmiser_quota_job on public.jobs;
create trigger llmiser_quota_job before insert on public.jobs for each row execute function quota_private.bind_job();

create or replace function public.reserve_quota_batch(p_subject_hash text,p_request_id uuid,p_files jsonb,p_bucket text,p_budget_bytes bigint default 838860800)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare snap jsonb; b quota_private.batches; f jsonb; sid uuid; job jsonb; result jsonb; t timestamptz;
begin
 if p_request_id is null or jsonb_typeof(p_files) is distinct from 'array' then raise exception 'invalid quota manifest'; end if;
 if jsonb_array_length(p_files) not between 1 and 20 then raise exception 'invalid quota batch size'; end if;
 if (select count(distinct value->>'file_id') from jsonb_array_elements(p_files))<>jsonb_array_length(p_files) then raise exception 'duplicate file IDs'; end if;
 snap:=public.quota_snapshot(p_subject_hash,jsonb_array_length(p_files));
 if not (snap->>'enabled')::boolean then return jsonb_build_object('enabled',false); end if;
 select * into b from quota_private.batches where subject_hash=p_subject_hash and request_id=p_request_id;
 if found then
  if b.manifest_hash<>encode(sha256(convert_to(p_files::text,'UTF8')),'hex') then return jsonb_build_object('allowed',false,'code','IDEMPOTENCY_CONFLICT','status',409); end if;
  if exists(select 1 from quota_private.slots where subject_hash=p_subject_hash and request_id=p_request_id
    and (state in ('expired','released') or (state='reserved' and expires_at<=clock_timestamp()))) then
   return jsonb_build_object('allowed',false,'code','QUOTA_RESERVATION_EXPIRED','status',410);
  end if;
 else
  if (snap->>'remaining')::integer<jsonb_array_length(p_files) then
   return snap||jsonb_build_object('allowed',false,'code','DAILY_FILE_LIMIT','status',429);
  end if;
  t:=clock_timestamp();
  insert into quota_private.batches values(p_subject_hash,p_request_id,encode(sha256(convert_to(p_files::text,'UTF8')),'hex'),t);
  for f in select value from jsonb_array_elements(p_files) loop
   insert into quota_private.slots(subject_hash,request_id,file_id,admitted_at,expires_at)
    values(p_subject_hash,p_request_id,(f->>'file_id')::uuid,t,t+interval '3 hours') returning slot_id into sid;
   perform set_config('llmiser.quota_slot',sid::text,true);
   job:=public.create_reserved_upload_job(p_bucket,f->>'filename',f->>'extension',(f->>'size')::bigint,
    f->>'content_type',f->>'profile',f->>'source_type',f->>'workload_type',p_budget_bytes);
   if (job->>'allowed')::boolean is distinct from true then
    raise exception using errcode='PT503',message='BATCH_CAPACITY';
   end if;
   update quota_private.slots set job_id=(job->>'job_id')::uuid where slot_id=sid;
  end loop;
  perform set_config('llmiser.quota_slot','',true);
 end if;
 select jsonb_agg(jsonb_build_object('file_id',file_id,'job_id',job_id) order by file_id) into result
 from quota_private.slots where subject_hash=p_subject_hash and request_id=p_request_id;
 return jsonb_build_object('enabled',true,'allowed',true,'request_id',p_request_id,'files',result,'quota',public.quota_snapshot(p_subject_hash));
exception when sqlstate 'PT503' then
 -- The entire subtransaction (all new jobs/slots) rolls back, never a partial batch.
 return jsonb_build_object('allowed',false,'code','BATCH_CAPACITY','status',503);
end $$;

-- A slot authorizes exactly one job. Re-signing after 45 minutes is prohibited:
-- the original three-hour byte guard must outlive every two-hour upload URL.
create or replace function public.quota_upload(p_subject_hash text,p_request_id uuid,p_file_id uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare s quota_private.slots; j public.jobs; t timestamptz; uploaded boolean;
begin
 perform pg_advisory_xact_lock(hashtextextended('llmiser-quota:'||p_subject_hash,0));
 t:=clock_timestamp();
 select * into s from quota_private.slots where subject_hash=p_subject_hash and request_id=p_request_id and file_id=p_file_id;
 if s.slot_id is null then return jsonb_build_object('allowed',false,'code','QUOTA_RESERVATION_REQUIRED','status',428); end if;
 if s.state in ('released','expired') or (s.state='reserved' and s.expires_at<=t) then
  return jsonb_build_object('allowed',false,'code','QUOTA_RESERVATION_EXPIRED','status',410);
 end if;
 select * into j from public.jobs where job_id=s.job_id;
 if j.job_id is null or j.files_deleted_at is not null then return jsonb_build_object('allowed',false,'code','RESULT_EXPIRED','status',410); end if;
 -- An upload can succeed even if the client loses the PUT response. Resume
 -- the existing object through start_uploaded_job's size validation.
 select exists(select 1 from public.file_objects f join storage.objects o
   on o.bucket_id=f.bucket and o.name=f.object_path
   where f.job_id=j.job_id and f.kind='INPUT') into uploaded;
 if j.status='UPLOADING' and not uploaded and t>=s.admitted_at+interval '45 minutes' then
  return jsonb_build_object('allowed',false,'code','UPLOAD_WINDOW_EXPIRED','status',410);
 end if;
 return jsonb_build_object('allowed',true,'job_id',j.job_id,'status',j.status,'extension',j.source_extension,'upload_required',j.status='UPLOADING' and not uploaded,
  'object_path','jobs/'||j.job_id||'/input/source.'||j.source_extension);
end $$;

-- Runs inside the existing durable claim transaction. Returning NULL skips
-- an expired/released work item, so the scheduler never dispatches its bytes.
create or replace function quota_private.start_work() returns trigger
language plpgsql security invoker set search_path='' as $$
declare sid uuid; sh text; s quota_private.slots; p quota_private.policy; created timestamptz; t timestamptz;
begin
 if new.status<>'RUNNING' or (tg_op='UPDATE' and old.status='RUNNING') then return new; end if;
 select quota_slot_id,created_at into sid,created from public.jobs where job_id=new.job_id;
 select * into strict p from quota_private.policy where singleton;
 if sid is null then
  if p.enabled and created>=p.activated_at then return null; end if;
  return new; -- pre-activation recovery remains compatible
 end if;
 select subject_hash into sh from quota_private.slots where slot_id=sid;
 if sh is null then return null; end if;
 -- A claim can touch several subjects in queue order. Skip contention instead
 -- of waiting while holding another subject or pool lock.
 if not pg_try_advisory_xact_lock(hashtextextended('llmiser-quota:'||sh,0)) then return null; end if;
 t:=clock_timestamp();
 select * into s from quota_private.slots where slot_id=sid;
 if s.state='started' then return new; end if;
 if s.state<>'reserved' or s.expires_at<=t then return null; end if;
 update quota_private.slots set state='started',started_at=t where slot_id=sid;
 return new;
end $$;
drop trigger if exists llmiser_quota_work on public.work_items;
create trigger llmiser_quota_work before insert or update of status on public.work_items
for each row execute function quota_private.start_work();

create or replace function public.release_quota_batch(p_subject_hash text,p_request_id uuid) returns integer
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 perform pg_advisory_xact_lock(hashtextextended('llmiser-quota:'||p_subject_hash,0));
 update quota_private.slots set state='released' where subject_hash=p_subject_hash and request_id=p_request_id and state='reserved';
 get diagnostics n=row_count;
 return n;
end $$;

-- Bounded metadata cleanup; never deletes file objects or refunds started jobs.
create or replace function public.prune_quota_ledger() returns integer
language plpgsql security invoker set search_path='' as $$
declare n integer; candidate record;
begin
 for candidate in select distinct s.subject_hash from quota_private.slots s
   left join public.jobs j on j.job_id=s.job_id
   where s.state='reserved' and (s.expires_at<=clock_timestamp() or j.status in ('FAILED','CANCELLED','DELETED') or j.job_id is null)
   order by s.subject_hash limit 200 loop
  perform pg_advisory_xact_lock(hashtextextended('llmiser-quota:'||candidate.subject_hash,0));
  update quota_private.slots s set state=case when s.expires_at<=clock_timestamp() then 'expired' else 'released' end
   where s.subject_hash=candidate.subject_hash and s.state='reserved'
   and (s.expires_at<=clock_timestamp() or not exists(select 1 from public.jobs j where j.job_id=s.job_id and j.status not in ('FAILED','CANCELLED','DELETED')));
 end loop;
 with stale as (
  select b.subject_hash,b.request_id from quota_private.batches b where b.admitted_at<clock_timestamp()-interval '7 days'
  and not exists(select 1 from quota_private.slots s join public.jobs j on j.job_id=s.job_id
   where s.subject_hash=b.subject_hash and s.request_id=b.request_id and j.status in ('UPLOADING','QUEUED','PROCESSING','CANCEL_REQUESTED'))
  order by b.admitted_at limit 200 for update skip locked
 ) delete from quota_private.batches b using stale s where b.subject_hash=s.subject_hash and b.request_id=s.request_id;
 get diagnostics n=row_count;
 return n;
end $$;

revoke all on all functions in schema quota_private from public,anon,authenticated;
grant execute on all functions in schema quota_private to service_role;
revoke all on function public.quota_policy(),public.quota_snapshot(text,integer),public.reserve_quota_batch(text,uuid,jsonb,text,bigint),public.quota_upload(text,uuid,uuid),public.release_quota_batch(text,uuid),public.prune_quota_ledger() from public,anon,authenticated;
grant execute on function public.quota_policy(),public.quota_snapshot(text,integer),public.reserve_quota_batch(text,uuid,jsonb,text,bigint),public.quota_upload(text,uuid,uuid),public.release_quota_batch(text,uuid),public.prune_quota_ledger() to service_role;
-- Filter invalid slots before fair selection; expired roots cannot starve other jobs.
create or replace function public.claim_work_items(
  p_pool text,
  p_capacity integer,
  p_limit integer default 4,
  p_job_id uuid default null,
  p_lease interval default interval '6 minutes'
)
returns setof public.work_items
language plpgsql
set search_path = public
as $$
declare
  v_inflight integer;
  v_slots integer;
begin
  perform pg_advisory_xact_lock(hashtext('mdify_claim_' || p_pool));

  select count(*) into v_inflight
    from public.work_items
   where pool = p_pool and status = 'RUNNING' and lease_until > now();
  v_slots := least(greatest(p_limit, 0), greatest(p_capacity - v_inflight, 0));
  if v_slots = 0 then
    return;
  end if;

  return query
  with ranked as (
    select w.work_item_id,
           row_number() over (partition by w.job_id order by w.priority, w.sequence_index, w.created_at) as rn,
           j.created_at as job_created
      from public.work_items w
      join public.jobs j on j.job_id = w.job_id
     where w.pool = p_pool
       and w.status = 'QUEUED'
       and j.status in ('QUEUED','PROCESSING')
       and (
         (j.quota_slot_id is null and (not (select enabled from quota_private.policy where singleton)
           or j.created_at < (select activated_at from quota_private.policy where singleton)))
         or exists (select 1 from quota_private.slots qs where qs.slot_id=j.quota_slot_id
           and (qs.state='started' or (qs.state='reserved' and qs.expires_at>clock_timestamp())))
       )
       and (p_job_id is null or w.job_id = p_job_id)
  ),
  picked as (
    select w.work_item_id
      from public.work_items w
      join ranked r on r.work_item_id = w.work_item_id
     order by r.rn, r.job_created, w.priority, w.sequence_index
     limit v_slots
       for update of w skip locked
  ),
  claimed as (
    update public.work_items w
       set status = 'RUNNING',
           attempt_count = w.attempt_count + 1,
           claimed_at = now(),
           lease_until = now() + p_lease,
           error_code = null,
           error_message = null
      from picked p
     where w.work_item_id = p.work_item_id
    returning w.*
  ),
  -- Data-modifying CTEs run exactly once whether or not the final SELECT reads them.
  touched as (
    update public.jobs j
       set status = 'PROCESSING',
           started_at = coalesce(j.started_at, now())
     where j.job_id in (select c.job_id from claimed c)
    returning j.job_id
  ),
  nodes as (
    update public.content_nodes n
       set status = 'PROCESSING'
      from claimed c
     where n.node_id = c.node_id and n.status = 'PENDING'
    returning n.node_id
  )
  select c.* from claimed c;
end;
$$;
commit;
