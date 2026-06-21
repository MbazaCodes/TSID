import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, fmtMoney, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard",        icon: "▣" },
  { href: "#/gov/students",  label: "Students Database",icon: "☰" },
  { href: "#/gov/schools",   label: "Create School",    icon: "✚" },
  { href: "#/gov/logs",      label: "Activity Logs",    icon: "⌷" },
];

export function GovDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const schools   = db.getSchools();
  const students  = db.getStudents();
  const apps      = db.getApplications();
  const payments  = db.getPayments();
  const logs      = db.getLogs();

  const pendingApps = apps.filter((a) => a.status === "pending");
  const collected   = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pending$    = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Region summary
  const regions = [...new Set(schools.map((sc) => sc.region))];
  const regionRows = regions.map((r) => {
    const rSchools  = schools.filter((sc) => sc.region === r);
    const rStudents = students.filter((st) => st.region === r);
    const rPaid     = payments.filter(
      (p) => rSchools.find((sc) => sc.code === p.schoolCode) && p.status === "paid"
    );
    const rTotal = rPaid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return `<tr>
      <td style="font-weight:700">${escapeHtml(r)}</td>
      <td>${rSchools.length}</td>
      <td>${rStudents.length}</td>
      <td>${rPaid.length}</td>
      <td style="font-weight:700;color:#059669">TZS ${rTotal.toLocaleString()}</td>
    </tr>`;
  }).join("");

  // School type breakdown
  const typeMap = {};
  schools.forEach((sc) => { typeMap[sc.type] = (typeMap[sc.type] || 0) + 1; });
  const typeBreakdown = Object.entries(typeMap).map(([t, n]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding:7px 0;border-bottom:1px solid #f0fdf4;font-size:13px">
      <span style="color:#374151;font-weight:600">${escapeHtml(t)}</span>
      <span style="font-weight:800;color:#059669;background:#d1fae5;
        padding:2px 10px;border-radius:99px;font-size:12px">${n}</span>
    </div>`).join("");

  // Recent 5 logs
  const recentLogs = logs.slice(0, 5);

  const html = `

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <h1>🏛️ National Dashboard</h1>
        <p>Government oversight of TSID across all regions of Tanzania. Welcome, <strong>${escapeHtml(s.name)}</strong>.</p>
      </div>
      <a href="#/gov/schools" class="btn btn-green">✚ Register New School</a>
    </div>

    <!-- Top stats -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px">
      ${[
        ["Total Schools",       schools.length,              "#1e40af","#eff6ff","#bfdbfe","🏫"],
        ["Total Students",      students.length,             "#065f46","#ecfdf5","#6ee7b7","🎓"],
        ["Pending Applications",pendingApps.length,          "#92400e","#fffbeb","#fcd34d","📋"],
        ["Revenue Collected",   "TZS "+collected.toLocaleString(), "#5b21b6","#f5f3ff","#c4b5fd","₵"],
      ].map(([label, val, tc, bg, bdr, icon]) => `
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:16px 18px;display:flex;align-items:center;gap:12px">
          <div style="font-size:26px;line-height:1">${icon}</div>
          <div>
            <div style="font-size:${String(val).length > 9 ? "15" : "22"}px;font-weight:900;color:${tc};line-height:1.1">${val}</div>
            <div style="font-size:11.5px;font-weight:600;color:${tc};opacity:.75;margin-top:3px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Secondary stats row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:26px">
      ${[
        ["Regions Covered",     regions.length,               "#0369a1","#f0f9ff","#bae6fd","🗺"],
        ["Approved Applications",apps.filter(a=>a.status==="approved").length,"#065f46","#ecfdf5","#6ee7b7","✅"],
        ["Pending Revenue",     "TZS "+pending$.toLocaleString(),"#92400e","#fffbeb","#fcd34d","⏳"],
      ].map(([label, val, tc, bg, bdr, icon]) => `
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:14px 18px;display:flex;align-items:center;gap:12px">
          <div style="font-size:22px;line-height:1">${icon}</div>
          <div>
            <div style="font-size:${String(val).length > 9 ? "14" : "20"}px;font-weight:900;color:${tc};line-height:1.1">${val}</div>
            <div style="font-size:11.5px;font-weight:600;color:${tc};opacity:.75;margin-top:2px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Schools list + Type breakdown -->
    <div style="display:grid;grid-template-columns:1fr 240px;gap:20px;margin-bottom:24px">

      <!-- All schools -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;
          padding:14px 20px;border-bottom:1px solid #f1f5f9">
          <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">Registered Schools</h3>
          <a href="#/gov/schools" class="btn btn-ghost btn-sm">Manage →</a>
        </div>
        <table class="tsid-table">
          <thead><tr><th>Code</th><th>School</th><th>Type</th><th>Region</th><th>Students</th><th>Status</th></tr></thead>
          <tbody>
            ${schools.map((sc) => {
              const cnt = students.filter((st) => st.schoolCode === sc.code).length;
              return `<tr>
                <td class="mono">${escapeHtml(sc.code)}</td>
                <td>
                  <div style="font-weight:700">${escapeHtml(sc.name)}</div>
                  <div style="font-size:11px;color:#64748b">${escapeHtml(sc.district)} · ${escapeHtml(sc.ward)}</div>
                </td>
                <td style="font-size:12px">${escapeHtml(sc.type)}</td>
                <td>${escapeHtml(sc.region)}</td>
                <td style="font-weight:800;color:#059669">${cnt}</td>
                <td><span class="badge green">${escapeHtml(sc.status || "active")}</span></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>

      <!-- School type breakdown -->
      <div style="background:#fff;border:1.5px solid #d1fae5;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#059669,#047857);padding:14px 16px">
          <div style="font-weight:800;font-size:13px;color:#fff">🏫 Schools by Type</div>
        </div>
        <div style="padding:12px 16px">${typeBreakdown}</div>
      </div>
    </div>

    <!-- Regional summary -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:24px">
      <div style="padding:14px 20px;border-bottom:1px solid #f1f5f9">
        <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">Regional Summary</h3>
      </div>
      <table class="tsid-table">
        <thead><tr><th>Region</th><th>Schools</th><th>Students</th><th>Paid Txns</th><th>Revenue</th></tr></thead>
        <tbody>${regionRows}</tbody>
      </table>
    </div>

    <!-- Recent activity log -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;
        padding:14px 20px;border-bottom:1px solid #f1f5f9">
        <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">Recent Activity</h3>
        <a href="#/gov/logs" class="btn btn-ghost btn-sm">Full Logs →</a>
      </div>
      ${recentLogs.length === 0
        ? `<div class="empty-state"><div class="ic">⌷</div><p>No activity yet.</p></div>`
        : `<table class="tsid-table">
            <thead><tr><th>Action</th><th>Message</th><th>By</th><th>Time</th></tr></thead>
            <tbody>
              ${recentLogs.map((l) => `
                <tr>
                  <td><span class="badge blue" style="font-size:10px">${escapeHtml(l.action)}</span></td>
                  <td style="font-size:12.5px">${escapeHtml(l.message)}</td>
                  <td style="font-size:12px;color:#64748b">${escapeHtml(l.by)}</td>
                  <td style="font-size:12px;color:#64748b">${fmtDate(l.at)}</td>
                </tr>`).join("")}
            </tbody>
          </table>`}
    </div>
  `;

  return Shell("Government", "#/gov/dashboard", LINKS, html);
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/gov"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
