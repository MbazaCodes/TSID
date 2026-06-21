// ============================================================================
//  SearchResultView — student + school verification result pages
// ============================================================================
import { Navbar, initNavbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db } from "../../store/db.js";
import { FullIDCardPair, initCardQRs } from "../../components/IDCard.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

// ============================================================================
//  Student result
// ============================================================================
export function StudentResultView(tsid) {
  const student = db.findStudent(tsid);
  if (!student) return notFound("student", tsid);

  const school = db.findSchool(student.schoolCode);
  const certs  = db.certificatesForStudent(student.tsid);
  const letters = db.lettersForStudent(student.tsid);

  const infoSection = (title, rows, bg, border, titleColor) => `
    <div style="background:${bg};border:1.5px solid ${border};border-radius:12px;
      padding:14px 16px;margin-bottom:12px">
      <div style="font-weight:800;font-size:12.5px;color:${titleColor};margin-bottom:8px">${title}</div>
      ${rows.map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;
          padding:5px 0;border-bottom:1px solid ${border};font-size:12.5px;gap:8px">
          <span style="color:${titleColor};opacity:.75;font-weight:600;flex-shrink:0">${k}</span>
          <span style="font-weight:700;text-align:right;word-break:break-word">${v}</span>
        </div>`).join("")}
    </div>`;

  return `
  ${Navbar("#/search")}

  <!-- Breadcrumb -->
  <div style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 24px">
    <div style="max-width:1200px;margin:0 auto;font-size:12.5px;color:#64748b;display:flex;align-items:center;gap:6px">
      <a href="#/" style="color:#64748b;text-decoration:none">Home</a>
      <span>›</span>
      <a href="#/search" style="color:#64748b;text-decoration:none">Public Search</a>
      <span>›</span>
      <span style="color:#0f172a;font-weight:700">Student: ${escapeHtml(student.fullname)}</span>
    </div>
  </div>

  <div style="max-width:1200px;margin:0 auto;padding:24px">

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span class="badge green" style="font-size:12px">✓ Verified in national registry</span>
          ${certs.length ? `<span class="badge blue">★ ${certs.length} Certificate${certs.length > 1 ? "s" : ""}</span>` : ""}
        </div>
        <h1>Student Verification Result</h1>
        <p>TSID <span style="font-family:ui-monospace;font-weight:800;color:#059669">${escapeHtml(student.tsid)}</span> is confirmed in the TSID national registry.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print / PDF</button>
        <a href="#/search" class="btn btn-ghost">← Back</a>
      </div>
    </div>

    <div style="class="rg-card-result" style="align-items:flex-start">

      <!-- Left: ID card -->
      <div class="print-area" style="flex-shrink:0">
        ${FullIDCardPair(student)}
      </div>

      <!-- Right: structured info -->
      <div>
        ${infoSection("🎓 Student Information", [
          ["Full Name",       escapeHtml(student.fullname)],
          ["TSID Number",     `<span style="font-family:ui-monospace;color:#003366">${escapeHtml(student.tsid)}</span>`],
          ["Date of Birth",   fmtDate(student.dob)],
          ["Gender",          escapeHtml(student.gender || "—")],
          ["Nationality",     escapeHtml(student.nationality || "Tanzanian")],
          ["Current Level",   escapeHtml(student.level || "—")],
          ["Blood Group",     escapeHtml(student.bloodGroup || "—")],
          ["Enrollment Date", fmtDate(student.enrollmentDate)],
          ["Issue Date",      fmtDate(student.issueDate)],
        ], "#f8fafc", "#e2e8f0", "#374151")}

        ${infoSection("🏫 School Information", [
          ["School Name",    escapeHtml(student.schoolName)],
          ["School Code",    `<span style="font-family:ui-monospace;font-weight:800">${escapeHtml(student.schoolCode)}</span>`],
          ["Region",         escapeHtml(student.region)],
          ["District",       escapeHtml(student.district)],
          ["Ward",           escapeHtml(student.ward || "—")],
          ["Contact",        escapeHtml((school && school.contact) || student.schoolContact || "—")],
          ...(school && school.email ? [["Email", escapeHtml(school.email)]] : []),
        ], "#eff6ff", "#bfdbfe", "#1e40af")}

        ${infoSection("👨‍👩‍👧 Parent / Guardian", [
          ["Name",         escapeHtml(student.parentName || "—")],
          ["Relationship", escapeHtml(student.relationship || "—")],
          ["Phone",        escapeHtml(student.parentPhone || "—")],
        ], "#f0fdf4", "#6ee7b7", "#065f46")}

        <!-- Verification footer -->
        <div style="
          background:linear-gradient(135deg,#ecfdf5,#d1fae5);
          border:1.5px solid #6ee7b7;border-radius:12px;
          padding:14px 16px;display:flex;align-items:center;gap:12px">
          <div style="font-size:28px">🛡️</div>
          <div>
            <div style="font-weight:800;font-size:13px;color:#065f46">
              Verified by Tanzania Student Identification System
            </div>
            <div style="font-size:12px;color:#059669;margin-top:2px">
              This record is authenticated and verified at <strong>verify.tsid.go.tz</strong>.
              Scan the QR code on the ID card to confirm.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  ${Footer()}
  `;
}

// ============================================================================
//  School result
// ============================================================================
export function SchoolResultView(code) {
  const school   = db.findSchool(code);
  if (!school) return notFound("school", code);

  const students = db.findStudentsBySchool(school.code);
  const payments = db.paymentsForSchool(school.code);
  const paid     = payments.filter((p) => p.status === "paid");
  const revenue  = paid.reduce((s, p) => s + Number(p.amount || 0), 0);

  return `
  ${Navbar("#/search")}

  <!-- Breadcrumb -->
  <div style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 24px">
    <div style="max-width:1200px;margin:0 auto;font-size:12.5px;color:#64748b;display:flex;align-items:center;gap:6px">
      <a href="#/" style="color:#64748b;text-decoration:none">Home</a>
      <span>›</span>
      <a href="#/search" style="color:#64748b;text-decoration:none">Public Search</a>
      <span>›</span>
      <span style="color:#0f172a;font-weight:700">School: ${escapeHtml(school.name)}</span>
    </div>
  </div>

  <div style="max-width:1200px;margin:0 auto;padding:24px">

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <div style="margin-bottom:6px">
          <span class="badge green" style="font-size:12px">✓ Verified school</span>
        </div>
        <h1>School Verification Result</h1>
        <p>Code <span style="font-family:ui-monospace;font-weight:800;color:#059669">${escapeHtml(school.code)}</span> · ${escapeHtml(school.type)} — confirmed in TSID registry.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print / PDF</button>
        <a href="#/search" class="btn btn-ghost">← Back</a>
      </div>
    </div>

    <div style="class="rg-school-result" style="align-items:flex-start">

      <!-- Left: school ID card -->
      <div>
        <!-- School ID card style -->
        <div style="
          background:#fff;border-radius:14px;overflow:hidden;
          border:1.5px solid #e2e8f0;
          box-shadow:0 8px 24px rgba(0,0,0,.08)">
          <div style="background:linear-gradient(135deg,#003366,#059669);padding:16px 20px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:18px;font-weight:900;color:#fff;letter-spacing:-.3px">TSID · SCHOOL</div>
                <div style="font-size:10px;color:#a7f3d0;font-weight:700;margin-top:2px">Tanzania Student ID System</div>
              </div>
              <span class="badge green">Verified</span>
            </div>
          </div>
          <div style="padding:18px 20px">
            <div style="font-size:16px;font-weight:900;color:#0f172a;margin-bottom:4px;line-height:1.3">${escapeHtml(school.name)}</div>
            <div style="font-size:12.5px;color:#64748b;margin-bottom:16px">${escapeHtml(school.type)}</div>
            ${[
              ["School Code",   `<span style="font-family:ui-monospace;font-weight:800;color:#003366">${escapeHtml(school.code)}</span>`],
              ["Region",        escapeHtml(school.region)],
              ["District",      escapeHtml(school.district)],
              ["Ward",          escapeHtml(school.ward)],
              ["Contact",       escapeHtml(school.contact)],
              ["Email",         escapeHtml(school.email || "—")],
              ["Address",       escapeHtml(school.address || "—")],
              ["Registered",    fmtDate(school.createdAt)],
            ].map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;
                padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:12.5px;gap:8px">
                <span style="color:#64748b;font-weight:600;flex-shrink:0">${k}</span>
                <span style="font-weight:700;text-align:right">${v}</span>
              </div>`).join("")}
          </div>
          <div style="height:5px;display:flex">
            <div style="background:#1B8F3A;flex:4.5"></div>
            <div style="background:#F5C400;flex:1"></div>
            <div style="background:#000;flex:1"></div>
            <div style="background:#007AFF;flex:3.5"></div>
          </div>
        </div>

        <!-- School stats -->
        <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[
            ["Students",  students.length,       "#1e40af","#eff6ff","🎓"],
            ["Paid Txns", paid.length,            "#065f46","#ecfdf5","₵"],
            ["Revenue",   "TZS "+revenue.toLocaleString(), "#5b21b6","#f5f3ff","💰"],
            ["Pending",   payments.filter(p=>p.status==="pending").length, "#92400e","#fffbeb","⏳"],
          ].map(([label, val, tc, bg, icon]) => `
            <div style="background:${bg};border-radius:10px;padding:12px 14px">
              <div style="font-size:11px;color:${tc};font-weight:700;opacity:.75">${icon} ${label}</div>
              <div style="font-size:16px;font-weight:900;color:${tc};margin-top:2px">${val}</div>
            </div>`).join("")}
        </div>

        <div style="margin-top:14px;display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" onclick="window.print()" style="flex:1;justify-content:center">🖨️ Print</button>
          <a href="#/search" class="btn btn-ghost btn-sm" style="flex:1;justify-content:center">← Back</a>
        </div>
      </div>

      <!-- Right: students list -->
      <div>
        <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
          <div style="padding:14px 20px;border-bottom:1px solid #f1f5f9;
            display:flex;align-items:center;justify-content:space-between">
            <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">
              Registered Students
              <span style="font-size:13px;font-weight:600;color:#64748b">(${students.length})</span>
            </h3>
          </div>
          ${students.length === 0
            ? `<div class="empty-state"><div class="ic">📭</div><p>No students registered at this school yet.</p></div>`
            : `<table class="tsid-table">
                <thead><tr><th>TSID</th><th>Name</th><th>Level</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${students.map((st) => `
                    <tr>
                      <td class="mono" style="font-size:12px">${escapeHtml(st.tsid)}</td>
                      <td style="font-weight:700">${escapeHtml(st.fullname)}</td>
                      <td style="font-size:12.5px">${escapeHtml(st.level || "—")}</td>
                      <td><span class="badge green">Active</span></td>
                      <td>
                        <a href="#/search/result/student/${encodeURIComponent(st.tsid)}"
                          class="btn btn-outline btn-sm">View ID →</a>
                      </td>
                    </tr>`).join("")}
                </tbody>
              </table>`}
        </div>
      </div>
    </div>
  </div>

  ${Footer()}
  `;
}

// ============================================================================
//  Not found
// ============================================================================
function notFound(kind, ref) {
  return `
  ${Navbar("#/search")}
  <div style="max-width:560px;margin:80px auto;text-align:center;padding:0 24px">
    <div style="font-size:72px;opacity:.2;margin-bottom:16px">🔍</div>
    <h1 style="font-size:24px;font-weight:900;color:#0f172a">Not Found</h1>
    <p style="color:#64748b;margin-top:8px;line-height:1.6">
      We could not find a <strong>${escapeHtml(kind)}</strong> matching
      <code style="background:#f1f5f9;padding:2px 10px;border-radius:6px;
        font-size:13px">${escapeHtml(ref)}</code>
      in the national TSID registry.
    </p>
    <a href="#/search" class="btn btn-primary" style="margin-top:22px">← Back to Search</a>
  </div>
  ${Footer()}
  `;
}

export function initResultView() {
  initNavbar();
  initCardQRs();
}
