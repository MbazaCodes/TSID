-- ============================================================================
--  TSID Migration 04 — Public Search, Helper Functions & Admin Bootstrap
--  Run AFTER 03_students.sql
--
--  1. Public search VIEWs for verification portal (no login required)
--  2. Helper functions for TSID generation, school codes, passwords
--  3. Admin convenience functions (create school, register student, etc.)
--  4. Auto-approve trigger for student request letters
--  5. Admin bootstrap: grants admin@tsid.go.tz full admin access
--
--  NO seed data — admin starts everything.
-- ============================================================================

-- ============================================================================
--  1. PUBLIC SEARCH VIEWS
--  Expose LIMITED, non-sensitive data for /#/search verification portal.
--  No NIDA, no parent details, no photos, no credentials.
-- ============================================================================

CREATE OR REPLACE VIEW public_student_search AS
SELECT
  s.tsid,
  s.fullname,
  s.gender,
  s.nationality,
  s.school_name,
  s.school_code,
  s.region,
  s.district,
  s.level,
  s.status,
  s.issue_date,
  s.created_at,
  sc.name  AS school_official_name,
  sc.type  AS school_type,
  sc.region AS school_region
FROM students s
LEFT JOIN schools sc ON sc.code = s.school_code
WHERE s.status = 'active';

COMMENT ON VIEW public_student_search IS 'Limited student data for public TSID verification — no NIDA, no parent, no photos, no credentials';


CREATE OR REPLACE VIEW public_school_search AS
SELECT
  sc.code,
  sc.name,
  sc.type,
  sc.region,
  sc.district,
  sc.ward,
  sc.email,
  sc.status,
  sc.created_at,
  (SELECT count(*)::int FROM students st WHERE st.school_code = sc.code AND st.status = 'active') AS total_students
FROM schools sc
WHERE sc.status = 'active';

COMMENT ON VIEW public_school_search IS 'Limited school data for public search — no usernames, no passwords, no phone';

-- Grant anon + authenticated read access on views
GRANT SELECT ON public_student_search TO anon;
GRANT SELECT ON public_school_search TO anon;
GRANT SELECT ON public_student_search TO authenticated;
GRANT SELECT ON public_school_search TO authenticated;


-- ============================================================================
--  2. HELPER FUNCTIONS — TSID & Code Generation
-- ============================================================================

-- Generate a new TSID: TSID-YYYY-XXXXXXX
CREATE OR REPLACE FUNCTION generate_tsid()
RETURNS TEXT AS $$
  SELECT 'TSID-' || to_char(now(), 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 7));
$$ LANGUAGE SQL VOLATILE STRICT;

-- Generate a unique school code from region name
CREATE OR REPLACE FUNCTION generate_school_code(region TEXT)
RETURNS TEXT AS $$
  DECLARE
    prefix TEXT;
    code   TEXT;
    exists BOOLEAN;
  BEGIN
    prefix := upper(substr(COALESCE(LEFT(region, 2), 'TZ'), 1, 2));
    -- Map common regions
    IF region ILIKE 'dar%'       THEN prefix := 'DS';
    ELSIF region ILIKE 'arusha%' THEN prefix := 'AR';
    ELSIF region ILIKE 'mbeya%'  THEN prefix := 'MB';
    ELSIF region ILIKE 'dodoma%' THEN prefix := 'DO';
    ELSIF region ILIKE 'mwanza%' THEN prefix := 'MW';
    ELSIF region ILIKE 'tanga%'  THEN prefix := 'TG';
    ELSIF region ILIKE 'morogoro%' THEN prefix := 'MO';
    ELSIF region ILIKE 'kagera%' THEN prefix := 'KG';
    ELSIF region ILIKE 'kigoma%' THEN prefix := 'KI';
    ELSIF region ILIKE 'lindi%'  THEN prefix := 'LD';
    ELSIF region ILIKE 'mara%'   THEN prefix := 'MR';
    ELSIF region ILIKE 'mtwara%' THEN prefix := 'MT';
    ELSIF region ILIKE 'pwani%'  THEN prefix := 'PW';
    ELSIF region ILIKE 'rukwa%'  THEN prefix := 'RK';
    ELSIF region ILIKE 'rume%'   THEN prefix := 'RM';
    ELSIF region ILIKE 'shinyanga%' THEN prefix := 'SH';
    ELSIF region ILIKE 'singida%' THEN prefix := 'SG';
    ELSIF region ILIKE 'tabora%' THEN prefix := 'TB';
    ELSIF region ILIKE 'geita%'  THEN prefix := 'GT';
    ELSIF region ILIKE 'katavi%' THEN prefix := 'KV';
    ELSIF region ILIKE 'njombe%' THEN prefix := 'NJ';
    ELSIF region ILIKE 'simiyu%' THEN prefix := 'SM';
    ELSIF region ILIKE 'songwe%' THEN prefix := 'SW';
    END IF;

    LOOP
      code := prefix || lpad(to_char(floor(random() * 9000 + 1000)::int, 'FM0000'), 4, '0');
      SELECT EXISTS (SELECT 1 FROM schools WHERE code = code) INTO exists;
      EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
  END;
