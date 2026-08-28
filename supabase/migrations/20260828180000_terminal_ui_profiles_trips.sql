-- profiles: ensure resident fields (idempotent for existing green-mile DB)
alter table public.profiles
  add column if not exists handle text,
  add column if not exists category text,
  add column if not exists resident_since date,
  add column if not exists card_expires date;

-- trips (idempotent)
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country text not null,
  city text,
  code text,
  departed date not null,
  returned date,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;

drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own" on public.trips for select using (auth.uid() = user_id);

drop policy if exists "trips_insert_own" on public.trips;
create policy "trips_insert_own" on public.trips for insert with check (auth.uid() = user_id);

drop policy if exists "trips_update_own" on public.trips;
create policy "trips_update_own" on public.trips for update using (auth.uid() = user_id);

drop policy if exists "trips_delete_own" on public.trips;
create policy "trips_delete_own" on public.trips for delete using (auth.uid() = user_id);
