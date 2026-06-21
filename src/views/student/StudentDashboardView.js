import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { MiniIDCard } from "../../components/IDCard.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/student/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/student/id", label: "My ID", icon: "▤" },
  { href: "#/student/certificates", label: "Certificates", icon: "★" },
  { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
  { href: "#/student/payments", label: "Payments", icon: "₵" },
];

export function StudentDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "student") return redirectLogin();
  const student = db.findStudent(s.ref);
  if (!student) return redirectLogin();

  const school = db.findSchool(student.schoolCode);
  const certs = db.certificatesForStudent(student.tsid);
  const letters = db.lettersForStudent(student.tsid);
  const payments = db.paymentsForStudent(student.tsid);
  const pendingPays = payments.filter((p) => p.status === "pending");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1> Welcome, ${escapeHtml(student.fullname.split(" ")[0])}</h1>
        <p>TSID: <span style="font-family:ui-monospace;font-weight:700">${escapeHtml(student.tsid)}</span> · ${escapeHtml(student.level || "")}</p>
      </div>
      <a href="#/student/id" class="btn btn-primary">View My ID →</a>
    </div>

    <div class="tsid-stat-grid">
      <div class="tsid-stat"><div class="icon blue">★</div><div><div class="label">Certificates</div><div class="value">${certs.length}</div></div></div>
      <div class="tsid-stat"><div class="icon yellow">✉</div><div><div class="label">Request Letters</div><div class="value">${letters.length}</div></div></div>
      <div class="tsid-stat"><div class="icon green">₵</div><div><div class="label">Payments Made</div><div class="value">${payments.filter(p=>p.status==="paid").length}</div></div></div>
      <div class="tsid-stat"><div class="icon red">!</div><div><div class="label">Pending Payments</div><div class="value">${pendingPays.length}</div></div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:flex-start">
      <div class="tsid-table-wrap">
        <div class="table-head"><h3>School &amp; Account Information</h3></div>
        <div style="padding:18px 20px">
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">School Name</span>
            <span class="v" style="font-weight:700">${escapeHtml(student.schoolName)}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">School Code</span>
            <span class="v" style="font-weight:700">${escapeHtml(student.schoolCode)}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">Region / District</span>
            <span class="v" style="font-weight:700">${escapeHtml(student.region)} / ${escapeHtml(student.district)}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">Ward</span>
            <span class="v" style="font-weight:700">${escapeHtml(student.ward)}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">School Contact</span>
            <span class="v" style="font-weight:700">${escapeHtml(school ? school.contact : student.schoolContact || "—")}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">Current Level</span>
            <span class="v" style="font-weight:700">${escapeHtml(student.level || "—")}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">Enrollment Date</span>
            <span class="v" style="font-weight:700">${fmtDate(student.enrollmentDate)}</span>
          </div>
          <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px">
            <span class="k" style="color:#64748b;font-weight:600">Parent / Guardian</span>
            <span class="v" style="font-weight:700">${escapeHtml(student.parentName)} (${escapeHtml(student.relationship || "—")})</span>
          </div>
        </div>
      </div>

      <div>
        ${MiniIDCard(student)}
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
          <a href="#/student/id" class="btn btn-primary">View Full ID Card</a>
          <a href="#/student/certificates" class="btn btn-outline">My Certificates</a>
          <a href="#/student/request-letter" class="btn btn-outline">Request Utambulisho</a>
        </div>
      </div>
    </div>

    ${
      student.remarks && student.remarks.length
        ? `<div class="tsid-table-wrap" style="margin-top:24px">
            <div class="table-head"><h3>Remarks from School</h3></div>
            <table class="tsid-table">
              <thead><tr><th>Remark</th><th>By</th><th>Date</th></tr></thead>
              <tbody>
                ${student.remarks
                  .map(
                    (r) => `<tr>
                      <td>${escapeHtml(r.text)}</td>
                      <td>${escapeHtml(r.by)}</td>
                      <td>${fmtDate(r.at)}</td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>`
        : ""
    }
  `;

  return Shell("Student/Parent", "#/student/dashboard", LINKS, html);
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/student"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
