import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/school/dashboard",      label: "Dashboard",       icon: "▣" },
  { href: "#/school/create-student", label: "Create Student",  icon: "✚" },
  { href: "#/school/students",       label: "Student Database",icon: "☰" },
  { href: "#/school/applications",   label: "Applications",    icon: "✓" },
  { href: "#/school/payments",       label: "Payments",        icon: "₵" },
  { href: "#/school/settings",       label: "School Settings", icon: "⚙" },
];

export function SchoolDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const students    = db.findStudentsBySchool(school.code);
  const apps        = db.applicationsForSchool(school.code);
  const payments    = db.paymentsForSchool(school.code);
  const pendingApps = apps.filter((a) => a.status === "pending");
  const paidPays    = payments.filter((p) => p.status === "paid");
  const pendingPays = payments.filter((p) => p.status === "pending");
  const collected   = paidPays.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const recent5     = students.slice(-5).reverse();

  // Level breakdown
  const levels = {};
  students.forEach((st) => {
    const lvl = st.level || "Unknown";
    levels[lvl] = (levels[lvl] || 0) + 1;
  });
  const levelRows = Object.entries(levels)
    .map(([lvl, cnt]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;
        padding:7px 0;border-bottom:1px solid #f0fdf4;font-size:13px">
        <span style="color:#374151;font-weight:600">${escapeHtml(lvl)}</span>
        <span style="font-weight:800;color:#059669;background:#d1fae5;
          padding:2px 10px;border-radius:99px;font-size:12px">${cnt}</span>
      </div>`)
    .join("") || `<p style="font-size:13px;color:#94a3b8;text-align:center;padding:14px 0">No students yet.</p>`;

  const html = `

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <h1>${escapeHtml(school.name)}</h1>
        <p>${escapeHtml(school.type)} · Code <strong>${escapeHtml(school.code)}</strong> · ${escapeHtml(school.region)}, ${escapeHtml(school.district)}</p>
      </div>
      <a href="#/school/create-student" class="btn btn-green">✚ Create New Student</a>
    </div>

    <!-- Stats -->
    <div class="rg-4" style="margin-bottom:22px">
      ${[
        ["Total Students",    students.length,     "#15702c","#dcfce7","#86efac","🎓"],
        ["Pending Apps",      pendingApps.length,  "#92400e","#fffbeb","#fcd34d","📋"],
        ["Collected (TZS)",   collected.toLocaleString(), "#065f46","#ecfdf5","#6ee7b7","₵"],
        ["Pending Payments",  pendingPays.length,  "#991b1b","#fef2f2","#fca5a5","⚠"],
      ].map(([label, val, tc, bg, bdr, icon]) => `
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:16px 18px;display:flex;align-items:center;gap:12px">
          <div style="font-size:26px;line-height:1">${icon}</div>
          <div>
            <div style="font-size:22px;font-weight:900;color:${tc};line-height:1">${val}</div>
            <div style="font-size:11.5px;font-weight:600;color:${tc};opacity:.75;margin-top:3px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Two-column: recent students + level breakdown -->
    <div class="rg-sidebar-sm" style="margin-bottom:24px">

      <!-- Recent students table -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;
          padding:14px 20px;border-bottom:1px solid #f1f5f9">
          <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">Recently Registered</h3>
          <a href="#/school/students" class="btn btn-ghost btn-sm">View all →</a>
        </div>
        ${recent5.length === 0
          ? `<div class="empty-state"><div class="ic">📭</div><p>No students yet.</p></div>`
          : `<table class="tsid-table">
              <thead><tr><th>TSID</th><th>Name</th><th>Level</th><th>Issued</th><th>Status</th></tr></thead>
              <tbody>
                ${recent5.map((st) => `
                  <tr>
                    <td class="mono">${escapeHtml(st.tsid)}</td>
                    <td style="font-weight:700">${escapeHtml(st.fullname)}</td>
                    <td>${escapeHtml(st.level || "—")}</td>
                    <td>${fmtDate(st.issueDate)}</td>
                    <td><span class="badge green">Active</span></td>
                  </tr>`).join("")}
              </tbody>
            </table>`}
      </div>

      <!-- Level breakdown -->
      <div style="background:#fff;border:1.5px solid #d1fae5;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#059669,#047857);padding:14px 16px">
          <div style="font-weight:800;font-size:13px;color:#fff">📊 Students by Level</div>
        </div>
        <div style="padding:12px 16px">${levelRows}</div>
      </div>
    </div>

    <!-- Pending applications alert -->
    ${pendingApps.length ? `
      <div style="background:#fff;border:1.5px solid #fde68a;border-radius:16px;overflow:hidden;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;
          padding:14px 20px;border-bottom:1px solid #fef9c3;
          background:linear-gradient(135deg,#fffbeb,#fef3c7)">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">⚠️</span>
            <div>
              <div style="font-weight:800;font-size:14px;color:#92400e">${pendingApps.length} Application${pendingApps.length > 1 ? "s" : ""} Awaiting Review</div>
              <div style="font-size:12px;color:#78350f">Review and approve or reject below.</div>
            </div>
          </div>
          <a href="#/school/applications" class="btn btn-sm" style="background:#d97706;color:#fff">Review All →</a>
        </div>
        <table class="tsid-table">
          <thead><tr><th>App ID</th><th>Name</th><th>Level</th><th>Submitted</th><th></th></tr></thead>
          <tbody>
            ${pendingApps.map((a) => `
              <tr>
                <td class="mono">${escapeHtml(a.id)}</td>
                <td style="font-weight:700">${escapeHtml(a.fullname)}</td>
                <td>${escapeHtml(a.level || "—")}</td>
                <td>${fmtDate(a.submittedAt)}</td>
                <td><a href="#/school/applications" class="btn btn-primary btn-sm">Review</a></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : ""}

    <!-- Quick actions -->
    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:16px 20px">
      <div style="font-weight:800;font-size:13px;color:#374151;margin-bottom:12px">⚡ Quick Actions</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a href="#/school/create-student" class="btn btn-green btn-sm">✚ New Student</a>
        <a href="#/school/students" class="btn btn-primary btn-sm">☰ Student DB</a>
        <a href="#/school/applications" class="btn btn-sm" style="background:#d97706;color:#fff">✓ Applications</a>
        <a href="#/school/payments" class="btn btn-ghost btn-sm">₵ Payments</a>
        <a href="#/school/settings" class="btn btn-ghost btn-sm">⚙ Settings</a>
      </div>
    </div>
  `;

  return Shell("School", "#/school/dashboard", LINKS, html);
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