$$ LANGUAGE plpgsql VOLATILE STRICT;

-- Generate secure student password: tzXXXXXX!
CREATE OR REPLACE FUNCTION generate_student_password()
RETURNS TEXT AS $$
  SELECT 'tz' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6)) || '!';
$$ LANGUAGE SQL VOLATILE STRICT;

-- Generate secure school password: scXXXXXX!
CREATE OR REPLACE FUNCTION generate_school_password()
RETURNS TEXT AS $$
  SELECT 'sc' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6)) || '!';
$$ LANGUAGE SQL VOLATILE STRICT;


-- ============================================================================
--  3. ADMIN CONVENIENCE FUNCTIONS
-- ============================================================================

-- ── Admin: create a school with hashed password ───────────────────────────────
-- Returns the school code. Credentials are logged in activity_logs.
CREATE OR REPLACE FUNCTION admin_create_school(
  p_name        TEXT,
  p_type        school_type DEFAULT 'Secondary School',
  p_region      TEXT,
  p_district    TEXT,
  p_ward        TEXT,
  p_contact     TEXT DEFAULT NULL,
  p_email       TEXT DEFAULT NULL,
  p_address     TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
  DECLARE
    v_code     TEXT := generate_school_code(p_region);
    v_username TEXT := lower(replace(replace(p_name, ' ', ''), '''', ''));
    v_plain_pw TEXT := generate_school_password();
    v_hash_pw  TEXT := hash_password(v_plain_pw);
  BEGIN
    IF length(v_username) > 30 THEN v_username := substr(v_username, 1, 30); END IF;

    INSERT INTO schools (code, name, type, region, district, ward, contact, email, address, username, password)
    VALUES (v_code, p_name, p_type, p_region, p_district, p_ward, p_contact, p_email, p_address, v_username, v_hash_pw);

    -- Log action WITHOUT plaintext password (send credentials out-of-band)
    INSERT INTO activity_logs (action, message, by_name, by_role, by_ref)
    VALUES ('school:create',
      format('Created school: %s (%s) — username: %s', p_name, v_code, v_username),
      COALESCE(p_admin_email, 'admin'), 'admin', v_code);

    RETURN v_code;
  END;
$$ LANGUAGE plpgsql VOLATILE;


-- ── Admin: register a student directly ────────────────────────────────────────
-- Returns the TSID. Credentials are logged.
CREATE OR REPLACE FUNCTION admin_register_student(
  p_fullname      TEXT,
  p_dob           DATE,
  p_gender        gender_type DEFAULT NULL,
  p_school_code   TEXT,
  p_region        TEXT,
  p_district      TEXT,
  p_ward          TEXT,
  p_level         TEXT,
  p_blood_group   TEXT DEFAULT NULL,
  p_parent_name   TEXT DEFAULT NULL,
  p_parent_nida   TEXT DEFAULT NULL,
  p_relationship  TEXT DEFAULT NULL,
  p_parent_phone  TEXT DEFAULT NULL,
  p_admin_email   TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
  DECLARE
    v_tsid      TEXT := generate_tsid();
    v_plain_pw  TEXT := generate_student_password();
    v_hash_pw   TEXT := hash_password(v_plain_pw);
    v_school    RECORD;
  BEGIN
    SELECT name, region, district, ward, contact INTO v_school
    FROM schools WHERE code = p_school_code;

    INSERT INTO students (
      tsid, fullname, dob, gender, nationality, school_name, school_code,
      region, district, ward, school_contact, enrollment_date, level,
      blood_group, parent_name, parent_nida, relationship, parent_phone,
      issue_date, status, remarks, cred_username, cred_password
    ) VALUES (
      v_tsid, p_fullname, p_dob, p_gender, 'Tanzanian', v_school.name, p_school_code,
      p_region, p_district, p_ward, v_school.contact, current_date, p_level,
      p_blood_group, p_parent_name, p_parent_nida, p_relationship, p_parent_phone,
      current_date, 'active', '[]', v_tsid, v_hash_pw
    );

    -- Log action WITHOUT plaintext password (send credentials out-of-band)
    INSERT INTO activity_logs (action, message, by_name, by_role, by_ref)
    VALUES ('student:register',
      format('Registered student: %s (%s) — username: %s', p_fullname, v_tsid, v_tsid),
      COALESCE(p_admin_email, 'admin'), 'admin', v_tsid);

    RETURN v_tsid;
  END;
$$ LANGUAGE plpgsql VOLATILE;


-- ── Admin: create a gov officer ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_create_gov_user(
  p_name        TEXT,
  p_email       TEXT,
  p_gov_role    TEXT DEFAULT 'Government Officer',
  p_ministry    TEXT DEFAULT NULL,
  p_region      TEXT DEFAULT NULL,
  p_phone       TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
  DECLARE
    v_plain_pw TEXT := generate_school_password();
    v_hash_pw  TEXT := hash_password(v_plain_pw);
    v_id       UUID := gen_random_uuid();
  BEGIN
    INSERT INTO admin_users (id, email, name, role, password, phone, region, ministry)
    VALUES (v_id, p_email, p_name, 'gov', v_hash_pw, p_phone, p_region, p_ministry);

    -- Log action WITHOUT plaintext password (send credentials out-of-band)
    INSERT INTO activity_logs (action, message, by_name, by_role, by_ref)
    VALUES ('gov:create',
      format('Created gov user: %s — email: %s', p_name, p_email),
      COALESCE(p_admin_email, 'admin'), 'admin', v_id::text);

    RETURN v_id;
  END;
$$ LANGUAGE plpgsql VOLATILE;


-- ── Grant role to a Supabase Auth user ────────────────────────────────────────
-- p_ref: school code for schools, TSID for students, null for admin/gov
CREATE OR REPLACE FUNCTION grant_role(
  p_auth_uid  UUID,
  p_role      user_role,
  p_name      TEXT,
  p_email     TEXT,
  p_ref       TEXT DEFAULT NULL,
  p_password  TEXT DEFAULT NULL,
  p_phone     TEXT DEFAULT NULL,
  p_region    TEXT DEFAULT NULL,
  p_ministry  TEXT DEFAULT NULL
)
RETURNS UUID AS $$
  DECLARE
    v_hash_pw TEXT;
  BEGIN
    IF p_password IS NOT NULL THEN
      IF length(p_password) != 64 THEN
        RAISE EXCEPTION 'Password must be SHA-256 hash (64 chars). Use: SELECT hash_password(''pw'');';
      END IF;
      v_hash_pw := p_password;
    ELSE
      v_hash_pw := hash_password('admin123');
    END IF;

    INSERT INTO admin_users (auth_uid, email, name, role, ref, password, phone, region, ministry)
    VALUES (p_auth_uid, p_email, p_name, p_role, p_ref, v_hash_pw, p_phone, p_region, p_ministry)
    ON CONFLICT (auth_uid) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      ref = EXCLUDED.ref, updated_at = now();

    RETURN p_auth_uid;
  END;
$$ LANGUAGE plpgsql VOLATILE;


-- ── Get current user's profile (for app-side role checking) ───────────────────
-- admin_users.ref: school code for schools, TSID for students, null for admin/gov
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (user_id UUID, role TEXT, name TEXT, email TEXT, ref TEXT) AS $$
  SELECT au.id, au.role::text, au.name, au.email, au.ref
  FROM admin_users au
  WHERE au.auth_uid = auth.uid() AND au.status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================================
--  4. TRIGGER: Auto-approve student request letters on insert
--
--  NOTE: This matches the current TSID app behavior where all student
--  letter requests are auto-approved. If you need a school-review
--  workflow in the future, drop this trigger:
--    DROP TRIGGER trg_auto_approve_letter ON request_letters;
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_approve_letter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
    NEW.status := 'approved';
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_approve_letter
  BEFORE INSERT ON request_letters
  FOR EACH ROW EXECUTE FUNCTION auto_approve_letter();

COMMENT ON FUNCTION auto_approve_letter IS 'Auto-approves new letter requests. Drop trigger trg_auto_approve_letter if school review is needed.';


-- ============================================================================
--  5. ADMIN BOOTSTRAP
--  Grants admin role to admin@tsid.go.tz
--  User must exist in Supabase Auth (auth.users) before running this.
--
--  Default password: admin123 (SHA-256 hashed) — CHANGE IMMEDIATELY
-- ============================================================================

INSERT INTO admin_users (auth_uid, email, name, role, password)
VALUES (
  '79cc662a-d6a3-4ae6-9281-f626d2bf005d'::uuid,
  'admin@tsid.go.tz',
  'TSID System Administrator',
  'admin',
  (SELECT encode(digest('admin123', 'sha256'), 'hex'))
)
ON CONFLICT (auth_uid) DO UPDATE SET
  email     = EXCLUDED.email,
  name      = EXCLUDED.name,
  role      = EXCLUDED.role,
  password  = EXCLUDED.password,
  updated_at = now();


-- ============================================================================
--  6. PERMISSION MATRIX
-- ============================================================================
--
--  TABLE            | anon | student | school | gov | admin | service_role
--  ─────────────────|──────|─────────|────────|─────|───────|─────────────
--  admin_users      |  ✗   |   ✗     |   ✗    | ✗  |  ✓✓✓  |    ✓✓✓
--  schools          |  ✗   |   ✗     |  R/W†  | ✓✓✓ |  ✓✓✓  |    ✓✓✓
--  students         |  ✗   |  R‡     |  ✓✓✓   |  R  |   R   |    ✓✓✓
--  applications     |  ✗   |   ✗     |  ✓✓✓   |  R  |   R   |    ✓✓✓
--  payments         |  ✗   |  R‡     |  ✓✓✓   |  R  |   R   |    ✓✓✓
--  certificates     |  ✗   |  R‡     |  ✓✓✓   |  R  |   R   |    ✓✓✓
--  request_letters  |  ✗   | R/I‡    |  ✓✓✓   | R/U |  R/U  |    ✓✓✓
--  activity_logs    |  ✗   |   ✗     |   I    | R/I |  ✓✓✓  |    ✓✓✓
--  public views     |  ✓   |   ✓     |   ✓    |  ✓  |   ✓   |     ✓
--
--  ✓ = SELECT, I = INSERT, U = UPDATE, D = DELETE, ✓✓✓ = ALL
--  † = own school only  ‡ = own records only (by TSID)