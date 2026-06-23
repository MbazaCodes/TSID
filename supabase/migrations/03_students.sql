-- ============================================================================
--  TSID Migration 03 — Students Schema
--  Run AFTER 02_schools.sql
--
--  Tables:
--    1. students        — Registered students with TSID
--    2. certificates    — Enrollment / completion certificates
--    3. request_letters — Utambulisho and other official letters
--
--  Schools create and manage students.
--  Students view their own data and request letters/certificates.
--  NO seed data — schools write student data.
-- ============================================================================

-- ── Drop old tables ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS request_letters  CASCADE;
DROP TABLE IF EXISTS certificates    CASCADE;
DROP TABLE IF EXISTS students        CASCADE;

-- ============================================================================
--  1. STUDENTS
--  Core table. Each student gets a unique TSID.
--  Created by school directly or via approved application.
--
--  Permissions:
--    - admin/gov:  Full SELECT
--    - school:     SELECT/INSERT/UPDATE own school's students
--    - student:    SELECT own record only
--    - anon:       No direct access (public search uses view in 04)
-- ============================================================================

CREATE TABLE students (
  tsid             TEXT              PRIMARY KEY DEFAULT 'TSID-' || to_char(now(), 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 7)),
  fullname         TEXT              NOT NULL,
  dob              DATE,
  gender           gender_type,
  nationality      TEXT              DEFAULT 'Tanzanian',
  school_name      TEXT,
  school_code      TEXT              NOT NULL REFERENCES schools(code) ON DELETE SET NULL,
  region           TEXT              NOT NULL,
  district         TEXT              NOT NULL,
  ward             TEXT              NOT NULL,
  school_contact   TEXT,
  enrollment_date  DATE,
  level            TEXT              NOT NULL,
  blood_group      TEXT,
  parent_name      TEXT,
  parent_nida      TEXT,
  relationship     TEXT,
  parent_phone     TEXT,
  issue_date       DATE,
  photo            TEXT,
  status           account_status    NOT NULL DEFAULT 'active',
  remarks          JSONB             NOT NULL DEFAULT '[]',
  cred_username    TEXT              NOT NULL,
  cred_password    TEXT              NOT NULL,  -- SHA-256 hash (64-char hex)

  created_at       TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ       NOT NULL DEFAULT now(),

  CONSTRAINT students_tsid_format    CHECK (tsid ~* '^TSID-[0-9]{4}-[A-Z0-9]{7}$'),
  CONSTRAINT students_nida_valid     CHECK (parent_nida IS NULL OR parent_nida ~* '^[0-9]{20}$'),
  CONSTRAINT students_phone_valid    CHECK (parent_phone IS NULL OR parent_phone ~* '^\+?[0-9\s]{10,20}$'),
  CONSTRAINT students_password_hash  CHECK (length(cred_password) = 64),
  CONSTRAINT students_level_not_empty CHECK (length(trim(level)) > 0),
  CONSTRAINT students_cred_username_unique UNIQUE (cred_username)
);

