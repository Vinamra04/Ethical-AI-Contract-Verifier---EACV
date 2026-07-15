-- ============================================================
-- EACV Supabase Schema — ap-south-1 (Mumbai)
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── analyses ────────────────────────────────────────────────
-- Note: no risk_score column — classification is categorical only
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  input_type text not null check (input_type in ('text','file','url','image')),
  source_label text not null,
  risk_level text not null check (risk_level in ('low','medium','high')),
  recommendation text not null check (recommendation in ('safe','caution','risky')),
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

-- ── cached_gemini_results ────────────────────────────────────
-- Backend-only table. Accessed via service key, no user RLS needed.
create table public.cached_gemini_results (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  explanation text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

create policy "users see own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users see own analyses"
  on public.analyses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- cached_gemini_results: no user RLS — backend service key access only

-- ── Indexes ─────────────────────────────────────────────────
create index analyses_user_id_created_at on public.analyses (user_id, created_at desc);
create index cached_gemini_expires_at on public.cached_gemini_results (expires_at);

-- ── Storage bucket ──────────────────────────────────────────
-- Run separately after creating the bucket in the dashboard:
-- insert into storage.buckets (id, name, public) values ('user-uploads', 'user-uploads', false);

create policy "users access own uploads"
  on storage.objects for all
  using (auth.uid()::text = (storage.foldername(name))[1])
  with check (auth.uid()::text = (storage.foldername(name))[1]);
