// Tackle daily nudge. Called hourly by pg_cron; sends at 8:xx on weekdays in each subscriber's time zone.
// Secrets (Edge Functions → Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CRON_SECRET.
// Add ?force=1 to send now (still needs the x-cron-secret header) for testing.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const PHRASE: Record<string, string> = {
  Mon: 'planning the week',
  Tue: 'client work',
  Wed: 'client work',
  Thu: 'wrapping up',
  Fri: 'website and personal projects',
};

function localParts(tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { day: get('weekday'), hour: Number(get('hour')) % 24 };
}

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('Unauthorized', { status: 401 });
  const force = new URL(req.url).searchParams.get('force') === '1';

  webpush.setVapidDetails('https://trevco623.github.io/tackle/', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: subs, error } = await sb.from('push_subscriptions').select('endpoint, sub, tz');
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0, removed = 0;
  for (const s of subs ?? []) {
    const { day, hour } = localParts(s.tz || 'America/New_York');
    const phrase = PHRASE[day];
    if (!force && (!phrase || hour !== 8)) continue;
    const payload = JSON.stringify({
      title: 'What do you want to tackle today?',
      body: phrase ? `Today is for ${phrase}.` : 'Weekends are blank on purpose.',
      url: './#today',
    });
    try {
      await webpush.sendNotification(s.sub, payload, { TTL: 60 * 60 * 4 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); removed++; }
    }
  }
  return Response.json({ sent, removed });
});
