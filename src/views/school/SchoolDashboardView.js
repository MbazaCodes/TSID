import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/school/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/school/create-student", label: "Create Student", icon: "✚" },
  { href: "#/school/students", label: "Student Database", icon: "☰" },
  { href: "#/school/applications", label: "Applications", icon: "✓" },
  { href: "#/school/payments", label: "Payments", icon: "₵" },
  { href: "#/school/settings", label: "School Settings", icon: "⚙" },
];

export function SchoolDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const students = db.findStudentsBySchool(school.code);
  const apps = db.applicationsForSchool(school.code);
  const payments = db.paymentsForSchool(school.code);
  const pendingApps = apps.filter((a) => a.status === "pending");
  const pendingPays = payments.filter((p) => p.status === "pending");
  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const recent = students.slice(-5).reverse();

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>${escapeHtml(school.name)}</h1>
        <p>${escapeHtml(school.type)} · Code ${escapeHtml(school.code)} · ${escapeHtml(school.region)}, ${escapeHtml(school.district)}</p>
      </div>
      <a href="#/school/create-student" class="btn btn-green">+ Create New Student</a>
    </div>

    <div class="tsid-stat-grid">
      <div class="tsid-stat">
        <div class="icon blue">☰</div>
        <div>
          <div class="label">Total Students</div>
          <div class="value">${students.length}</div>
        </div>
      </div>
      <div class="tsid-stat">
        <div class="icon yellow">✓</div>
        <div>
          <div class="label">Pending Applications</div>
          <div class="value">${pendingApps.length}</div>
        </div>
      </div>
      <div class="tsid-stat">
        <div class="icon green">₵</div>
        <div>
          <div class="label">Collected (TZS)</div>
          <div class="value">${totalCollected.toLocaleString()}</div>
        </div>
      </div>
      <div class="tsid-stat">
        <div class="icon red">!</div>
        <div>
          <div class="label">Pending Payments</div>
          <div class="value">${pendingPays.length}</div>
        </div>
      </div>
    </div>

    <div class="tsid-table-wrap" style="margin-bottom:24px">
      <div class="table-head">
        <h3>Recently Registered Students</h3>
        <a href="#/school/students" class="btn btn-ghost btn-sm">View all →</a>
      </div>
      ${
        recent.length === 0
          ? emptyState("No students yet.")
          : `<table class="tsid-table">
              <thead><tr>
                <th>TSID</th><th>Name</th><th>Level</th><th>Issued</th><th>Status</th>
              </tr></thead>
              <tbody>
                ${recent
                  .map(
                    (st) => `<tr>
                      <td class="mono">${escapeHtml(st.tsid)}</td>
                      <td>${escapeHtml(st.fullname)}</td>
                      <td>${escapeHtml(st.level || "—")}</td>
                      <td>${fmtDate(st.issueDate)}</td>
                      <td><span class="badge green">Active</span></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
      }
    </div>

    ${
      pendingApps.length
        ? `<div class="tsid-table-wrap">
            <div class="table-head">
              <h3>Pending Applications</h3>
              <a href="#/school/applications" class="btn btn-ghost btn-sm">Review →</a>
            </div>
            <table class="tsid-table">
              <thead><tr><th>App ID</th><th>Name</th><th>Level</th><th>Submitted</th><th></th></tr></thead>
              <tbody>
                ${pendingApps
                  .map(
                    (a) => `<tr>
                      <td class="mono">${escapeHtml(a.id)}</td>
                      <td>${escapeHtml(a.fullname)}</td>
                      <td>${escapeHtml(a.level || "—")}</td>
                      <td>${fmtDate(a.submittedAt)}</td>
                      <td><a href="#/school/applications" class="btn btn-primary btn-sm">Review</a></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>`
        : ""
    }
  `;

  return Shell("School", "#/school/dashboard", LINKS, html);
}

function emptyState(msg) {
  return `<div class="empty-state"><div class="ic">📭</div><p>${escapeHtml(msg)}</p></div>`;
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
