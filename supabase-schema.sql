-- ============================================================================
--  TSID — Supabase Schema (Production)
--  Run this entire file in the Supabase SQL Editor once.
--  Auth: Supabase Auth controls login. Roles live in user_profiles.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Drop existing tables (safe re-run) ──────────────────────────────────────
drop table if exists activity_logs    cascade;
drop table if exists request_letters  cascade;
drop table if exists certificates     cascade;
drop table if exists payments         cascade;
drop table if exists applications     cascade;
drop table if exists students         cascade;
drop table if exists schools          cascade;
drop table if exists gov_users        cascade;
drop table if exists user_profiles    cascade;

-- ── user_profiles — links Supabase Auth to TSID roles ───────────────────────
create table user_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('gov','school','student')),
  display_name text,
  ref         text,        -- school code for schools, gov id for gov, tsid for students
  created_at  timestamptz not null default now()
);

-- RLS for user_profiles
alter table user_profiles enable row level security;

-- Users can read their own profile
create policy "select_own" on user_profiles
  for select to authenticated using (auth.uid() = user_id);

-- Users can insert their own profile (on signup)
create policy "insert_own" on user_profiles
  for insert to authenticated with check (auth.uid() = user_id);

-- Users can update their own profile
create policy "update_own" on user_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Gov users table (now optional, for additional gov metadata)
create table gov_users (
  id          text primary key,
  name        text not null,
  username    text not null unique,
  password    text,           -- legacy, kept for migration
  role        text not null default 'Government Officer',
  ministry    text,
  region      text,
  phone       text,
  email       text,
  status      text not null default 'active',
  created_at  timestamptz not null default now()
);

-- ── schools ──────────────────────────────────────────────────────────────────
create table schools (
  code        text primary key,
  name        text not null,
  type        text not null,
  region      text not null,
  district    text not null,
  ward        text not null,
  contact     text,
  email       text,
  address     text,
  username    text,
  password    text,           -- legacy, kept for migration
  status      text not null default 'active',
  created_at  timestamptz not null default now()
);

-- ── students ─────────────────────────────────────────────────────────────────
create table students (
  tsid             text primary key,
  fullname         text not null,
  dob              date,
  gender           text,
  nationality      text default 'Tanzanian',
  school_name      text,
  school_code      text references schools(code) on delete set null,
  region           text,
  district         text,
  ward             text,
  school_contact   text,
  enrollment_date  date,
  level            text,
  blood_group      text,
  parent_name      text,
  parent_nida      text,
  relationship     text,
  parent_phone     text,
  issue_date       date,
  photo            text,
  status           text not null default 'active',
  remarks          jsonb not null default '[]',
  cred_username    text,
  cred_password    text,
  created_at       timestamptz not null default now()
);

-- ── applications ─────────────────────────────────────────────────────────────
create table applications (
  id               text primary key,
  fullname         text not null,
  dob              date,
  gender           text,
  nationality      text default 'Tanzanian',
  school_name      text,
  school_code      text references schools(code) on delete set null,
  region           text,
  district         text,
  ward             text,
  school_contact   text,
  enrollment_date  date,
  level            text,
  blood_group      text,
  parent_name      text,
  parent_nida      text,
  relationship     text,
  parent_phone     text,
  photo            text,
  status           text not null default 'pending',
  reject_reason    text,
  tsid             text,
  submitted_at     timestamptz not null default now(),
  decided_at       timestamptz
);

-- ── payments ─────────────────────────────────────────────────────────────────
create table payments (
  ref          text primary key,
  tsid         text references students(tsid) on delete set null,
  school_code  text references schools(code)  on delete set null,
  student_name text,
  amount       numeric not null default 0,
  currency     text not null default 'TZS',
  purpose      text default 'ID Card Processing',
  method       text,
  status       text not null default 'pending',
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- ── certificates ─────────────────────────────────────────────────────────────
create table certificates (
  id           text primary key,
  tsid         text references students(tsid) on delete cascade,
  student_name text,
  school_code  text references schools(code) on delete set null,
  school_name  text,
  title        text not null,
  issued_at    date not null default current_date,
  ref          text not null unique
);

-- ── request_letters ──────────────────────────────────────────────────────────
create table request_letters (
  ref          text primary key,
  tsid         text references students(tsid) on delete cascade,
  student_name text,
  school_code  text references schools(code) on delete set null,
  school_name  text,
  type         text not null,
  reason       text,
  addressee    text,
  urgency      text default 'normal',
  status       text not null default 'pending',
  requested_at timestamptz not null default now(),
  approved_at  timestamptz
);

-- ── activity_logs ────────────────────────────────────────────────────────────
create table activity_logs (
  id         text primary key,
  action     text not null,
  message    text,
  by_name    text,
  by_role    text,
  created_at timestamptz not null default now()
);

-- ── RLS: enable for all tables ──────────────────────────────────────────────
alter table gov_users       enable row level security;
alter table schools         enable row level security;
alter table students        enable row level security;
alter table applications    enable row level security;
alter table payments        enable row level security;
alter table certificates    enable row level security;
alter table request_letters enable row level security;
alter table activity_logs   enable row level security;

-- ── RLS Policies ────────────────────────────────────────────────────────────

-- Authenticated users can read all data tables
create policy "auth_select" on gov_users       for select to authenticated using (true);
create policy "auth_select" on schools         for select to authenticated using (true);
create policy "auth_select" on students        for select to authenticated using (true);
create policy "auth_select" on applications    for select to authenticated using (true);
create policy "auth_select" on payments        for select to authenticated using (true);
create policy "auth_select" on certificates    for select to authenticated using (true);
create policy "auth_select" on request_letters for select to authenticated using (true);
create policy "auth_select" on activity_logs   for select to authenticated using (true);

-- Anon (public) can only read students and schools (for verify/search page)
create policy "anon_select" on schools   for select to anon using (true);
create policy "anon_select" on students  for select to anon using (true);

-- Authenticated users have full write access (admin manages via Supabase)
create policy "auth_all" on gov_users       for all to authenticated using (true) with check (true);
create policy "auth_all" on schools         for all to authenticated using (true) with check (true);
create policy "auth_all" on students        for all to authenticated using (true) with check (true);
create policy "auth_all" on applications    for all to authenticated using (true) with check (true);
create policy "auth_all" on payments        for all to authenticated using (true) with check (true);
create policy "auth_all" on certificates    for all to authenticated using (true) with check (true);
create policy "auth_all" on request_letters for all to authenticated using (true) with check (true);
create policy "auth_all" on activity_logs   for all to authenticated using (true) with check (true);

-- ── Function: get current user's profile ────────────────────────────────────
create or replace function get_user_profile()
returns table (user_id uuid, role text, display_name text, ref text)
as $$
begin
  return query
  select up.user_id, up.role, up.display_name, up.ref
  from user_profiles up
  where up.user_id = auth.uid();
end;
$$ language sql security definer;

-- ── NO SEED DATA — Admin creates everything via the dashboard ───────────────