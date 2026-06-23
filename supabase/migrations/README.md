# TSID — Supabase Migrations

## Overview

These SQL migration files set up the complete database for the **Tanzania Student Identification System (TSID)**. Run them in order in the **Supabase SQL Editor**.

> **No seed data included.** Admin and schools write all data through the application.

## Execution Order

| # | File | Description |
|---|------|-------------|
| 0 | `00_extensions.sql` | pgcrypto extension + 8 ENUM types |
| 1 | `01_admin.sql` | admin_users, schools, activity_logs + RLS policies |
| 2 | `02_schools.sql` | applications, payments + RLS policies |
| 3 | `03_students.sql` | students, certificates, request_letters + RLS policies |
| 4 | `04_rls_policies.sql` | Public views, helper functions, admin bootstrap |

## Pre-requisites

1. A **Supabase project** at [supabase.com](https://supabase.com)
2. The admin user `admin@tsid.go.tz` must exist in **Supabase Auth** (sign up via app or dashboard)
3. Note the auth user's **UUID** from `auth.users`

## How to Run

1. Open your Supabase project → **SQL Editor**
2. Run each file **in order** (0 → 1 → 2 → 3 → 4)
3. After all migrations, `admin@tsid.go.tz` is automatically granted admin access

## Roles & Permissions

| Role | Access |
|------|--------|
| **Admin** | Full CRUD on all tables. Creates gov officers, registers schools. Bootstrap role. |
| **Gov** | SELECT all, INSERT/UPDATE schools, INSERT/UPDATE letters, INSERT logs |
| **School** | Full CRUD on own school's students, apps, payments, certificates, letters. UPDATE own profile. |
| **Student** | SELECT own records, INSERT own request letters |
| **Anonymous** | Public search views only (limited fields, no sensitive data) |

## Helper Functions

| Function | Returns |
|----------|---------|
| `hash_password('plain')` | SHA-256 hex hash |
| `generate_tsid()` | TSID-YYYY-XXXXXXX |
| `generate_school_code('Region')` | Unique code e.g. DS1024 |
| `generate_student_password()` | tzXXXXXX! |
| `generate_school_password()` | scXXXXXX! |
| `admin_create_school(...)` | School code |
| `admin_register_student(...)` | TSID |
| `admin_create_gov_user(...)` | Gov user UUID |
| `grant_role(auth_uid, role, name, email, ref)` | Auth UID |
| `get_user_profile()` | Current user's role + metadata |

### The `ref` column in `admin_users`

All roles (except admin/gov) use the `ref` column to link to their resource:

| Role | `ref` value | Example |
|------|-------------|---------|
| admin | `null` | — |
| gov | `null` | — |
| school | School code | `DS1024` |
| student | TSID | `TSID-2026-A7K9P2X` |

## Admin Bootstrap

- **Email:** admin@tsid.go.tz
- **Auth UID:** `79cc662a-d6a3-4ae6-9281-f626d2bf005d`
- **Default password:** `admin123` (SHA-256 hashed in DB)

**⚠️ Change the default password immediately after first login.**

## Security

- All passwords stored as **SHA-256 hashes** (64-char hex)
- Row Level Security enabled on **all tables**
- Anon has **no access** to raw tables
- Public search views expose **limited fields only** (no NIDA, no parent details, no photos, no credentials)
- admin_users table links to `auth.users` via `auth_uid` for Supabase Auth integration