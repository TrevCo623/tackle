-- Tackle: tables + row-level security. Paste into Supabase → SQL Editor → Run.

create table if not exists public.tackle_state (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at bigint not null
);
alter table public.tackle_state enable row level security;
drop policy if exists "own state" on public.tackle_state;
create policy "own state" on public.tackle_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sub jsonb not null,
  tz text not null default 'America/New_York',
  nudge_time text not null default '08:30',
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "own subs" on public.push_subscriptions;
create policy "own subs" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Added Nov 3: per-device nudge time (safe to re-run).
alter table public.push_subscriptions add column if not exists nudge_time text not null default '08:30';
