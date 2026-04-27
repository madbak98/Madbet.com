-- Run in Supabase SQL editor before production.
-- Keep service-role credentials server-side only.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null,
  avatar_url text,
  auth_provider text not null check (auth_provider in ('email', 'google', 'apple')),
  created_at timestamptz not null default now(),
  balance numeric not null default 10000,
  role text not null default 'user' check (role in ('user', 'admin')),
  kyc_status text not null default 'none' check (kyc_status in ('none', 'pending_review', 'approved', 'rejected'))
);

alter table public.profiles enable row level security;

create policy "users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "users can upsert own profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
