-- Tackle: run the daily-nudge function every hour at :30.
-- The function only sends where it's a weekday and 8:30am in the subscriber's time zone.
-- Replace the three <...> values, then paste into Supabase → SQL Editor → Run.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('tackle-daily-nudge') where exists (select 1 from cron.job where jobname = 'tackle-daily-nudge');
select cron.schedule('tackle-daily-nudge', '30 * * * *', $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-nudge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
$$);
