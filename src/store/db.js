// ============================================================================
//  TSID Local Data Layer
//  All persistent state lives in localStorage. Seed data is inserted once.
// ============================================================================

const KEYS = {
  schools: "tsid:schools",
  students: "tsid:students",
  applications: "tsid:applications",
  payments: "tsid:payments",
  certificates: "tsid:certificates",
  requestLetters: "tsid:requestLetters",
  logs: "tsid:logs",
  session: "tsid:session",
  govUsers: "tsid:govUsers",
  seeded: "tsid:seeded:v1",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

// ---------------------------------------------------------------------------
//  ID generators
// ---------------------------------------------------------------------------

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
  return (
    "tz" +
    Math.random().toString(36).slice(2, 8).toUpperCase() +
    "!"
  );
}

// ---------------------------------------------------------------------------
//  CRUD helpers
// ---------------------------------------------------------------------------

export const db = {
  keys: KEYS,

  // Schools ---------------------------------------------------------------
  getSchools() {
    return read(KEYS.schools, []);
  },
  findSchool(code) {
    return this.getSchools().find((s) => s.code === code);
  },
  saveSchool(school) {
    const schools = this.getSchools();
    const idx = schools.findIndex((s) => s.code === school.code);
    if (idx >= 0) schools[idx] = { ...schools[idx], ...school };
    else schools.push(school);
    write(KEYS.schools, schools);
    return school;
  },

  // Students --------------------------------------------------------------
  getStudents() {
    return read(KEYS.students, []);
  },
  findStudent(tsid) {
    return this.getStudents().find((s) => s.tsid === tsid);
  },
  findStudentsBySchool(schoolCode) {
    return this.getStudents().filter((s) => s.schoolCode === schoolCode);
  },
  saveStudent(student) {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.tsid === student.tsid);
    if (idx >= 0) students[idx] = { ...students[idx], ...student };
    else students.push(student);
    write(KEYS.students, students);
    return student;
  },
  addRemark(tsid, remark) {
    const s = this.findStudent(tsid);
    if (!s) return null;
    s.remarks = s.remarks || [];
    s.remarks.push({
      text: remark,
      by: (currentSession() && currentSession().name) || "School Admin",
      at: new Date().toISOString(),
    });
    return this.saveStudent(s);
  },

  // Applications ----------------------------------------------------------
  getApplications() {
    return read(KEYS.applications, []);
  },
  applicationsForSchool(code) {
    return this.getApplications().filter((a) => a.schoolCode === code);
  },
  saveApplication(app) {
    const apps = this.getApplications();
    const idx = apps.findIndex((a) => a.id === app.id);
    if (idx >= 0) apps[idx] = { ...apps[idx], ...app };
    else apps.push(app);
    write(KEYS.applications, apps);
    return app;
  },
  approveApplication(id) {
    const apps = this.getApplications();
    const a = apps.find((x) => x.id === id);
    if (!a) return null;
    a.status = "approved";
    a.decidedAt = new Date().toISOString();
    write(KEYS.applications, apps);

    // Turn the approved application into a real student record
    const student = {
      tsid: a.tsid || genTsid(),
      fullname: a.fullname,
      dob: a.dob,
      gender: a.gender,
      nationality: a.nationality || "Tanzanian",
      schoolName: a.schoolName,
      schoolCode: a.schoolCode,
      region: a.region,
      district: a.district,
      ward: a.ward,
      schoolContact: a.schoolContact,
      enrollmentDate: a.enrollmentDate || new Date().toISOString().slice(0, 10),
      level: a.level,
      bloodGroup: a.bloodGroup,
      parentName: a.parentName,
      parentNida: a.parentNida,
      relationship: a.relationship,
      parentPhone: a.parentPhone,
      issueDate: new Date().toISOString().slice(0, 10),
      photo: a.photo || "",
      status: "active",
      remarks: [],
      credentials: { username: a.tsid || genTsid(), password: "student123" },
    };
    this.saveStudent(student);
    log("application:approve", `Approved application ${a.id} → ${student.tsid}`);
    return student;
  },
  rejectApplication(id, reason) {
    const apps = this.getApplications();
    const a = apps.find((x) => x.id === id);
    if (!a) return null;
    a.status = "rejected";
    a.rejectReason = reason;
    a.decidedAt = new Date().toISOString();
    write(KEYS.applications, apps);
    log("application:reject", `Rejected application ${a.id} (${reason})`);
    return a;
  },

  // Payments --------------------------------------------------------------
  getPayments() {
    return read(KEYS.payments, []);
  },
  paymentsForSchool(code) {
    return this.getPayments().filter((p) => p.schoolCode === code);
  },
  paymentsForStudent(tsid) {
    return this.getPayments().filter((p) => p.tsid === tsid);
  },
  savePayment(p) {
    const payments = this.getPayments();
    const idx = payments.findIndex((x) => x.ref === p.ref);
    if (idx >= 0) payments[idx] = { ...payments[idx], ...p };
    else payments.push(p);
    write(KEYS.payments, payments);
    return p;
  },

  // Certificates ----------------------------------------------------------
  getCertificates() {
    return read(KEYS.certificates, []);
  },
  certificatesForStudent(tsid) {
    return this.getCertificates().filter((c) => c.tsid === tsid);
  },
  saveCertificate(c) {
    const certs = this.getCertificates();
    const idx = certs.findIndex((x) => x.id === c.id);
    if (idx >= 0) certs[idx] = { ...certs[idx], ...c };
    else certs.push(c);
    write(KEYS.certificates, certs);
    return c;
  },

  // Request letters -------------------------------------------------------
  getLetters() {
    return read(KEYS.requestLetters, []);
  },
  lettersForStudent(tsid) {
    return this.getLetters().filter((l) => l.tsid === tsid);
  },
  saveLetter(l) {
    const letters = this.getLetters();
    const idx = letters.findIndex((x) => x.ref === l.ref);
    if (idx >= 0) letters[idx] = { ...letters[idx], ...l };
    else letters.push(l);
    write(KEYS.requestLetters, letters);
    return l;
  },

  // Logs ------------------------------------------------------------------
  getLogs() {
    return read(KEYS.logs, []);
  },

  // Gov users -------------------------------------------------------------
  getGovUsers() {
    return read(KEYS.govUsers, []);
  },
  findGovUser(username) {
    return this.getGovUsers().find((u) => u.username === username);
  },
};

