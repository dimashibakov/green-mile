create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('USCIS','DHS')),
  category text,
  title text not null,
  link text not null,
  summary text,
  published_at timestamptz,
  guid text not null,
  fetched_at timestamptz not null default now(),
  unique (source, guid)
);
create index if not exists news_published_idx on public.news (published_at desc nulls last);
alter table public.news enable row level security;
create policy "news readable by authenticated" on public.news
  for select to authenticated using (true);
