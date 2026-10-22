-- Keep existing scheduler/Vault names. No schedules or Vault values are
-- changed by this migration; activate the dispatcher with cron.sql or the
-- bounded cutover script after testing. Only postgres may invoke these RPCs.

create table if not exists public.scheduled_http_requests (
  request_id bigint primary key,
  requested_at timestamptz not null default now(),
  status_code integer,
  error text,
  recorded_at timestamptz
);
create index if not exists scheduled_http_requests_time
  on public.scheduled_http_requests (requested_at desc);
alter table public.scheduled_http_requests enable row level security;
revoke all on public.scheduled_http_requests from public, anon, authenticated, service_role;

-- Persist outcomes, not bodies/headers/URLs. Cron SQL success only means
-- pg_net accepted a request, not that its HTTP response succeeded.
create or replace function public.record_scheduled_http_responses()
returns integer language plpgsql set search_path = '' as $$
declare n integer;
begin
  update public.scheduled_http_requests p
     set status_code = r.status_code,
         error = case when r.timed_out then 'timeout'
                      when r.error_msg is not null then 'transport error'
                      when r.status_code is null then 'missing HTTP status'
                      when r.status_code not between 200 and 299 then 'HTTP ' || r.status_code end,
         recorded_at = now()
    from net._http_response r where r.id=p.request_id and p.recorded_at is null;
  get diagnostics n = row_count;
  update public.scheduled_http_requests set error='no response recorded',recorded_at=now()
   where recorded_at is null and requested_at < now()-interval '6 minutes';
  delete from public.scheduled_http_requests where recorded_at is not null
   and ((error is null and requested_at < now()-interval '1 day') or requested_at < now()-interval '14 days');
  return n;
end $$;

-- Database maintenance runs even when there is no worker work. An idle
-- queue therefore needs no Vercel invocation. Active jobs retain the minute
-- cadence. A pending 300s HTTP call gets 30s grace before another is queued.
create or replace function public.dispatch_jobs_tick()
returns bigint language plpgsql set search_path = '' as $$
declare v_secret text; v_request bigint;
begin
  if not pg_catalog.pg_try_advisory_xact_lock(1279872339, 1) then return null; end if;
  perform public.record_scheduled_http_responses();
  perform public.prune_public_admission();
  perform public.sweep_stale_jobs();
  -- Expired leases can outlive their parent job. Release them even when
  -- no active job remains, preserving the original tick's maintenance.
  perform public.requeue_expired_work_items();
  if not exists(select 1 from public.jobs where status in ('QUEUED','PROCESSING','CANCEL_REQUESTED')) then return null; end if;
  if exists(select 1 from public.scheduled_http_requests where recorded_at is null
             and requested_at > now()-interval '330 seconds') then return null; end if;
  if (select count(*) from vault.decrypted_secrets where name='mdify_cron_secret') <> 1 then
    raise exception 'Expected one mdify_cron_secret in Vault';
  end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='mdify_cron_secret';
  if coalesce(v_secret,'')='' then raise exception 'Cron secret is empty'; end if;
  v_request := net.http_post(
    url := 'https://llmiser.devbehindyou.com/api/jobs/tick',
    headers := jsonb_build_object('Content-Type','application/json','x-mdify-cron-secret',v_secret),
    body := '{}'::jsonb, timeout_milliseconds := 300000);
  insert into public.scheduled_http_requests(request_id) values(v_request);
  return v_request;
end $$;

-- Coalesce overlapping/manual warmups. This does not increase the scheduled
-- warm window or keep services awake all day. Failed/unconfirmed pings do
-- not imply an awake instance when choosing the request timeout.
create or replace function public.keepwarm_ping()
returns integer language plpgsql set search_path = '' as $$
declare
  v_backend record; v_instance text; v_url text;
  v_last timestamptz; v_request bigint; v_queued integer := 0; v_seen boolean := false;
begin
  if not pg_catalog.pg_try_advisory_xact_lock(1279872339, 2) then return 0; end if;
  begin perform public.keepwarm_record();
  exception when others then raise warning 'keepwarm_record failed'; end;
  for v_backend in select name,decrypted_secret from vault.decrypted_secrets
    where name like 'mdify\_keepwarm\_url\_%' order by name
  loop
    v_seen := true;
    v_instance := upper(substr(v_backend.name,length('mdify_keepwarm_url_')+1));
    if exists(select 1 from public.keepwarm_pings where instance=v_instance
      and request_id is not null and requested_at > now()-interval '2 minutes') then continue; end if;
    begin
      v_url := rtrim(btrim(coalesce(v_backend.decrypted_secret,'')),'/');
      if v_url !~ '^https://[a-zA-Z0-9][a-zA-Z0-9.-]*$' then raise exception 'Expected an HTTPS base hostname'; end if;
      select max(requested_at) into v_last from public.keepwarm_pings
       where instance=v_instance and status_code between 200 and 299 and error is null and recorded_at is not null;
      v_request := net.http_get(url := v_url || '/api/v1/health',
        timeout_milliseconds := case when v_last > now()-interval '15 minutes' then 10000 else 90000 end);
      insert into public.keepwarm_pings(instance,request_id) values(v_instance,v_request);
      v_queued := v_queued+1;
    exception when others then
      insert into public.keepwarm_pings(instance,error,recorded_at)
        values(v_instance,'not sent: invalid URL or queue failure',now());
    end;
  end loop;
  if not v_seen then
    insert into public.keepwarm_pings(instance,error,recorded_at)
      values('-','not sent: no mdify_keepwarm_url_* secret in Vault',now());
  end if;
  return v_queued;
end $$;

revoke all on function public.record_scheduled_http_responses(), public.dispatch_jobs_tick(), public.keepwarm_ping()
  from public, anon, authenticated, service_role;