// ---------------------------------------------------------------------------
//  Session (auth)
// ---------------------------------------------------------------------------

export function currentSession() {
  return read(KEYS.session, null);
}

export function login(role, identity) {
  const session = {
    role,
    name: identity.name,
    ref: identity.ref, // school code / gov id / student tsid
    loginAt: new Date().toISOString(),
  };
  write(KEYS.session, session);
  log("auth:login", `${role} ${identity.name} logged in`);
  return session;
}

export function logout() {
  const s = currentSession();
  if (s) log("auth:logout", `${s.role} ${s.name} logged out`);
  localStorage.removeItem(KEYS.session);
}

// ---------------------------------------------------------------------------
//  Activity log
// ---------------------------------------------------------------------------

export function log(action, message) {
  const logs = read(KEYS.logs, []);
  logs.unshift({
    id: "LOG-" + Date.now() + "-" + Math.floor(Math.random() * 999),
    action,
    message,
    at: new Date().toISOString(),
    by: (currentSession() && currentSession().name) || "system",
    role: (currentSession() && currentSession().role) || "system",
  });
  // cap at 500
  if (logs.length > 500) logs.length = 500;
  write(KEYS.logs, logs);
}

// ---------------------------------------------------------------------------
//  Seed data — inserted once
// ---------------------------------------------------------------------------

