-- Green Mile — Supabase schema (run in SQL Editor, or via the Supabase MCP migration)

-- ---------- profiles: 1:1 with auth.users ----------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  handle         text,
  category       text default 'E16',
  resident_since date,
  card_expires   date,
  updated_at     timestamptz default now()
);

-- ---------- trips ----------
create table if not exists public.trips (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  country    text not null,
  city       text,
  code       text,                 -- 2-letter ISO; flag rendered client-side
  departed   date not null,
  returned   date,                 -- null = ongoing trip
  reason     text,
  created_at timestamptz default now()
);
create index if not exists trips_user_idx on public.trips(user_id, departed);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.trips    enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own trips" on public.trips;
create policy "own trips" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- auto-create profile from sign-up metadata ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, handle, category, resident_since, card_expires)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'handle', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'category', ''), 'E16'),
    nullif(new.raw_user_meta_data->>'resident_since', '')::date,
    nullif(new.raw_user_meta_data->>'card_expires', '')::date
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
