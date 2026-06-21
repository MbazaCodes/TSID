import { Navbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db } from "../../store/db.js";
import { FullIDCardPair, MiniIDCard, initCardQRs } from "../../components/IDCard.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

// /search/result/student/<tsid>
export function StudentResultView(tsid) {
  const student = db.findStudent(tsid);
  if (!student) return notFound("student", tsid);

  const school = db.findSchool(student.schoolCode);
  const certs = db.certificatesForStudent(student.tsid);

  return `
  ${Navbar("#/search")}

  <div style="max-width:1200px;margin:0 auto;padding:24px">
    <div class="tsid-page-head">
      <div>
        <h1>Student Verification Result</h1>
        <p>TSID <span style="font-family:ui-monospace;font-weight:700;color:#003366">${escapeHtml(student.tsid)}</span> — verified in the national registry.</p>
      </div>
      <a href="#/search" class="btn btn-outline">← Back to Search</a>
    </div>

    <div class="id-result-grid">
      <!-- Left: full CR80 ID card -->
      <div class="print-area">
        ${FullIDCardPair(student)}
      </div>

      <!-- Right: structured info -->
      <div class="id-result-meta">
        <h2>Verified Student Information</h2>
        <div class="row"><span class="k">Full Name</span><span class="v">${escapeHtml(student.fullname)}</span></div>
        <div class="row"><span class="k">TSID Number</span><span class="v">${escapeHtml(student.tsid)}</span></div>
        <div class="row"><span class="k">Date of Birth</span><span class="v">${fmtDate(student.dob)}</span></div>
        <div class="row"><span class="k">Gender</span><span class="v">${escapeHtml(student.gender || "—")}</span></div>
        <div class="row"><span class="k">Nationality</span><span class="v">${escapeHtml(student.nationality || "Tanzanian")}</span></div>
        <div class="row"><span class="k">Current Level</span><span class="v">${escapeHtml(student.level || "—")}</span></div>
        <div class="row"><span class="k">Enrollment Date</span><span class="v">${fmtDate(student.enrollmentDate)}</span></div>
        <div class="row"><span class="k">Issue Date</span><span class="v">${fmtDate(student.issueDate)}</span></div>
        <div class="row"><span class="k">Blood Group</span><span class="v">${escapeHtml(student.bloodGroup || "—")}</span></div>

        <h2 style="margin-top:18px">School Information</h2>
        <div class="row"><span class="k">School Name</span><span class="v">${escapeHtml(student.schoolName)}</span></div>
        <div class="row"><span class="k">School Code</span><span class="v">${escapeHtml(student.schoolCode)}</span></div>
        <div class="row"><span class="k">Region</span><span class="v">${escapeHtml(student.region)}</span></div>
        <div class="row"><span class="k">District</span><span class="v">${escapeHtml(student.district)}</span></div>
        <div class="row"><span class="k">Ward</span><span class="v">${escapeHtml(student.ward)}</span></div>
        <div class="row"><span class="k">School Contact</span><span class="v">${escapeHtml(school ? school.contact : student.schoolContact || "—")}</span></div>
        ${
          school && school.email
            ? `<div class="row"><span class="k">Email</span><span class="v">${escapeHtml(school.email)}</span></div>`
            : ""
        }

        <h2 style="margin-top:18px">Parent / Guardian</h2>
        <div class="row"><span class="k">Name</span><span class="v">${escapeHtml(student.parentName || "—")}</span></div>
        <div class="row"><span class="k">Relationship</span><span class="v">${escapeHtml(student.relationship || "—")}</span></div>
        <div class="row"><span class="k">Phone</span><span class="v">${escapeHtml(student.parentPhone || "—")}</span></div>

        <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
          <span class="badge green" style="align-self:center">✓ Verified in national registry</span>
          ${certs.length ? `<span class="badge blue" style="align-self:center">★ ${certs.length} Certificate${certs.length > 1 ? "s" : ""}</span>` : ""}
        </div>
      </div>
    </div>
  </div>

  ${Footer()}
  `;
}

