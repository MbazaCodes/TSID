-- ============================================================================
--  TSID Migration 01 — Admin Schema
--  Run AFTER 00_extensions.sql
--
--  Tables:
--    1. admin_users    — Admin & Government Officer accounts
--    2. schools        — Registered schools (created by admin)
--    3. activity_logs  — System-wide audit trail
--
--  Admin is the bootstrap role. Admin creates gov officers,
--  registers schools, and oversees the entire system.
--  NO seed data — admin writes everything.
-- ============================================================================

-- ============================================================================
--  1. ADMIN USERS
--  Stores admin accounts and government officers.
--  Passwords must be SHA-256 hashed (64-char hex) before insertion.
--
--  Permissions:
--    - admin:  Full CRUD on all tables in the system
--    - gov:    Read most, manage schools/students/applications
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  role        user_role       NOT NULL DEFAULT 'admin',
  phone       TEXT,
  region      TEXT,
  ministry    TEXT,
  status      account_status  NOT NULL DEFAULT 'active',
  password    TEXT    NOT NULL,            -- SHA-256 hash (64-char hex)

  -- Supabase Auth linkage
  auth_uid    UUID    UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT admin_users_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT admin_users_password_hash CHECK (length(password) = 64)
);

COMMENT ON TABLE  admin_users IS 'System administrators and government officers';
COMMENT ON COLUMN admin_users.password IS 'SHA-256 hash — never store plaintext';
COMMENT ON COLUMN admin_users.auth_uid IS 'Link to Supabase auth.users when using Supabase Auth';
COMMENT ON COLUMN admin_users.role IS 'admin = full control; gov = government supervisor';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trg_admin_users_ts() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION trg_admin_users_ts();


-- ============================================================================
--  2. SCHOOLS
--  Registered schools. Created by admin (or gov officers).
--  Schools manage their own students, applications, and payments.
--
--  Permissions:
--    - admin/gov:  Full CRUD
--    - school:     Read own row, UPDATE own row only
-- ============================================================================

CREATE TABLE IF NOT EXISTS schools (
  code        TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  type        school_type     NOT NULL DEFAULT 'Secondary School',
  region      TEXT    NOT NULL,
  district    TEXT    NOT NULL,
  ward        TEXT    NOT NULL,
  contact     TEXT,
  email       TEXT,
  address     TEXT,
  status      account_status  NOT NULL DEFAULT 'active',

  -- Login credentials (managed by admin, school can change own password)
  username    TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,            -- SHA-256 hash (64-char hex)

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT schools_code_format CHECK (code ~* '^[A-Z]{2}[0-9]{4,6}$'),
  CONSTRAINT schools_password_hash CHECK (length(password) = 64),
  CONSTRAINT schools_contact_valid CHECK (contact IS NULL OR contact ~* '^\+?[0-9\s]{10,20}$')
);

COMMENT ON TABLE  schools IS 'Registered schools that manage student IDs';
COMMENT ON COLUMN schools.code IS 'Auto-generated: 2-letter region + 4-6 digits';
COMMENT ON COLUMN schools.password IS 'SHA-256 hash of school login password';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trg_schools_ts() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_schools_updated_at
  BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION trg_schools_ts();


-- ============================================================================
--  3. ACTIVITY LOGS
--  System-wide audit trail. All role actions logged here.
--
--  Permissions:
--    - admin:     Full access
--    - gov:       SELECT, INSERT
--    - school:    INSERT (own actions)
--    - anon:      No access
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id          TEXT    PRIMARY KEY DEFAULT 'LOG-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)),
  action      TEXT    NOT NULL,
  message     TEXT,
  by_name     TEXT,
  by_role     TEXT,
  by_ref      TEXT,                    -- school code, gov id, student tsid, or 'system'
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  activity_logs IS 'Audit trail for all system actions';
COMMENT ON COLUMN activity_logs.by_ref IS 'Reference to the actor';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action    ON activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_by_role   ON activity_logs (by_role);


-- ============================================================================
--  HELPER: Hash password function
--  Usage: SELECT hash_password('my-password');
-- ============================================================================
CREATE OR REPLACE FUNCTION hash_password(plain_text TEXT)
RETURNS TEXT AS $$
  SELECT encode(digest(plain_text, 'sha256'), 'hex');
$$ LANGUAGE SQL IMMUTABLE STRICT;


-- ============================================================================
--  RLS POLICIES — ADMIN USERS
-- ============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_admin_users"   ON admin_users FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_admin_users"   ON admin_users FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_admin_users"   ON admin_users FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_admin_users"   ON admin_users FOR DELETE   TO anon USING (false);

-- authenticated: read own profile
CREATE POLICY "auth_select_own_admin" ON admin_users
  FOR SELECT TO authenticated USING (auth_uid = auth.uid());

-- admin: full CRUD
CREATE POLICY "admin_all_admin_users" ON admin_users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role = 'admin'));

-- service_role: full CRUD
CREATE POLICY "service_all_admin_users" ON admin_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================================================
--  RLS POLICIES — SCHOOLS
-- ============================================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_schools"   ON schools FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_schools"   ON schools FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_schools"   ON schools FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_schools"   ON schools FOR DELETE   TO anon USING (false);

-- admin/gov: full CRUD
CREATE POLICY "admin_gov_all_schools" ON schools
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: read all schools, update own only
CREATE POLICY "school_read_schools" ON schools
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role = 'school')
    OR EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

CREATE POLICY "school_update_own" ON schools
  FOR UPDATE TO authenticated
  USING (username = (SELECT username FROM admin_users WHERE auth_uid = auth.uid() AND role = 'school'))
  WITH CHECK (username = (SELECT username FROM admin_users WHERE auth_uid = auth.uid() AND role = 'school'));

-- service_role: full CRUD
CREATE POLICY "service_all_schools" ON schools
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================================================
--  RLS POLICIES — ACTIVITY LOGS
-- ============================================================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_logs" ON activity_logs FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_logs" ON activity_logs FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_delete_logs" ON activity_logs FOR DELETE   TO anon USING (false);

-- admin/gov: SELECT + INSERT
CREATE POLICY "admin_gov_select_logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

CREATE POLICY "admin_gov_insert_logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: INSERT own logs
CREATE POLICY "school_insert_logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role = 'school'));

-- admin: can DELETE (clear) logs
CREATE POLICY "admin_delete_logs" ON activity_logs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role = 'admin'));

-- service_role: full access
CREATE POLICY "service_all_logs" ON activity_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);