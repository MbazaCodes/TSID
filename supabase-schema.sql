-- ============================================================================
--  TSID — Supabase Schema
--  Run this entire file in the Supabase SQL Editor once.
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

-- ── gov_users ────────────────────────────────────────────────────────────────
create table gov_users (
  id          text primary key,
  name        text not null,
  username    text not null unique,
  password    text not null,
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
  username    text not null unique,
  password    text not null,
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
  photo            text,      -- base64 data URI or Storage URL
  status           text not null default 'active',
  remarks          jsonb not null default '[]',
  cred_username    text,
  cred_password    text default 'student123',
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

-- ── RLS: enable for all tables ──────────────────────────────────────────────────
alter table gov_users       enable row level security;
alter table schools         enable row level security;
alter table students        enable row level security;
alter table applications    enable row level security;
alter table payments        enable row level security;
alter table certificates    enable row level security;
alter table request_letters enable row level security;
alter table activity_logs   enable row level security;

-- ── RLS Policies ──────────────────────────────────────────────────────────────
-- NOTE: These policies are designed for demo/anon access.
-- In production, replace anon with authenticated users and add
-- role-based policies using Supabase Auth JWT claims.

-- Everyone can read (needed for public search/verify)
create policy "anon_select" on gov_users       for select to anon using (true);
create policy "anon_select" on schools         for select to anon using (true);
create policy "anon_select" on students        for select to anon using (true);
create policy "anon_select" on applications    for select to anon using (true);
create policy "anon_select" on payments        for select to anon using (true);
create policy "anon_select" on certificates    for select to anon using (true);
create policy "anon_select" on request_letters for select to anon using (true);
create policy "anon_select" on activity_logs   for select to anon using (true);

-- Only allow inserts/updates/deletes through service_role (backend)
-- Anon role gets NO write access to any table
create policy "anon_no_insert" on gov_users       for insert to anon with check (false);
create policy "anon_no_insert" on schools         for insert to anon with check (false);
create policy "anon_no_insert" on students        for insert to anon with check (false);
create policy "anon_no_insert" on applications    for insert to anon with check (false);
create policy "anon_no_insert" on payments        for insert to anon with check (false);
create policy "anon_no_insert" on certificates    for insert to anon with check (false);
create policy "anon_no_insert" on request_letters for insert to anon with check (false);
create policy "anon_no_insert" on activity_logs   for insert to anon with check (false);

create policy "anon_no_update" on gov_users       for update to anon using (false) with check (false);
create policy "anon_no_update" on schools         for update to anon using (false) with check (false);
create policy "anon_no_update" on students        for update to anon using (false) with check (false);
create policy "anon_no_update" on applications    for update to anon using (false) with check (false);
create policy "anon_no_update" on payments        for update to anon using (false) with check (false);
create policy "anon_no_update" on certificates    for update to anon using (false) with check (false);
create policy "anon_no_update" on request_letters for update to anon using (false) with check (false);
create policy "anon_no_update" on activity_logs   for update to anon using (false) with check (false);

create policy "anon_no_delete" on gov_users       for delete to anon using (false);
create policy "anon_no_delete" on schools         for delete to anon using (false);
create policy "anon_no_delete" on students        for delete to anon using (false);
create policy "anon_no_delete" on applications    for delete to anon using (false);
create policy "anon_no_delete" on payments        for delete to anon using (false);
create policy "anon_no_delete" on certificates    for delete to anon using (false);
create policy "anon_no_delete" on request_letters for delete to anon using (false);
create policy "anon_no_delete" on activity_logs   for delete to anon using (false);

-- ── IMPORTANT: For full write access, add service_role policies ──────────────
-- Uncomment below to grant full CRUD to the service_role key (used by backend):
-- create policy "service_all" on gov_users       for all to service_role using (true) with check (true);
-- create policy "service_all" on schools         for all to service_role using (true) with check (true);
-- create policy "service_all" on students        for all to service_role using (true) with check (true);
-- create policy "service_all" on applications    for all to service_role using (true) with check (true);
-- create policy "service_all" on payments        for all to service_role using (true) with check (true);
-- create policy "service_all" on certificates    for all to service_role using (true) with check (true);
-- create policy "service_all" on request_letters for all to service_role using (true) with check (true);
-- create policy "service_all" on activity_logs   for all to service_role using (true) with check (true);

-- ── Seed data ────────────────────────────────────────────────────────────────

-- Gov users
insert into gov_users (id, name, username, password, role, ministry, region, phone, email) values
  ('GOV-001','Amina Rashid Mtendaji','gov','gov123','Government Officer','Wizara ya Elimu, Sayansi na Teknolojia','Dar es Salaam','+255 768 000 001','amina.mtendaji@tsid.go.tz'),
  ('GOV-002','Hassan Juma Mkurugenzi','gov2','gov456','Senior Gov Supervisor','PO-RALG / TAMISEMI','Dodoma','+255 768 000 002','hassan.mkurugenzi@tsid.go.tz')
on conflict (id) do nothing;

-- Schools
insert into schools (code, name, type, region, district, ward, contact, email, address, username, password, created_at) values
  ('DS1024','Shule Ya Msingi Mwangaza','Primary School','Dar es Salaam','Kinondoni','Mikocheni','+255 782 112 233','mwangaza@tsid.go.tz','Mikocheni B, Kinondoni','mwangaza','school123','2026-01-15 08:00:00+00'),
  ('AR2050','Arusha Secondary School','Secondary School','Arusha','Arusha DC','Sekei','+255 754 889 100','arusha.sec@tsid.go.tz','Sekei Road, Arusha','arusha','school123','2026-02-03 09:30:00+00'),
  ('MB3017','Mbeya University College','University / College','Mbeya','Mbeya CC','Iyunga','+255 762 445 901','muc@tsid.go.tz','Iyunga, Mbeya','mbeya','school123','2026-02-22 14:10:00+00')
on conflict (code) do nothing;

-- Students
insert into students (tsid, fullname, dob, gender, nationality, school_name, school_code, region, district, ward, school_contact, enrollment_date, level, blood_group, parent_name, parent_nida, relationship, parent_phone, issue_date, photo, status, remarks, cred_username, cred_password) values
  ('TSID-2026-A7K9P2X','Juma A. Mwanza','2014-05-15','Male','Tanzanian','Shule Ya Msingi Mwangaza','DS1024','Dar es Salaam','Kinondoni','Mikocheni','+255 782 112 233','2020-01-10','Standard 4','O+','Aishatu Juma','19901234567890123','Mother','+255 712 345 678','2026-05-20','','active','[{"text":"Excellent academic performance in term 1.","by":"Head Teacher","at":"2026-04-12T10:00:00.000Z"}]','TSID-2026-A7K9P2X','student123'),
  ('TSID-2026-B3M8Q1Y','Neema Joseph Komba','2010-09-22','Female','Tanzanian','Arusha Secondary School','AR2050','Arusha','Arusha DC','Sekei','+255 754 889 100','2022-01-15','Form 2','A+','Joseph Komba','19851122334455','Father','+255 754 998 211','2026-03-11','','active','[]','TSID-2026-B3M8Q1Y','student123'),
  ('TSID-2026-C5T9Z7W','Grace Baraka Mushi','2003-12-03','Female','Tanzanian','Mbeya University College','MB3017','Mbeya','Mbeya CC','Iyunga','+255 762 445 901','2023-10-01','Year 1 - Bachelor of Education','B+','Baraka Mushi','19700988776655','Father','+255 762 100 900','2026-02-28','','active','[]','TSID-2026-C5T9Z7W','student123')
on conflict (tsid) do nothing;

-- Applications
insert into applications (id, fullname, dob, gender, nationality, school_name, school_code, region, district, ward, school_contact, enrollment_date, level, blood_group, parent_name, parent_nida, relationship, parent_phone, photo, status, submitted_at) values
  ('APP-1001','Erick Sebastian Massawe','2016-03-10','Male','Tanzanian','Shule Ya Msingi Mwangaza','DS1024','Dar es Salaam','Kinondoni','Mikocheni','+255 782 112 233','2026-01-12','Standard 1','O+','Sebastian Massawe','19881234567890','Father','+255 715 222 333','','pending','2026-06-10 11:20:00+00'),
  ('APP-1002','Zawadi Ally Mwakasege','2009-07-19','Female','Tanzanian','Arusha Secondary School','AR2050','Arusha','Arusha DC','Sekei','+255 754 889 100','2026-01-15','Form 1','AB+','Ally Mwakasege','19791122334455','Father','+255 754 700 800','','pending','2026-06-15 08:45:00+00')
on conflict (id) do nothing;

-- Payments
insert into payments (ref, tsid, school_code, student_name, amount, currency, purpose, method, status, paid_at) values
  ('PAY-10010023','TSID-2026-A7K9P2X','DS1024','Juma A. Mwanza',5000,'TZS','ID Card Processing','M-Pesa','paid','2026-05-18 14:30:00+00'),
  ('PAY-10010024','TSID-2026-B3M8Q1Y','AR2050','Neema Joseph Komba',8000,'TZS','ID Card Processing','Tigo Pesa','pending',null),
  ('PAY-10010025','TSID-2026-C5T9Z7W','MB3017','Grace Baraka Mushi',12000,'TZS','ID Card Processing','Bank Transfer','paid','2026-02-26 09:00:00+00')
on conflict (ref) do nothing;

-- Certificates
insert into certificates (id, tsid, student_name, school_code, school_name, title, issued_at, ref) values
  ('CRT-5001','TSID-2026-A7K9P2X','Juma A. Mwanza','DS1024','Shule Ya Msingi Mwangaza','Certificate of Enrollment','2026-05-20','TSID-CRT-5001'),
  ('CRT-5002','TSID-2026-B3M8Q1Y','Neema Joseph Komba','AR2050','Arusha Secondary School','Certificate of Enrollment','2026-03-11','TSID-CRT-5002')
on conflict (id) do nothing;

-- Request letters
insert into request_letters (ref, tsid, student_name, school_code, school_name, type, reason, status, requested_at, approved_at) values
  ('LTR-9001','TSID-2026-A7K9P2X','Juma A. Mwanza','DS1024','Shule Ya Msingi Mwangaza','utambulisho','For travel purposes during school break.','approved','2026-05-25 10:00:00+00','2026-05-26 09:00:00+00')
on conflict (ref) do nothing;

-- System seed log
insert into activity_logs (id, action, message, by_name, by_role) values
  ('LOG-SEED','system:seed','TSID initialized with Supabase backend — 3 schools, 3 students, 2 applications.','system','system')
on conflict (id) do nothing;