COMMENT ON TABLE  students IS 'Registered students with Tanzania Student IDs';
COMMENT ON COLUMN students.tsid IS 'Unique ID: TSID-YYYY-XXXXXXX';
COMMENT ON COLUMN students.cred_username IS 'Student login username (defaults to TSID)';
COMMENT ON COLUMN students.cred_password IS 'SHA-256 hash of student login password';
COMMENT ON COLUMN students.remarks IS 'JSONB array of {text, by, at} objects';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_school_code ON students (school_code);
CREATE INDEX IF NOT EXISTS idx_students_region      ON students (region);
CREATE INDEX IF NOT EXISTS idx_students_level       ON students (level);
CREATE INDEX IF NOT EXISTS idx_students_status      ON students (status);
CREATE INDEX IF NOT EXISTS idx_students_fullname    ON students (fullname);
CREATE INDEX IF NOT EXISTS idx_students_created_at   ON students (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_cred_username ON students (cred_username);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trg_students_ts() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION trg_students_ts();


-- ============================================================================
--  2. CERTIFICATES
--  Enrollment and completion certificates.
--
--  Permissions:
--    - admin/gov:  Full SELECT
--    - school:     SELECT/INSERT own school's certificates
--    - student:    SELECT own certificates
--    - anon:       No access
-- ============================================================================

CREATE TABLE certificates (
  id           TEXT         PRIMARY KEY DEFAULT 'CRT-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4)),
  tsid         TEXT         NOT NULL REFERENCES students(tsid) ON DELETE CASCADE,
  student_name TEXT         NOT NULL,
  school_code  TEXT         NOT NULL REFERENCES schools(code) ON DELETE SET NULL,
  school_name  TEXT         NOT NULL,
  title        TEXT         NOT NULL DEFAULT 'Certificate of Enrollment',
  issued_at    DATE         NOT NULL DEFAULT current_date,
  ref          TEXT         NOT NULL UNIQUE,

  CONSTRAINT certificates_ref_format CHECK (ref ~* '^TSID-CRT-[0-9]+$')
);

COMMENT ON TABLE  certificates IS 'Enrollment and completion certificates';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certificates_tsid        ON certificates (tsid);
CREATE INDEX IF NOT EXISTS idx_certificates_school_code  ON certificates (school_code);


-- ============================================================================
--  3. REQUEST LETTERS
--  Official letters requested by students (Utambulisho, etc.).
--  Auto-approved on insert via trigger.
--
--  Permissions:
--    - admin/gov:  Full SELECT, UPDATE (approve)
--    - school:     SELECT/INSERT/UPDATE own school's letters
--    - student:    SELECT/INSERT own letters
--    - anon:       No access
-- ============================================================================

CREATE TABLE request_letters (
  ref          TEXT              PRIMARY KEY DEFAULT 'LTR-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4)),
  tsid         TEXT              NOT NULL REFERENCES students(tsid) ON DELETE CASCADE,
  student_name TEXT              NOT NULL,
  school_code  TEXT              NOT NULL REFERENCES schools(code) ON DELETE SET NULL,
  school_name  TEXT              NOT NULL,
  type         TEXT              NOT NULL,
  reason       TEXT,
  addressee    TEXT,
  urgency      letter_urgency    DEFAULT 'normal',
  status       letter_status     NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ       NOT NULL DEFAULT now(),
  approved_at  TIMESTAMPTZ,

  CONSTRAINT request_letters_type_valid CHECK (length(trim(type)) > 0)
);

COMMENT ON TABLE  request_letters IS 'Official letter requests (Utambulisho, etc.)';
COMMENT ON COLUMN request_letters.type IS 'utambulisho, transfer, bonafide, character_reference, etc.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_request_letters_tsid        ON request_letters (tsid);
CREATE INDEX IF NOT EXISTS idx_request_letters_school_code  ON request_letters (school_code);
CREATE INDEX IF NOT EXISTS idx_request_letters_status       ON request_letters (status);
CREATE INDEX IF NOT EXISTS idx_request_letters_requested    ON request_letters (requested_at DESC);


-- ============================================================================
--  RLS POLICIES — STUDENTS
-- ============================================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_students"   ON students FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_students"   ON students FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_students"   ON students FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_students"   ON students FOR DELETE   TO anon USING (false);

-- admin/gov: full SELECT
CREATE POLICY "admin_gov_select_students" ON students
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: full CRUD on own school's students
CREATE POLICY "school_all_own_students" ON students
  FOR ALL TO authenticated
  USING (
    school_code = (
      SELECT s.code FROM schools s
      JOIN admin_users au ON au.username = s.username
      WHERE au.auth_uid = auth.uid() AND au.role = 'school'
    )
  )
  WITH CHECK (
    school_code = (
      SELECT s.code FROM schools s
      JOIN admin_users au ON au.username = s.username
      WHERE au.auth_uid = auth.uid() AND au.role = 'school'
    )
  );

-- student: SELECT own record only
CREATE POLICY "student_select_own" ON students
  FOR SELECT TO authenticated
  USING (
    cred_username = (
      SELECT au.username FROM admin_users au WHERE au.auth_uid = auth.uid() AND au.role = 'student'
    )
  );

-- service_role: full access
CREATE POLICY "service_all_students" ON students
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================================================
--  RLS POLICIES — CERTIFICATES
-- ============================================================================

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_certificates"   ON certificates FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_certificates"   ON certificates FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_certificates"   ON certificates FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_certificates"   ON certificates FOR DELETE   TO anon USING (false);

-- admin/gov: full SELECT
CREATE POLICY "admin_gov_select_certificates" ON certificates
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: full CRUD on own school's certificates
CREATE POLICY "school_all_own_certificates" ON certificates
  FOR ALL TO authenticated
  USING (
    school_code = (
      SELECT s.code FROM schools s
      JOIN admin_users au ON au.username = s.username
      WHERE au.auth_uid = auth.uid() AND au.role = 'school'
    )
  )
  WITH CHECK (
    school_code = (
      SELECT s.code FROM schools s
      JOIN admin_users au ON au.username = s.username
      WHERE au.auth_uid = auth.uid() AND au.role = 'school'
    )
  );

-- student: SELECT own certificates
CREATE POLICY "student_select_own_certificates" ON certificates
  FOR SELECT TO authenticated
  USING (
    tsid = (
      SELECT st.tsid FROM students st
      JOIN admin_users au ON au.username = st.cred_username
      WHERE au.auth_uid = auth.uid() AND au.role = 'student'
    )
  );

-- service_role: full access
CREATE POLICY "service_all_certificates" ON certificates
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================================================
--  RLS POLICIES — REQUEST LETTERS
-- ============================================================================

ALTER TABLE request_letters ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_request_letters"   ON request_letters FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_request_letters"   ON request_letters FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_request_letters"   ON request_letters FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_request_letters"   ON request_letters FOR DELETE   TO anon USING (false);

-- admin/gov: full SELECT, UPDATE
CREATE POLICY "admin_gov_select_request_letters" ON request_letters
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

CREATE POLICY "admin_gov_update_request_letters" ON request_letters
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: full CRUD on own school's letters
CREATE POLICY "school_all_own_request_letters" ON request_letters
  FOR ALL TO authenticated
  USING (
    school_code = (
      SELECT s.code FROM schools s
      JOIN admin_users au ON au.username = s.username
      WHERE au.auth_uid = auth.uid() AND au.role = 'school'
    )
  )
  WITH CHECK (
    school_code = (
      SELECT s.code FROM schools s
      JOIN admin_users au ON au.username = s.username
      WHERE au.auth_uid = auth.uid() AND au.role = 'school'
    )
  );

-- student: SELECT own, INSERT own
CREATE POLICY "student_select_own_letters" ON request_letters
  FOR SELECT TO authenticated
  USING (
    tsid = (
      SELECT st.tsid FROM students st
      JOIN admin_users au ON au.username = st.cred_username
      WHERE au.auth_uid = auth.uid() AND au.role = 'student'
    )
  );

CREATE POLICY "student_insert_own_letters" ON request_letters
  FOR INSERT TO authenticated
  WITH CHECK (
    tsid = (
      SELECT st.tsid FROM students st
      JOIN admin_users au ON au.username = st.cred_username
      WHERE au.auth_uid = auth.uid() AND au.role = 'student'
    )
  );

-- service_role: full access
CREATE POLICY "service_all_request_letters" ON request_letters
  FOR ALL TO service_role USING (true) WITH CHECK (true);