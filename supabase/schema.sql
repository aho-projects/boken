-- Boken — Supabase schema
-- Run this once in the SQL editor of a new Supabase project, then:
--   1. Create a public Storage bucket called "examples"
--   2. Copy the project URL + anon key into .env.local

create extension if not exists "pgcrypto";

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mode text not null default 'full',           -- 'full' or 'upload'
  name text,
  school text,
  rate int,                                    -- 1..5
  notes text,
  opplegg text[] not null default '{}',
  whole_book boolean not null default false
);

create table if not exists public.examples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  feedback_id uuid references public.feedback(id) on delete cascade,
  opplegg text,                                -- 'naturfag' | 'sketchnoting' | ...
  url text not null,
  storage_path text not null,
  original_name text,
  whole_book boolean not null default false
);

create index if not exists examples_opplegg_idx on public.examples (opplegg);
create index if not exists examples_created_idx on public.examples (created_at desc);

-- Row Level Security
alter table public.feedback enable row level security;
alter table public.examples enable row level security;

-- Public can insert feedback + examples (teacher submissions)
drop policy if exists "anon can insert feedback" on public.feedback;
create policy "anon can insert feedback" on public.feedback
  for insert to anon with check (true);

drop policy if exists "anon can insert examples" on public.examples;
create policy "anon can insert examples" on public.examples
  for insert to anon with check (true);

-- Public can read examples (they're shown on the site)
drop policy if exists "public can read examples" on public.examples;
create policy "public can read examples" on public.examples
  for select to anon using (true);

drop policy if exists "public can read feedback names" on public.feedback;
create policy "public can read feedback names" on public.feedback
  for select to anon using (true);

-- Storage bucket policy reminder:
--   In Storage → examples bucket → Policies, allow anon INSERT + public SELECT
--   The 'examples' bucket should be public (Public bucket = on).
