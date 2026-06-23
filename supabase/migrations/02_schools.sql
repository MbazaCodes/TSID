-- ============================================================================
--  TSID Migration 02 — Schools Schema
--  Run AFTER 01_admin.sql
--
--  Tables:
--    1. applications    — Student applications submitted to schools
--    2. payments        — Payment records for ID card processing
--
--  Schools create students (directly or via approved applications),
--  record payments, and issue ID cards.
--  NO seed data — schools write everything.
-- ============================================================================

-- ── Drop old tables ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS payments      CASCADE;
DROP TABLE IF EXISTS applications  CASCADE;

-- ============================================================================
--  1. APPLICATIONS
--  Students apply for TSID through a school.
--  Schools review and approve/reject applications.
--  On approval, a student record is created in the students table (03_students.sql).
--
--  Permissions:
--    - admin/gov:  Full SELECT
--    - school:     SELECT/INSERT/UPDATE own school's apps only
--    - student:    No direct access
--    - anon:       No access
-- ============================================================================

CREATE TABLE applications (
  id               TEXT              PRIMARY KEY DEFAULT 'APP-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4)),
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
  parent_nida      TEXT,             -- 20-digit NIDA number
  relationship     TEXT,
  parent_phone     TEXT,
  photo            TEXT,             -- base64 or Storage URL
  status           application_status NOT NULL DEFAULT 'pending',
  reject_reason    TEXT,
  tsid             TEXT,             -- Assigned on approval. Soft link (no FK) because
                                    -- TSID doesn't exist when application is created.
                                    -- Validated by check constraint below.
  submitted_at     TIMESTAMPTZ       NOT NULL DEFAULT now(),
  decided_at       TIMESTAMPTZ,

  CONSTRAINT applications_nida_valid CHECK (parent_nida IS NULL OR parent_nida ~* '^[0-9]{20}$'),
  CONSTRAINT applications_phone_valid CHECK (parent_phone IS NULL OR parent_phone ~* '^\+?[0-9\s]{10,20}$'),
  CONSTRAINT applications_level_not_empty CHECK (length(trim(level)) > 0)
);

COMMENT ON TABLE  applications IS 'Student ID card applications submitted to schools';
COMMENT ON COLUMN applications.tsid IS 'Assigned on approval — validated by trigger against students.tsid';
COMMENT ON COLUMN applications.reject_reason IS 'Required when status = rejected';

-- ── Trigger: validate applications.tsid references a real student ───────────────
-- PostgreSQL CHECK constraints cannot contain subqueries, so we use a trigger.
CREATE OR REPLACE FUNCTION trg_applications_tsid_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tsid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM students WHERE tsid = NEW.tsid) THEN
    RAISE EXCEPTION 'applications.tsid "%" does not exist in students table', NEW.tsid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_validate_tsid
  BEFORE INSERT OR UPDATE OF tsid ON applications
  FOR EACH ROW EXECUTE FUNCTION trg_applications_tsid_check();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_school_code ON applications (school_code);
CREATE INDEX IF NOT EXISTS idx_applications_status      ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted   ON applications (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_tsid        ON applications (tsid) WHERE tsid IS NOT NULL;


-- ============================================================================
--  2. PAYMENTS
--  Payment records for ID card processing fees.
--
--  Permissions:
--    - admin/gov:  Full SELECT
--    - school:     SELECT/INSERT/UPDATE own school's payments
--    - student:    SELECT own payments (by TSID)
--    - anon:       No access
-- ============================================================================

CREATE TABLE payments (
  ref          TEXT              PRIMARY KEY DEFAULT 'PAY-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(encode(gen_random_bytes(2), 'hex'), 1, 4)),
  tsid         TEXT              NOT NULL,
  school_code  TEXT              NOT NULL REFERENCES schools(code) ON DELETE SET NULL,
  student_name TEXT              NOT NULL,
  amount       NUMERIC(12,2)     NOT NULL DEFAULT 0,
  currency     TEXT              NOT NULL DEFAULT 'TZS',
  purpose      TEXT              DEFAULT 'ID Card Processing',
  method       payment_method,
  status       payment_status    NOT NULL DEFAULT 'pending',
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ       NOT NULL DEFAULT now(),

  CONSTRAINT payments_amount_positive CHECK (amount >= 0),
  CONSTRAINT payments_currency_valid CHECK (currency IS NOT NULL AND length(currency) = 3)
);

COMMENT ON TABLE  payments IS 'Payment records for student ID card processing';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_school_code ON payments (school_code);
CREATE INDEX IF NOT EXISTS idx_payments_tsid        ON payments (tsid);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at   ON payments (created_at DESC);


-- ============================================================================
--  RLS POLICIES — APPLICATIONS
-- ============================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_applications"   ON applications FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_applications"   ON applications FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_applications"   ON applications FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_applications"   ON applications FOR DELETE   TO anon USING (false);

-- admin/gov: full SELECT
CREATE POLICY "admin_gov_select_applications" ON applications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: full CRUD on own school's applications
CREATE POLICY "school_all_own_applications" ON applications
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

-- service_role: full access
CREATE POLICY "service_all_applications" ON applications
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================================================
--  RLS POLICIES — PAYMENTS
-- ============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- anon: NO access
CREATE POLICY "anon_no_select_payments"   ON payments FOR SELECT   TO anon USING (false);
CREATE POLICY "anon_no_insert_payments"   ON payments FOR INSERT   TO anon WITH CHECK (false);
CREATE POLICY "anon_no_update_payments"   ON payments FOR UPDATE   TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_delete_payments"   ON payments FOR DELETE   TO anon USING (false);

-- admin/gov: full SELECT
CREATE POLICY "admin_gov_select_payments" ON payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE auth_uid = auth.uid() AND role IN ('admin', 'gov')));

-- school: full CRUD on own school's payments
CREATE POLICY "school_all_own_payments" ON payments
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

-- student: SELECT own payments by TSID
CREATE POLICY "student_select_own_payments" ON payments
  FOR SELECT TO authenticated
  USING (
    tsid = (
      SELECT st.tsid FROM students st
      JOIN admin_users au ON au.username = st.cred_username
      WHERE au.auth_uid = auth.uid() AND au.role = 'student'
    )
  );

-- service_role: full access
CREATE POLICY "service_all_payments" ON payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);