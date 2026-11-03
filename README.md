# Tackle

A calm weekly planner: tasks live in day themes, not dates.

- **App:** https://trevco623.github.io/tackle/ — Google sign-in, synced with Supabase, installable PWA with a weekday 8:30am nudge.
- **Prototype:** https://trevco623.github.io/tackle/prototype/ — sample data and day switcher, for design work.

## Layout
- `index.html` — the app (built from the same source as the prototype; `window.TACKLE_APP` switches on real-app mode)
- `app.js` — sign-in, sync, push opt-in · `config.js` — public Supabase URL/anon key + VAPID public key
- `sw.js`, `manifest.webmanifest`, `icons/` — PWA
- `supabase/setup.sql` — tables + row-level security · `supabase/schedule.sql` — hourly cron
- `supabase/functions/daily-nudge/` — sends the push (deployed in Supabase as `quick-task`)
