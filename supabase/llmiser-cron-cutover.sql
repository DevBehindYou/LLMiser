-- Existing shared project only. Apply 20261023000000_mdify_cron_efficiency.sql
-- first. Update existing jobs in place: never create a second queue scheduler.
-- No cleanup job, retention rule, credentials, or OCR warm window is changed.
begin;
do $$
begin
  if (select count(*) from cron.job where jobname='mdify-jobs-tick') <> 1
    or (select count(*) from cron.job where jobname='mdify-keepwarm-record') <> 1 then
    raise exception 'Expected one existing tick and one recorder job';
  end if;
  if to_regprocedure('public.dispatch_jobs_tick()') is null then
    raise exception 'Apply the cron efficiency migration first';
  end if;
  if (select count(*) from vault.secrets where name='mdify_keepwarm_url_o1') <> 1
    or (select count(*) from vault.secrets where name='mdify_keepwarm_url_o2') <> 1 then
    raise exception 'Expected one Vault URL per OCR instance';
  end if;
  perform vault.update_secret((select id from vault.secrets where name='mdify_keepwarm_url_o1'),
    'https://llmiser-ocr-o1o.onrender.com');
  perform vault.update_secret((select id from vault.secrets where name='mdify_keepwarm_url_o2'),
    'https://llmiser-ocr-o2o.onrender.com');
  perform cron.alter_job((select jobid from cron.job where jobname='mdify-jobs-tick'),
    schedule := '* * * * *', command := 'select public.dispatch_jobs_tick();');
  perform cron.alter_job((select jobid from cron.job where jobname='mdify-keepwarm-record'),
    schedule := '*/5 * * * *',
    command := 'select public.keepwarm_record(); select public.record_scheduled_http_responses();');
end $$;
commit;
