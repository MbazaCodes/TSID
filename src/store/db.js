// ============================================================================
//  TSID Data Layer — Supabase backend
//  Same export API as the localStorage version; all callers unchanged.
//  All public methods are async and return plain JS objects matching the
//  original camelCase shape the views expect.
// ============================================================================

import { supabase } from "./supabase.js";

// ── Session lives in localStorage (lightweight auth token, not DB) ───────────
const SESSION_KEY = "tsid:session";

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeSession(v) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(v));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Column-name mappers (snake_case DB → camelCase JS) ───────────────────────

function mapSchool(r) {
  if (!r) return null;
  return {
    code:      r.code,
    name:      r.name,
    type:      r.type,
    region:    r.region,
    district:  r.district,
    ward:      r.ward,
    contact:   r.contact,
    email:     r.email,
    address:   r.address,
    username:  r.username,
    password:  r.password,
    status:    r.status,
    createdAt: r.created_at,
  };
}

function mapStudent(r) {
  if (!r) return null;
  return {
    tsid:           r.tsid,
    fullname:       r.fullname,
    dob:            r.dob,
    gender:         r.gender,
    nationality:    r.nationality,
    schoolName:     r.school_name,
    schoolCode:     r.school_code,
    region:         r.region,
    district:       r.district,
    ward:           r.ward,
    schoolContact:  r.school_contact,
    enrollmentDate: r.enrollment_date,
    level:          r.level,
    bloodGroup:     r.blood_group,
    parentName:     r.parent_name,
    parentNida:     r.parent_nida,
    relationship:   r.relationship,
    parentPhone:    r.parent_phone,
    issueDate:      r.issue_date,
    photo:          r.photo || "",
    status:         r.status,
    remarks:        Array.isArray(r.remarks) ? r.remarks : [],
    credentials: {
      username: r.cred_username || r.tsid,
      password: r.cred_password || "student123",
    },
  };
}

function mapApplication(r) {
  if (!r) return null;
  return {
    id:             r.id,
    fullname:       r.fullname,
    dob:            r.dob,
    gender:         r.gender,
    nationality:    r.nationality,
    schoolName:     r.school_name,
    schoolCode:     r.school_code,
    region:         r.region,
    district:       r.district,
    ward:           r.ward,
    schoolContact:  r.school_contact,
    enrollmentDate: r.enrollment_date,
    level:          r.level,
    bloodGroup:     r.blood_group,
    parentName:     r.parent_name,
    parentNida:     r.parent_nida,
    relationship:   r.relationship,
    parentPhone:    r.parent_phone,
    photo:          r.photo || "",
    status:         r.status,
    rejectReason:   r.reject_reason,
    tsid:           r.tsid,
    submittedAt:    r.submitted_at,
    decidedAt:      r.decided_at,
  };
}

function mapPayment(r) {
  if (!r) return null;
  return {
    ref:         r.ref,
    tsid:        r.tsid,
    schoolCode:  r.school_code,
    studentName: r.student_name,
    amount:      r.amount,
    currency:    r.currency,
    purpose:     r.purpose,
    method:      r.method,
    status:      r.status,
    paidAt:      r.paid_at,
  };
}

function mapCertificate(r) {
  if (!r) return null;
  return {
    id:          r.id,
    tsid:        r.tsid,
    studentName: r.student_name,
    schoolCode:  r.school_code,
    schoolName:  r.school_name,
    title:       r.title,
    issuedAt:    r.issued_at,
    ref:         r.ref,
  };
}

function mapLetter(r) {
  if (!r) return null;
  return {
    ref:         r.ref,
    tsid:        r.tsid,
    studentName: r.student_name,
    schoolCode:  r.school_code,
    schoolName:  r.school_name,
    type:        r.type,
    reason:      r.reason,
    addressee:   r.addressee,
    urgency:     r.urgency,
    status:      r.status,
    requestedAt: r.requested_at,
    approvedAt:  r.approved_at,
  };
}

