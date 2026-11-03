// Tackle daily nudge. Called every 15 minutes by pg_cron; sends on weekdays at each subscriber's chosen time (their time zone).
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
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { day: get('weekday'), mins: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('Unauthorized', { status: 401 });
  const force = new URL(req.url).searchParams.get('force') === '1';

  webpush.setVapidDetails('https://trevco623.github.io/tackle/', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: subs, error } = await sb.from('push_subscriptions').select('endpoint, sub, tz, nudge_time');
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0, removed = 0;
  for (const s of subs ?? []) {
    const { day, mins } = localParts(s.tz || 'America/New_York');
    const [h, m] = String(s.nudge_time || '08:30').split(':').map(Number);
    const due = h * 60 + m;
    const phrase = PHRASE[day];
    // Fire in the 15-minute window that starts at the chosen time (cron runs at :00, :15, :30, :45).
    if (!force && (!phrase || mins < due || mins >= due + 15)) continue;
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
