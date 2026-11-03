-- Tackle: run the daily-nudge function every 15 minutes.
-- The function only sends on weekdays at each subscriber's chosen time, in their time zone.
-- Replace the <...> values, then paste into Supabase → SQL Editor → Run.
-- The daily-nudge function must have JWT verification turned off; it checks x-cron-secret instead.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('tackle-daily-nudge') where exists (select 1 from cron.job where jobname = 'tackle-daily-nudge');
select cron.schedule('tackle-daily-nudge', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/quick-task',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', '<PUBLISHABLE_KEY>',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
$$);
