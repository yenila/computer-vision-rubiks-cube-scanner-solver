create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.scan_status as enum ('VALID', 'INVALID', 'SOLVED');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cube_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  status public.scan_status not null default 'VALID',
  scan jsonb not null,
  solution jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.solve_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid references public.cube_scans(id) on delete set null,
  solution jsonb not null,
  duration_ms integer not null check (duration_ms > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  best_time_ms integer not null check (best_time_ms > 0),
  solves integer not null default 1 check (solves > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cube_scans_user_created_idx on public.cube_scans(user_id, created_at desc);
create index if not exists solve_history_user_created_idx on public.solve_history(user_id, created_at desc);
create index if not exists leaderboard_best_time_idx on public.leaderboard_entries(best_time_ms asc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists cube_scans_set_updated_at on public.cube_scans;
create trigger cube_scans_set_updated_at before update on public.cube_scans
for each row execute function public.set_updated_at();

drop trigger if exists leaderboard_set_updated_at on public.leaderboard_entries;
create trigger leaderboard_set_updated_at before update on public.leaderboard_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'Cube Solver'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_leaderboard_after_solve()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.leaderboard_entries (user_id, best_time_ms, solves)
  values (new.user_id, new.duration_ms, 1)
  on conflict (user_id) do update
  set best_time_ms = least(public.leaderboard_entries.best_time_ms, excluded.best_time_ms),
      solves = public.leaderboard_entries.solves + 1,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists solve_history_update_leaderboard on public.solve_history;
create trigger solve_history_update_leaderboard
after insert on public.solve_history
for each row execute function public.update_leaderboard_after_solve();

alter table public.profiles enable row level security;
alter table public.cube_scans enable row level security;
alter table public.solve_history enable row level security;
alter table public.leaderboard_entries enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users read their own scans" on public.cube_scans;
create policy "Users read their own scans" on public.cube_scans for select using (auth.uid() = user_id);
drop policy if exists "Users create their own scans" on public.cube_scans;
create policy "Users create their own scans" on public.cube_scans for insert with check (auth.uid() = user_id);
drop policy if exists "Users update their own scans" on public.cube_scans;
create policy "Users update their own scans" on public.cube_scans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete their own scans" on public.cube_scans;
create policy "Users delete their own scans" on public.cube_scans for delete using (auth.uid() = user_id);

drop policy if exists "Users read their own solve history" on public.solve_history;
create policy "Users read their own solve history" on public.solve_history for select using (auth.uid() = user_id);
drop policy if exists "Users create their own solve history" on public.solve_history;
create policy "Users create their own solve history" on public.solve_history for insert
with check (
  auth.uid() = user_id
  and (scan_id is null or exists (
    select 1 from public.cube_scans
    where cube_scans.id = solve_history.scan_id and cube_scans.user_id = auth.uid()
  ))
);

drop policy if exists "Leaderboard is publicly readable" on public.leaderboard_entries;
create policy "Leaderboard is publicly readable" on public.leaderboard_entries for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.leaderboard_entries to anon, authenticated;
grant update on public.profiles to authenticated;
grant select, insert, update, delete on public.cube_scans to authenticated;
grant select, insert on public.solve_history to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.update_leaderboard_after_solve() from public, anon, authenticated;
