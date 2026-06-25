alter table if exists public.profiles
  add column if not exists email text not null default '',
  add column if not exists name text not null default 'Cube Solver',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.cube_scans
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text not null default 'Untitled scan',
  add column if not exists status text not null default 'VALID',
  add column if not exists scan jsonb not null default '{}'::jsonb,
  add column if not exists solution jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.solve_history
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists scan_id uuid references public.cube_scans(id) on delete set null,
  add column if not exists solution jsonb not null default '{}'::jsonb,
  add column if not exists duration_ms integer not null default 1000,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.leaderboard_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists display_name text not null default 'Cube Solver',
  add column if not exists best_time_ms integer not null default 1000,
  add column if not exists solves integer not null default 1,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists leaderboard_entries_user_id_unique_idx on public.leaderboard_entries(user_id);
create index if not exists leaderboard_entries_rank_idx on public.leaderboard_entries(best_time_ms asc, updated_at asc);
create index if not exists cube_scans_user_created_idx on public.cube_scans(user_id, created_at desc);
create index if not exists solve_history_user_created_idx on public.solve_history(user_id, created_at desc);