// /search/result/school/<code>
export function SchoolResultView(code) {
  const school = db.findSchool(code);
  if (!school) return notFound("school", code);

  const students = db.findStudentsBySchool(school.code);
  const payments = db.paymentsForSchool(school.code);

  return `
  ${Navbar("#/search")}

  <div style="max-width:1200px;margin:0 auto;padding:24px">
    <div class="tsid-page-head">
      <div>
        <h1>School Verification Result</h1>
        <p>School Code <span style="font-family:ui-monospace;font-weight:700;color:#003366">${escapeHtml(school.code)}</span> — verified in the national registry.</p>
      </div>
      <a href="#/search" class="btn btn-outline">← Back to Search</a>
    </div>

    <div class="id-result-grid">
      <!-- Left: ID-style school card -->
      <div>
        <div class="mini-id-card" style="max-width:none">
          <div class="header">
            <div>
              <div class="tsid">TSID · SCHOOL</div>
              <div class="small">Tanzania Student Identification System</div>
            </div>
            <span class="badge green">Verified</span>
          </div>
          <div class="body" style="padding:18px 20px;display:block">
            <div style="font-size:18px;font-weight:900;color:#003366;margin-bottom:8px">${escapeHtml(school.name)}</div>
            <div style="font-size:13px;color:#64748b;margin-bottom:14px">${escapeHtml(school.type)}</div>
            <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
              <span style="color:#64748b;font-weight:600">School Code</span>
              <span style="font-weight:700;font-family:ui-monospace">${escapeHtml(school.code)}</span>
            </div>
            <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
              <span style="color:#64748b;font-weight:600">Region / District</span>
              <span style="font-weight:700">${escapeHtml(school.region)} / ${escapeHtml(school.district)}</span>
            </div>
            <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
              <span style="color:#64748b;font-weight:600">Ward</span>
              <span style="font-weight:700">${escapeHtml(school.ward)}</span>
            </div>
            <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
              <span style="color:#64748b;font-weight:600">Contact</span>
              <span style="font-weight:700">${escapeHtml(school.contact)}</span>
            </div>
            <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
              <span style="color:#64748b;font-weight:600">Email</span>
              <span style="font-weight:700">${escapeHtml(school.email || "—")}</span>
            </div>
            <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
              <span style="color:#64748b;font-weight:600">Registered</span>
              <span style="font-weight:700">${fmtDate(school.createdAt)}</span>
            </div>
          </div>
          <div class="footer">
            <div class="seg green"></div><div class="seg yellow"></div><div class="seg black"></div><div class="seg blue"></div>
          </div>
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
          <span class="badge green" style="align-self:center">✓ Verified school</span>
        </div>
      </div>

      <!-- Right: students list -->
      <div class="id-result-meta">
        <h2>Registered Students (${students.length})</h2>
        ${
          students.length === 0
            ? `<div class="empty-state"><div class="ic">📭</div><p>No students registered at this school yet.</p></div>`
            : students
                .map(
                  (st) => `<a href="#/search/result/student/${encodeURIComponent(st.tsid)}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #e2e8f0;text-decoration:none;color:inherit">
                    <div>
                      <div style="font-weight:700;color:#003366">${escapeHtml(st.fullname)}</div>
                      <div style="font-size:11px;color:#64748b;font-family:ui-monospace">${escapeHtml(st.tsid)} · ${escapeHtml(st.level || "—")}</div>
                    </div>
                    <span class="badge blue">View ID →</span>
                  </a>`
                )
                .join("")
        }

        <h2 style="margin-top:18px">Payment Summary</h2>
        <div class="row"><span class="k">Total Payments</span><span class="v">${payments.length}</span></div>
        <div class="row"><span class="k">Paid</span><span class="v">${payments.filter(p=>p.status==="paid").length}</span></div>
        <div class="row"><span class="k">Pending</span><span class="v">${payments.filter(p=>p.status==="pending").length}</span></div>
      </div>
    </div>
  </div>

  ${Footer()}
  `;
}

function notFound(kind, ref) {
  return `
  ${Navbar("#/search")}
  <div style="max-width:600px;margin:60px auto;text-align:center">
    <div style="font-size:60px;opacity:.4">🔍</div>
    <h1 style="font-size:22px;font-weight:900;color:#003366;margin-top:14px">No ${escapeHtml(kind)} found</h1>
    <p style="color:#64748b;margin-top:6px">We could not find a ${escapeHtml(kind)} matching <code style="background:#f1f5f9;padding:2px 8px;border-radius:4px">${escapeHtml(ref)}</code> in the national registry.</p>
    <a href="#/search" class="btn btn-primary" style="margin-top:18px">← Back to Search</a>
  </div>
  ${Footer()}
  `;
}

export function initResultView() {
  initCardQRs();
}