export function ensureSeed() {
  if (localStorage.getItem(KEYS.seeded)) return;

  const school1 = {
    code: "DS1024",
    name: "Shule Ya Msingi Mwangaza",
    type: "Primary School",
    region: "Dar es Salaam",
    district: "Kinondoni",
    ward: "Mikocheni",
    contact: "+255 782 112 233",
    email: "mwangaza@tsid.go.tz",
    address: "Mikocheni B, Kinondoni",
    username: "mwangaza",
    password: "school123",
    createdAt: "2026-01-15T08:00:00.000Z",
    status: "active",
  };

  const school2 = {
    code: "AR2050",
    name: "Arusha Secondary School",
    type: "Secondary School",
    region: "Arusha",
    district: "Arusha DC",
    ward: "Sekei",
    contact: "+255 754 889 100",
    email: "arusha.sec@tsid.go.tz",
    address: "Sekei Road, Arusha",
    username: "arusha",
    password: "school123",
    createdAt: "2026-02-03T09:30:00.000Z",
    status: "active",
  };

  const school3 = {
    code: "MB3017",
    name: "Mbeya University College",
    type: "University / College",
    region: "Mbeya",
    district: "Mbeya CC",
    ward: "Iyunga",
    contact: "+255 762 445 901",
    email: "muc@tsid.go.tz",
    address: "Iyunga, Mbeya",
    username: "mbeya",
    password: "school123",
    createdAt: "2026-02-22T14:10:00.000Z",
    status: "active",
  };

  write(KEYS.schools, [school1, school2, school3]);

  const student1 = {
    tsid: "TSID-2026-A7K9P2X",
    fullname: "Juma A. Mwanza",
    dob: "2014-05-15",
    gender: "Male",
    nationality: "Tanzanian",
    schoolName: school1.name,
    schoolCode: school1.code,
    region: school1.region,
    district: school1.district,
    ward: school1.ward,
    schoolContact: school1.contact,
    enrollmentDate: "2020-01-10",
    level: "Standard 4",
    bloodGroup: "O+",
    parentName: "Aishatu Juma",
    parentNida: "19901234567890123",
    relationship: "Mother",
    parentPhone: "+255 712 345 678",
    issueDate: "2026-05-20",
    photo: "",
    status: "active",
    remarks: [
      {
        text: "Excellent academic performance in term 1.",
        by: "Head Teacher",
        at: "2026-04-12T10:00:00.000Z",
      },
    ],
    credentials: { username: "TSID-2026-A7K9P2X", password: "student123" },
  };

  const student2 = {
    tsid: "TSID-2026-B3M8Q1Y",
    fullname: "Neema Joseph Komba",
    dob: "2010-09-22",
    gender: "Female",
    nationality: "Tanzanian",
    schoolName: school2.name,
    schoolCode: school2.code,
    region: school2.region,
    district: school2.district,
    ward: school2.ward,
    schoolContact: school2.contact,
    enrollmentDate: "2022-01-15",
    level: "Form 2",
    bloodGroup: "A+",
    parentName: "Joseph Komba",
    parentNida: "19851122334455",
    relationship: "Father",
    parentPhone: "+255 754 998 211",
    issueDate: "2026-03-11",
    photo: "",
    status: "active",
    remarks: [],
    credentials: { username: "TSID-2026-B3M8Q1Y", password: "student123" },
  };

  const student3 = {
    tsid: "TSID-2026-C5T9Z7W",
    fullname: "Grace Baraka Mushi",
    dob: "2003-12-03",
    gender: "Female",
    nationality: "Tanzanian",
    schoolName: school3.name,
    schoolCode: school3.code,
    region: school3.region,
    district: school3.district,
    ward: school3.ward,
    schoolContact: school3.contact,
    enrollmentDate: "2023-10-01",
    level: "Year 1 - Bachelor of Education",
    bloodGroup: "B+",
    parentName: "Baraka Mushi",
    parentNida: "19700988776655",
    relationship: "Father",
    parentPhone: "+255 762 100 900",
    issueDate: "2026-02-28",
    photo: "",
    status: "active",
    remarks: [],
    credentials: { username: "TSID-2026-C5T9Z7W", password: "student123" },
  };

  write(KEYS.students, [student1, student2, student3]);

  const apps = [
    {
      id: "APP-1001",
      fullname: "Erick Sebastian Massawe",
      dob: "2016-03-10",
      gender: "Male",
      nationality: "Tanzanian",
      schoolName: school1.name,
      schoolCode: school1.code,
      region: school1.region,
      district: school1.district,
      ward: school1.ward,
      schoolContact: school1.contact,
      enrollmentDate: "2026-01-12",
      level: "Standard 1",
      bloodGroup: "O+",
      parentName: "Sebastian Massawe",
      parentNida: "19881234567890",
      relationship: "Father",
      parentPhone: "+255 715 222 333",
      photo: "",
      status: "pending",
      submittedAt: "2026-06-10T11:20:00.000Z",
    },
    {
      id: "APP-1002",
      fullname: "Zawadi Ally Mwakasege",
      dob: "2009-07-19",
      gender: "Female",
      nationality: "Tanzanian",
      schoolName: school2.name,
      schoolCode: school2.code,
      region: school2.region,
      district: school2.district,
      ward: school2.ward,
      schoolContact: school2.contact,
      enrollmentDate: "2026-01-15",
      level: "Form 1",
      bloodGroup: "AB+",
      parentName: "Ally Mwakasege",
      parentNida: "19791122334455",
      relationship: "Father",
      parentPhone: "+255 754 700 800",
      photo: "",
      status: "pending",
      submittedAt: "2026-06-15T08:45:00.000Z",
    },
  ];
  write(KEYS.applications, apps);

  const payments = [
    {
      ref: "PAY-10010023",
      tsid: student1.tsid,
      schoolCode: school1.code,
      studentName: student1.fullname,
      amount: 5000,
      currency: "TZS",
      purpose: "ID Card Processing",
      method: "M-Pesa",
      status: "paid",
      paidAt: "2026-05-18T14:30:00.000Z",
    },
    {
      ref: "PAY-10010024",
      tsid: student2.tsid,
      schoolCode: school2.code,
      studentName: student2.fullname,
      amount: 8000,
      currency: "TZS",
      purpose: "ID Card Processing",
      method: "Tigo Pesa",
      status: "pending",
      paidAt: null,
    },
    {
      ref: "PAY-10010025",
      tsid: student3.tsid,
      schoolCode: school3.code,
      studentName: student3.fullname,
      amount: 12000,
      currency: "TZS",
      purpose: "ID Card Processing",
      method: "Bank Transfer",
      status: "paid",
      paidAt: "2026-02-26T09:00:00.000Z",
    },
  ];
  write(KEYS.payments, payments);

  const certs = [
    {
      id: "CRT-5001",
      tsid: student1.tsid,
      studentName: student1.fullname,
      schoolCode: school1.code,
      schoolName: school1.name,
      title: "Certificate of Enrollment",
      issuedAt: "2026-05-20",
      ref: "TSID-CRT-5001",
    },
    {
      id: "CRT-5002",
      tsid: student2.tsid,
      studentName: student2.fullname,
      schoolCode: school2.code,
      schoolName: school2.name,
      title: "Certificate of Enrollment",
      issuedAt: "2026-03-11",
      ref: "TSID-CRT-5002",
    },
  ];
  write(KEYS.certificates, certs);

  const letters = [
    {
      ref: "LTR-9001",
      tsid: student1.tsid,
      studentName: student1.fullname,
      schoolCode: school1.code,
      schoolName: school1.name,
      type: "Utambulisho",
      reason: "For travel purposes during school break.",
      status: "approved",
      requestedAt: "2026-05-25T10:00:00.000Z",
      approvedAt: "2026-05-26T09:00:00.000Z",
    },
  ];
  write(KEYS.requestLetters, letters);

  write(KEYS.logs, [
    {
      id: "LOG-1",
      action: "system:seed",
      message: "TSID system initialized with seed data (3 schools, 3 students, 2 applications).",
      at: new Date().toISOString(),
      by: "system",
      role: "system",
    },
  ]);

  // Gov users
  const govUsers = [
    {
      id: "GOV-001",
      name: "Amina Rashid Mtendaji",
      username: "gov",
      password: "gov123",
      role: "Government Officer",
      ministry: "Wizara ya Elimu, Sayansi na Teknolojia",
      region: "Dar es Salaam",
      phone: "+255 768 000 001",
      email: "amina.mtendaji@tsid.go.tz",
      createdAt: "2026-01-01T00:00:00.000Z",
      status: "active",
    },
    {
      id: "GOV-002",
      name: "Hassan Juma Mkurugenzi",
      username: "gov2",
      password: "gov456",
      role: "Senior Gov Supervisor",
      ministry: "PO-RALG / TAMISEMI",
      region: "Dodoma",
      phone: "+255 768 000 002",
      email: "hassan.mkurugenzi@tsid.go.tz",
      createdAt: "2026-01-05T00:00:00.000Z",
      status: "active",
    },
  ];
  write(KEYS.govUsers, govUsers);

  localStorage.setItem(KEYS.seeded, "1");
}