function mapLog(r) {
  if (!r) return null;
  return {
    id:      r.id,
    action:  r.action,
    message: r.message,
    by:      r.by_name,
    role:    r.by_role,
    at:      r.created_at,
  };
}

function mapGovUser(r) {
  if (!r) return null;
  return {
    id:        r.id,
    name:      r.name,
    username:  r.username,
    password:  r.password,
    role:      r.role,
    ministry:  r.ministry,
    region:    r.region,
    phone:     r.phone,
    email:     r.email,
    status:    r.status,
    createdAt: r.created_at,
  };
}

// ── ID generators (unchanged) ─────────────────────────────────────────────────

export function genTsid() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 9).toUpperCase();
  return `TSID-${year}-${rand}`;
}

export function genSchoolCode(region) {
  const prefix = (region || "TZ").slice(0, 2).toUpperCase();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${n}`;
}

export function genPaymentRef() {
  return "PAY-" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 99);
}

export function genLetterRef() {
  return "LTR-" + Date.now().toString().slice(-8);
}

export function genCredentialPassword() {
  return "tz" + Math.random().toString(36).slice(2, 8).toUpperCase() + "!";
}

// ── db object — async Supabase CRUD ──────────────────────────────────────────

export const db = {

  // Schools ──────────────────────────────────────────────────────────────────
  async getSchools() {
    const { data } = await supabase.from("schools").select("*").order("created_at");
    return (data || []).map(mapSchool);
  },
  async findSchool(code) {
    if (!code) return null;
    const { data } = await supabase.from("schools").select("*").eq("code", code).maybeSingle();
    return mapSchool(data);
  },
  async saveSchool(school) {
    const row = {
      code:       school.code,
      name:       school.name,
      type:       school.type,
      region:     school.region,
      district:   school.district,
      ward:       school.ward,
      contact:    school.contact,
      email:      school.email,
      address:    school.address,
      username:   school.username,
      password:   school.password,
      status:     school.status || "active",
    };
    const { data } = await supabase.from("schools").upsert(row, { onConflict: "code" }).select().maybeSingle();
    return mapSchool(data);
  },

  // Students ─────────────────────────────────────────────────────────────────
  async getStudents() {
    const { data } = await supabase.from("students").select("*").order("created_at");
    return (data || []).map(mapStudent);
  },
  async findStudent(tsid) {
    if (!tsid) return null;
    const { data } = await supabase.from("students").select("*").eq("tsid", tsid).maybeSingle();
    return mapStudent(data);
  },
  async findStudentsBySchool(schoolCode) {
    if (!schoolCode) return [];
    const { data } = await supabase.from("students").select("*").eq("school_code", schoolCode).order("created_at");
    return (data || []).map(mapStudent);
  },
  async saveStudent(student) {
    const row = {
      tsid:            student.tsid,
      fullname:        student.fullname,
      dob:             student.dob || null,
      gender:          student.gender,
      nationality:     student.nationality || "Tanzanian",
      school_name:     student.schoolName,
      school_code:     student.schoolCode,
      region:          student.region,
      district:        student.district,
      ward:            student.ward,
      school_contact:  student.schoolContact,
      enrollment_date: student.enrollmentDate || null,
      level:           student.level,
      blood_group:     student.bloodGroup,
      parent_name:     student.parentName,
      parent_nida:     student.parentNida,
      relationship:    student.relationship,
      parent_phone:    student.parentPhone,
      issue_date:      student.issueDate || null,
      photo:           student.photo || "",
      status:          student.status || "active",
      remarks:         student.remarks || [],
      cred_username:   student.credentials?.username || student.tsid,
      cred_password:   student.credentials?.password || "student123",
    };
    const { data } = await supabase.from("students").upsert(row, { onConflict: "tsid" }).select().maybeSingle();
    return mapStudent(data);
  },
  async addRemark(tsid, remark) {
    const student = await this.findStudent(tsid);
    if (!student) return null;
    const remarks = student.remarks || [];
    remarks.push({
      text: remark,
      by:   (currentSession()?.name) || "School Admin",
      at:   new Date().toISOString(),
    });
    const { data } = await supabase
      .from("students")
      .update({ remarks })
      .eq("tsid", tsid)
      .select()
      .maybeSingle();
    return mapStudent(data);
  },

  // Applications ─────────────────────────────────────────────────────────────
  async getApplications() {
    const { data } = await supabase.from("applications").select("*").order("submitted_at", { ascending: false });
    return (data || []).map(mapApplication);
  },
  async applicationsForSchool(code) {
    if (!code) return [];
    const { data } = await supabase.from("applications").select("*").eq("school_code", code).order("submitted_at", { ascending: false });
    return (data || []).map(mapApplication);
  },
  async saveApplication(app) {
    const row = {
      id:              app.id,
      fullname:        app.fullname,
      dob:             app.dob || null,
      gender:          app.gender,
      nationality:     app.nationality || "Tanzanian",
      school_name:     app.schoolName,
      school_code:     app.schoolCode,
      region:          app.region,
      district:        app.district,
      ward:            app.ward,
      school_contact:  app.schoolContact,
      enrollment_date: app.enrollmentDate || null,
      level:           app.level,
      blood_group:     app.bloodGroup,
      parent_name:     app.parentName,
      parent_nida:     app.parentNida,
      relationship:    app.relationship,
      parent_phone:    app.parentPhone,
      photo:           app.photo || "",
      status:          app.status || "pending",
    };
    const { data } = await supabase.from("applications").upsert(row, { onConflict: "id" }).select().maybeSingle();
    return mapApplication(data);
  },
  async approveApplication(id) {
    // Mark application approved
    await supabase.from("applications")
      .update({ status: "approved", decided_at: new Date().toISOString() })
      .eq("id", id);

    const { data: appRow } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
    const a = mapApplication(appRow);
    if (!a) return null;

    const tsid = a.tsid || genTsid();
    const student = {
      tsid,
      fullname:       a.fullname,
      dob:            a.dob,
      gender:         a.gender,
      nationality:    a.nationality || "Tanzanian",
      schoolName:     a.schoolName,
      schoolCode:     a.schoolCode,
      region:         a.region,
      district:       a.district,
      ward:           a.ward,
      schoolContact:  a.schoolContact,
      enrollmentDate: a.enrollmentDate || new Date().toISOString().slice(0, 10),
      level:          a.level,
      bloodGroup:     a.bloodGroup,
      parentName:     a.parentName,
      parentNida:     a.parentNida,
      relationship:   a.relationship,
      parentPhone:    a.parentPhone,
      issueDate:      new Date().toISOString().slice(0, 10),
      photo:          a.photo || "",
      status:         "active",
      remarks:        [],
      credentials:    { username: tsid, password: "student123" },
    };
    await this.saveStudent(student);
    await log("application:approve", `Approved application ${id} → ${tsid}`);
    return student;
  },
  async rejectApplication(id, reason) {
    const { data } = await supabase.from("applications")
      .update({ status: "rejected", reject_reason: reason, decided_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    await log("application:reject", `Rejected application ${id} (${reason})`);
    return mapApplication(data);
  },

  // Payments ─────────────────────────────────────────────────────────────────
  async getPayments() {
    const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    return (data || []).map(mapPayment);
  },
  async paymentsForSchool(code) {
    if (!code) return [];
    const { data } = await supabase.from("payments").select("*").eq("school_code", code).order("created_at", { ascending: false });
    return (data || []).map(mapPayment);
  },
  async paymentsForStudent(tsid) {
    if (!tsid) return [];
    const { data } = await supabase.from("payments").select("*").eq("tsid", tsid).order("created_at", { ascending: false });
    return (data || []).map(mapPayment);
  },
  async savePayment(p) {
    const row = {
      ref:          p.ref,
      tsid:         p.tsid,
      school_code:  p.schoolCode,
      student_name: p.studentName,
      amount:       p.amount,
      currency:     p.currency || "TZS",
      purpose:      p.purpose,
      method:       p.method,
      status:       p.status || "pending",
      paid_at:      p.paidAt || null,
    };
    const { data } = await supabase.from("payments").upsert(row, { onConflict: "ref" }).select().maybeSingle();
    return mapPayment(data);
  },

  // Certificates ─────────────────────────────────────────────────────────────
  async getCertificates() {
    const { data } = await supabase.from("certificates").select("*");
    return (data || []).map(mapCertificate);
  },
  async certificatesForStudent(tsid) {
    if (!tsid) return [];
    const { data } = await supabase.from("certificates").select("*").eq("tsid", tsid);
    return (data || []).map(mapCertificate);
  },
  async saveCertificate(c) {
    const row = {
      id:           c.id,
      tsid:         c.tsid,
      student_name: c.studentName,
      school_code:  c.schoolCode,
      school_name:  c.schoolName,
      title:        c.title,
      issued_at:    c.issuedAt,
      ref:          c.ref,
    };
    const { data } = await supabase.from("certificates").upsert(row, { onConflict: "id" }).select().maybeSingle();
    return mapCertificate(data);
  },

  // Request Letters ──────────────────────────────────────────────────────────
  async getLetters() {
    const { data } = await supabase.from("request_letters").select("*").order("requested_at", { ascending: false });
    return (data || []).map(mapLetter);
  },
  async lettersForStudent(tsid) {
    if (!tsid) return [];
    const { data } = await supabase.from("request_letters").select("*").eq("tsid", tsid).order("requested_at", { ascending: false });
    return (data || []).map(mapLetter);
  },
  async saveLetter(l) {
    const row = {
      ref:          l.ref,
      tsid:         l.tsid,
      student_name: l.studentName,
      school_code:  l.schoolCode,
      school_name:  l.schoolName,
      type:         l.type,
      reason:       l.reason,
      addressee:    l.addressee || null,
      urgency:      l.urgency || "normal",
      status:       l.status || "pending",
      requested_at: l.requestedAt || new Date().toISOString(),
      approved_at:  l.approvedAt  || null,
    };
    const { data } = await supabase.from("request_letters").upsert(row, { onConflict: "ref" }).select().maybeSingle();
    return mapLetter(data);
  },

  // Logs ─────────────────────────────────────────────────────────────────────
  async getLogs() {
    const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(500);
    return (data || []).map(mapLog);
  },

  // Gov Users ────────────────────────────────────────────────────────────────
  async getGovUsers() {
    const { data } = await supabase.from("gov_users").select("*");
    return (data || []).map(mapGovUser);
  },
  async findGovUser(username) {
    if (!username) return null;
    const { data } = await supabase.from("gov_users").select("*").eq("username", username).maybeSingle();
    return mapGovUser(data);
  },
};

// ── Session (localStorage — fast, no round-trip needed) ──────────────────────

export function currentSession() {
  return readSession();
}

export function login(role, identity) {
  const session = {
    role,
    name:    identity.name,
    ref:     identity.ref,
    loginAt: new Date().toISOString(),
  };
  writeSession(session);
  log("auth:login", `${role} ${identity.name} logged in`);
  return session;
}

export function logout() {
  const s = currentSession();
  if (s) log("auth:logout", `${s.role} ${s.name} logged out`);
  clearSession();
}

// ── Activity log ──────────────────────────────────────────────────────────────

export async function log(action, message) {
  const s = currentSession();
  const row = {
    id:      "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 9999),
    action,
    message,
    by_name: s?.name || "system",
    by_role: s?.role || "system",
  };
  await supabase.from("activity_logs").insert(row);
}

// ── ensureSeed — no-op (seed is in the SQL file) ─────────────────────────────
export function ensureSeed() {
  // Seed data lives in supabase-schema.sql — nothing to do at runtime.
}
