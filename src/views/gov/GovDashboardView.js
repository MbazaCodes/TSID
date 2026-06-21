import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/gov/students", label: "Students Database", icon: "☰" },
  { href: "#/gov/schools", label: "Create School", icon: "✚" },
  { href: "#/gov/logs", label: "Logs", icon: "⌷" },
];

export function GovDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const schools = db.getSchools();
  const students = db.getStudents();
  const apps = db.getApplications();
  const payments = db.getPayments();
  const pendingApps = apps.filter((a) => a.status === "pending");
  const collected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const regions = [...new Set(schools.map((x) => x.region))];

  // Per-region stats
  const byRegion = regions
    .map((r) => {
      const schoolsInR = schools.filter((s) => s.region === r);
      const studentsInR = students.filter((s) => s.region === r);
      return `<tr>
        <td>${escapeHtml(r)}</td>
        <td>${schoolsInR.length}</td>
        <td>${studentsInR.length}</td>
        <td>${payments.filter(p => schoolsInR.find(s => s.code === p.schoolCode) && p.status === "paid").length}</td>
      </tr>`;
    })
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>National Dashboard</h1>
        <p>Government oversight of TSID across all regions of Tanzania.</p>
      </div>
      <a href="#/gov/schools" class="btn btn-green">+ Register New School</a>
    </div>

    <div class="tsid-stat-grid">
      <div class="tsid-stat"><div class="icon blue">🏫</div><div><div class="label">Total Schools</div><div class="value">${schools.length}</div></div></div>
      <div class="tsid-stat"><div class="icon green">🎓</div><div><div class="label">Total Students</div><div class="value">${students.length}</div></div></div>
      <div class="tsid-stat"><div class="icon yellow">✓</div><div><div class="label">Pending Applications</div><div class="value">${pendingApps.length}</div></div></div>
      <div class="tsid-stat"><div class="icon green">₵</div><div><div class="label">Collected (TZS)</div><div class="value">${collected.toLocaleString()}</div></div></div>
    </div>

    <div class="tsid-table-wrap" style="margin-bottom:24px">
      <div class="table-head"><h3>Registered Schools</h3><a href="#/gov/schools" class="btn btn-ghost btn-sm">Manage →</a></div>
      <table class="tsid-table">
        <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Region</th><th>Contact</th><th>Students</th><th>Status</th></tr></thead>
        <tbody>
          ${schools
            .map((sc) => {
              const count = students.filter((st) => st.schoolCode === sc.code).length;
              return `<tr>
                <td class="mono">${escapeHtml(sc.code)}</td>
                <td><div style="font-weight:700">${escapeHtml(sc.name)}</div><div style="font-size:11px;color:#64748b">${escapeHtml(sc.district)} · ${escapeHtml(sc.ward)}</div></td>
                <td>${escapeHtml(sc.type)}</td>
                <td>${escapeHtml(sc.region)}</td>
                <td>${escapeHtml(sc.contact)}</td>
                <td>${count}</td>
                <td><span class="badge green">${escapeHtml(sc.status || "active")}</span></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head"><h3>Regional Summary</h3></div>
      <table class="tsid-table">
        <thead><tr><th>Region</th><th>Schools</th><th>Students</th><th>Paid Payments</th></tr></thead>
        <tbody>${byRegion}</tbody>
      </table>
    </div>
  `;

  return Shell("Government", "#/gov/dashboard", LINKS, html);
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/gov"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
