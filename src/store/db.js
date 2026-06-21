// ============================================================================
//  TSID Data Layer — Supabase backend with sync-compatible in-memory cache
//
//  Strategy: on app boot, loadAll() fetches everything into _cache.
//  All view-facing db.* methods are SYNCHRONOUS (read from cache).
//  Write methods (save*, approve*, reject*, addRemark, saveLetter, etc.)
//  write to Supabase AND update the cache immediately so views stay consistent.
//  This preserves the original sync API — zero view changes needed.
// ============================================================================

import { supabase } from "./supabase.js";

// ── Password hashing (SHA-256) ──────────────────────────────────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Check if a password matches a stored hash
async function verifyPassword(password, storedHash) {
  // Support legacy plaintext passwords during migration
  if (!storedHash || storedHash.length < 64) {
    return password === storedHash;
  }
  const hash = await hashPassword(password);
  return hash === storedHash;
}

// ── Session (localStorage) ────────────────────────────────────────────────────
const SESSION_KEY = "tsid:session";
function readSession()   { try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function writeSession(v) { localStorage.setItem(SESSION_KEY, JSON.stringify(v)); }
function clearSession()  { localStorage.removeItem(SESSION_KEY); }

// ── In-memory cache ───────────────────────────────────────────────────────────
const _cache = {
  schools:      [],
  students:     [],
  applications: [],
  payments:     [],
  certificates: [],
  letters:      [],
  logs:         [],
  govUsers:     [],
  loaded:       false,
};

// ── Column mappers (snake_case → camelCase) ───────────────────────────────────
function mapSchool(r) {
  if (!r) return null;
  return { code: r.code, name: r.name, type: r.type, region: r.region, district: r.district,
    ward: r.ward, contact: r.contact, email: r.email, address: r.address,
    username: r.username, password: r.password, status: r.status, createdAt: r.created_at };
}
function mapStudent(r) {
  if (!r) return null;
  return { tsid: r.tsid, fullname: r.fullname, dob: r.dob, gender: r.gender,
    nationality: r.nationality, schoolName: r.school_name, schoolCode: r.school_code,
    region: r.region, district: r.district, ward: r.ward, schoolContact: r.school_contact,
    enrollmentDate: r.enrollment_date, level: r.level, bloodGroup: r.blood_group,
    parentName: r.parent_name, parentNida: r.parent_nida, relationship: r.relationship,
    parentPhone: r.parent_phone, issueDate: r.issue_date, photo: r.photo || "",
    status: r.status, remarks: Array.isArray(r.remarks) ? r.remarks : [],
    credentials: { username: r.cred_username || r.tsid, password: r.cred_password || "student123" } };
}
function mapApplication(r) {
  if (!r) return null;
  return { id: r.id, fullname: r.fullname, dob: r.dob, gender: r.gender, nationality: r.nationality,
    schoolName: r.school_name, schoolCode: r.school_code, region: r.region, district: r.district,
    ward: r.ward, schoolContact: r.school_contact, enrollmentDate: r.enrollment_date, level: r.level,
    bloodGroup: r.blood_group, parentName: r.parent_name, parentNida: r.parent_nida,
    relationship: r.relationship, parentPhone: r.parent_phone, photo: r.photo || "",
    status: r.status, rejectReason: r.reject_reason, tsid: r.tsid,
    submittedAt: r.submitted_at, decidedAt: r.decided_at };
}
function mapPayment(r) {
  if (!r) return null;
  return { ref: r.ref, tsid: r.tsid, schoolCode: r.school_code, studentName: r.student_name,
    amount: r.amount, currency: r.currency, purpose: r.purpose, method: r.method,
    status: r.status, paidAt: r.paid_at };
}
function mapCertificate(r) {
  if (!r) return null;
  return { id: r.id, tsid: r.tsid, studentName: r.student_name, schoolCode: r.school_code,
    schoolName: r.school_name, title: r.title, issuedAt: r.issued_at, ref: r.ref };
}
function mapLetter(r) {
  if (!r) return null;
  return { ref: r.ref, tsid: r.tsid, studentName: r.student_name, schoolCode: r.school_code,
    schoolName: r.school_name, type: r.type, reason: r.reason, addressee: r.addressee,
    urgency: r.urgency, status: r.status, requestedAt: r.requested_at, approvedAt: r.approved_at };
}
function mapLog(r) {
  if (!r) return null;
  return { id: r.id, action: r.action, message: r.message, by: r.by_name, role: r.by_role, at: r.created_at };
}
function mapGovUser(r) {
  if (!r) return null;
  return { id: r.id, name: r.name, username: r.username, password: r.password, role: r.role,
    ministry: r.ministry, region: r.region, phone: r.phone, email: r.email,
    status: r.status, createdAt: r.created_at };
}

// ── Boot: load everything from Supabase into cache ────────────────────────────
export async function loadAll() {
  const [sc, st, ap, py, ce, lt, lg, gu] = await Promise.all([
    supabase.from("schools").select("*").order("created_at"),
    supabase.from("students").select("*").order("created_at"),
    supabase.from("applications").select("*").order("submitted_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("certificates").select("*"),
    supabase.from("request_letters").select("*").order("requested_at", { ascending: false }),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("gov_users").select("*"),
  ]);
  _cache.schools      = (sc.data  || []).map(mapSchool);
  _cache.students     = (st.data  || []).map(mapStudent);
  _cache.applications = (ap.data  || []).map(mapApplication);
  _cache.payments     = (py.data  || []).map(mapPayment);
  _cache.certificates = (ce.data  || []).map(mapCertificate);
  _cache.letters      = (lt.data  || []).map(mapLetter);
  _cache.logs         = (lg.data  || []).map(mapLog);
  _cache.govUsers     = (gu.data  || []).map(mapGovUser);
  _cache.loaded       = true;
}

// ── ID generators ─────────────────────────────────────────────────────────────
export function genTsid() {
  return `TSID-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,9).toUpperCase()}`;
}
export function genSchoolCode(region) {
  return (region||"TZ").slice(0,2).toUpperCase() + Math.floor(1000+Math.random()*9000);
}
export function genPaymentRef() {
  return "PAY-" + Date.now().toString().slice(-8) + Math.floor(Math.random()*99);
}
export function genLetterRef() {
  return "LTR-" + Date.now().toString().slice(-8);
}
export function genCredentialPassword() {
  return "tz" + Math.random().toString(36).slice(2,8).toUpperCase() + "!";
}

// ── db — SYNC reads from cache, async writes to Supabase + cache ──────────────
export const db = {

  // Schools
  getSchools()          { return _cache.schools; },
  findSchool(code)      { return _cache.schools.find(s => s.code === code) || null; },
  async saveSchool(school) {
    const row = { code: school.code, name: school.name, type: school.type, region: school.region,
      district: school.district, ward: school.ward, contact: school.contact, email: school.email,
      address: school.address, username: school.username, password: school.password,
      status: school.status || "active" };
    const { data } = await supabase.from("schools").upsert(row, { onConflict:"code" }).select().maybeSingle();
    const mapped = mapSchool(data);
    const idx = _cache.schools.findIndex(s => s.code === school.code);
    if (idx >= 0) _cache.schools[idx] = mapped; else _cache.schools.push(mapped);
    return mapped;
  },

  // Students
  getStudents()                { return _cache.students; },
  findStudent(tsid)            { return _cache.students.find(s => s.tsid === tsid) || null; },
  findStudentsBySchool(code)   { return _cache.students.filter(s => s.schoolCode === code); },
  async saveStudent(student) {
    const row = { tsid: student.tsid, fullname: student.fullname, dob: student.dob||null,
      gender: student.gender, nationality: student.nationality||"Tanzanian",
      school_name: student.schoolName, school_code: student.schoolCode,
      region: student.region, district: student.district, ward: student.ward,
      school_contact: student.schoolContact, enrollment_date: student.enrollmentDate||null,
      level: student.level, blood_group: student.bloodGroup, parent_name: student.parentName,
      parent_nida: student.parentNida, relationship: student.relationship,
      parent_phone: student.parentPhone, issue_date: student.issueDate||null,
      photo: student.photo||"", status: student.status||"active", remarks: student.remarks||[],
      cred_username: student.credentials?.username||student.tsid,
      cred_password: student.credentials?.password||"student123" };
    const { data } = await supabase.from("students").upsert(row,{onConflict:"tsid"}).select().maybeSingle();
    const mapped = mapStudent(data);
    const idx = _cache.students.findIndex(s => s.tsid === student.tsid);
    if (idx >= 0) _cache.students[idx] = mapped; else _cache.students.push(mapped);
    return mapped;
  },
  async addRemark(tsid, remark) {
    const st = this.findStudent(tsid);
    if (!st) return null;
    const remarks = [...(st.remarks||[]), { text: remark, by: currentSession()?.name||"School Admin", at: new Date().toISOString() }];
    const { data } = await supabase.from("students").update({ remarks }).eq("tsid", tsid).select().maybeSingle();
    const mapped = mapStudent(data);
    const idx = _cache.students.findIndex(s => s.tsid === tsid);
    if (idx >= 0) _cache.students[idx] = mapped;
    return mapped;
  },

  // Applications
  getApplications()            { return _cache.applications; },
  applicationsForSchool(code)  { return _cache.applications.filter(a => a.schoolCode === code); },
  async saveApplication(app) {
    const row = { id: app.id, fullname: app.fullname, dob: app.dob||null, gender: app.gender,
      nationality: app.nationality||"Tanzanian", school_name: app.schoolName, school_code: app.schoolCode,
      region: app.region, district: app.district, ward: app.ward, school_contact: app.schoolContact,
      enrollment_date: app.enrollmentDate||null, level: app.level, blood_group: app.bloodGroup,
      parent_name: app.parentName, parent_nida: app.parentNida, relationship: app.relationship,
      parent_phone: app.parentPhone, photo: app.photo||"", status: app.status||"pending" };
    const { data } = await supabase.from("applications").upsert(row,{onConflict:"id"}).select().maybeSingle();
    const mapped = mapApplication(data);
    const idx = _cache.applications.findIndex(a => a.id === app.id);
    if (idx >= 0) _cache.applications[idx] = mapped; else _cache.applications.push(mapped);
    return mapped;
  },
  async approveApplication(id) {
    await supabase.from("applications").update({ status:"approved", decided_at: new Date().toISOString() }).eq("id", id);
    const a = this.getApplications().find(x => x.id === id);
    if (!a) return null;
    const idx = _cache.applications.findIndex(x => x.id === id);
    if (idx >= 0) _cache.applications[idx] = { ..._cache.applications[idx], status:"approved", decidedAt: new Date().toISOString() };
    const tsid = a.tsid || genTsid();
    const student = { tsid, fullname:a.fullname, dob:a.dob, gender:a.gender,
      nationality:a.nationality||"Tanzanian", schoolName:a.schoolName, schoolCode:a.schoolCode,
      region:a.region, district:a.district, ward:a.ward, schoolContact:a.schoolContact,
      enrollmentDate:a.enrollmentDate||new Date().toISOString().slice(0,10), level:a.level,
      bloodGroup:a.bloodGroup, parentName:a.parentName, parentNida:a.parentNida,
      relationship:a.relationship, parentPhone:a.parentPhone,
      issueDate:new Date().toISOString().slice(0,10), photo:a.photo||"",
      status:"active", remarks:[], credentials:{ username:tsid, password:"student123" } };
    await this.saveStudent(student);
    log("application:approve", `Approved application ${id} → ${tsid}`);
    return student;
  },
  async rejectApplication(id, reason) {
    await supabase.from("applications").update({ status:"rejected", reject_reason:reason, decided_at:new Date().toISOString() }).eq("id",id);
    const idx = _cache.applications.findIndex(a => a.id === id);
    if (idx >= 0) _cache.applications[idx] = { ..._cache.applications[idx], status:"rejected", rejectReason:reason, decidedAt:new Date().toISOString() };
    log("application:reject", `Rejected application ${id} (${reason})`);
    return _cache.applications[idx] || null;
  },

  // Payments
  getPayments()               { return _cache.payments; },
  paymentsForSchool(code)     { return _cache.payments.filter(p => p.schoolCode === code); },
  paymentsForStudent(tsid)    { return _cache.payments.filter(p => p.tsid === tsid); },
  async savePayment(p) {
    const row = { ref:p.ref, tsid:p.tsid, school_code:p.schoolCode, student_name:p.studentName,
      amount:p.amount, currency:p.currency||"TZS", purpose:p.purpose, method:p.method,
      status:p.status||"pending", paid_at:p.paidAt||null };
    const { data } = await supabase.from("payments").upsert(row,{onConflict:"ref"}).select().maybeSingle();
    const mapped = mapPayment(data);
    const idx = _cache.payments.findIndex(x => x.ref === p.ref);
    if (idx >= 0) _cache.payments[idx] = mapped; else _cache.payments.unshift(mapped);
    return mapped;
  },

  // Certificates
  getCertificates()             { return _cache.certificates; },
  certificatesForStudent(tsid)  { return _cache.certificates.filter(c => c.tsid === tsid); },
  async saveCertificate(c) {
    const row = { id:c.id, tsid:c.tsid, student_name:c.studentName, school_code:c.schoolCode,
      school_name:c.schoolName, title:c.title, issued_at:c.issuedAt, ref:c.ref };
    const { data } = await supabase.from("certificates").upsert(row,{onConflict:"id"}).select().maybeSingle();
    const mapped = mapCertificate(data);
    const idx = _cache.certificates.findIndex(x => x.id === c.id);
    if (idx >= 0) _cache.certificates[idx] = mapped; else _cache.certificates.push(mapped);
    return mapped;
  },

  // Request Letters
  getLetters()              { return _cache.letters; },
  lettersForStudent(tsid)   { return _cache.letters.filter(l => l.tsid === tsid); },
  async saveLetter(l) {
    const row = { ref:l.ref, tsid:l.tsid, student_name:l.studentName, school_code:l.schoolCode,
      school_name:l.schoolName, type:l.type, reason:l.reason, addressee:l.addressee||null,
      urgency:l.urgency||"normal", status:l.status||"pending",
      requested_at:l.requestedAt||new Date().toISOString(), approved_at:l.approvedAt||null };
    const { data } = await supabase.from("request_letters").upsert(row,{onConflict:"ref"}).select().maybeSingle();
    const mapped = mapLetter(data);
    const idx = _cache.letters.findIndex(x => x.ref === l.ref);
    if (idx >= 0) _cache.letters[idx] = mapped; else _cache.letters.unshift(mapped);
    return mapped;
  },

  // Logs
  getLogs() { return _cache.logs; },

  // Gov Users
  getGovUsers()           { return _cache.govUsers; },
  findGovUser(username)   { return _cache.govUsers.find(u => u.username === username) || null; },
};

// ── Session ───────────────────────────────────────────────────────────────────
export function currentSession() { return readSession(); }

export async function login(role, identity) {
  const session = { role, name: identity.name, ref: identity.ref, loginAt: new Date().toISOString() };
  writeSession(session);
  log("auth:login", `${role} ${identity.name} logged in`);
  return session;
}

export function logout() {
  const s = currentSession();
  if (s) log("auth:logout", `${s.role} ${s.name} logged out`);
  clearSession();
}

// ── Log (fire-and-forget) ─────────────────────────────────────────────────────
export function log(action, message) {
  const s   = currentSession();
  const row = { id:"LOG-"+Date.now()+"-"+Math.floor(Math.random()*9999),
    action, message, by_name: s?.name||"system", by_role: s?.role||"system" };
  _cache.logs.unshift(mapLog({ ...row, created_at: new Date().toISOString() }));
  if (_cache.logs.length > 500) _cache.logs.length = 500;
  supabase.from("activity_logs").insert(row).then(() => {});
}

// ── ensureSeed — no-op (seed lives in supabase-schema.sql) ───────────────────
export function ensureSeed() {}
