create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cube_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  status text not null check (status in ('VALID', 'INVALID', 'SOLVED')),
  scan jsonb not null,
  solution jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cube_scans_user_created_idx on public.cube_scans(user_id, created_at desc);

create table if not exists public.solve_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.cube_scans(id) on delete set null,
  solution jsonb not null,
  duration_ms integer not null check (duration_ms > 0),
  created_at timestamptz not null default now()
);

create index if not exists solve_history_user_created_idx on public.solve_history(user_id, created_at desc);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  best_time_ms integer not null check (best_time_ms > 0),
  solves integer not null default 1 check (solves > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leaderboard_entries_rank_idx on public.leaderboard_entries(best_time_ms asc, updated_at asc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists cube_scans_set_updated_at on public.cube_scans;
create trigger cube_scans_set_updated_at
before update on public.cube_scans
for each row execute function public.set_updated_at();

drop trigger if exists leaderboard_entries_set_updated_at on public.leaderboard_entries;
create trigger leaderboard_entries_set_updated_at
before update on public.leaderboard_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'Cube Solver'), '@', 1), 'Cube Solver')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cube_scans enable row level security;
alter table public.solve_history enable row level security;
alter table public.leaderboard_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "cube_scans_select_own" on public.cube_scans;
create policy "cube_scans_select_own"
on public.cube_scans for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cube_scans_insert_own" on public.cube_scans;
create policy "cube_scans_insert_own"
on public.cube_scans for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "cube_scans_update_own" on public.cube_scans;
create policy "cube_scans_update_own"
on public.cube_scans for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "cube_scans_delete_own" on public.cube_scans;
create policy "cube_scans_delete_own"
on public.cube_scans for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "solve_history_select_own" on public.solve_history;
create policy "solve_history_select_own"
on public.solve_history for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "solve_history_insert_own" on public.solve_history;
create policy "solve_history_insert_own"
on public.solve_history for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "solve_history_delete_own" on public.solve_history;
create policy "solve_history_delete_own"
on public.solve_history for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "leaderboard_entries_select_public" on public.leaderboard_entries;
create policy "leaderboard_entries_select_public"
on public.leaderboard_entries for select
to anon, authenticated
using (true);

drop policy if exists "leaderboard_entries_insert_own" on public.leaderboard_entries;
create policy "leaderboard_entries_insert_own"
on public.leaderboard_entries for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "leaderboard_entries_update_own" on public.leaderboard_entries;
create policy "leaderboard_entries_update_own"
on public.leaderboard_entries for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
