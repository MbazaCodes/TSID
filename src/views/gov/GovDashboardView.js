import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard",        icon: "▣" },
  { href: "#/gov/students",  label: "Students",         icon: "🎓" },
  { href: "#/gov/schools",   label: "Schools",          icon: "🏫" },
  { href: "#/gov/logs",      label: "Activity Logs",    icon: "📋" },
];

export function GovDashboardView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const schools  = db.getSchools();
  const students = db.getStudents();
  const apps     = db.getApplications();
  const payments = db.getPayments();
  const logs     = db.getLogs();

  const pendingApps = apps.filter(a => a.status === "pending");
  const paidPays    = payments.filter(p => p.status === "paid");
  const collected   = paidPays.reduce((s,p) => s + Number(p.amount||0), 0);
  const pending$    = payments.filter(p=>p.status==="pending").reduce((s,p)=>s+Number(p.amount||0),0);
  const regions     = [...new Set(schools.map(sc => sc.region))];

  // Per-region breakdown
  const regionData = regions.map(r => {
    const rSc  = schools.filter(sc => sc.region === r);
    const rSt  = students.filter(st => st.region === r);
    const rRev = payments.filter(p => rSc.find(sc=>sc.code===p.schoolCode) && p.status==="paid")
                         .reduce((s,p)=>s+Number(p.amount||0),0);
    return { region:r, schools:rSc.length, students:rSt.length, revenue:rRev };
  });

  // School type counts
  const typeMap = {};
  schools.forEach(sc => { typeMap[sc.type] = (typeMap[sc.type]||0)+1; });

  const recentLogs = logs.slice(0, 6);

  const LOG_COLORS = {
    "auth:login":"#059669","auth:logout":"#94a3b8","student:create":"#1e40af",
    "application:approve":"#059669","application:reject":"#dc2626",
    "school:create":"#7c3aed","letter:request":"#d97706","letter:download":"#059669",
    "system:seed":"#94a3b8","payment:markPaid":"#059669"
  };
  const LOG_ICONS = {
    "auth:login":"🔑","auth:logout":"🚪","student:create":"🎓",
    "application:approve":"✅","application:reject":"❌",
    "school:create":"🏫","letter:request":"✉","letter:download":"⬇",
    "system:seed":"⚙","payment:markPaid":"₵"
  };

  const html = `
    <!-- Welcome banner -->
    <div style="
      background:linear-gradient(135deg,#003366 0%,#059669 100%);
      border-radius:18px;padding:22px 24px;margin-bottom:22px;
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:11px;font-weight:700;color:#a7f3d0;
          text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px">
          Government Control Panel
        </div>
        <div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:2px">
          National Dashboard
        </div>
        <div style="font-size:13px;color:#a7f3d0">
          Welcome, <strong style="color:#fff">${escapeHtml(s.name)}</strong>
          · Tanzania Student Identification System
        </div>
      </div>
      <a href="#/gov/schools" style="
        background:#fff;color:#003366;text-decoration:none;
        padding:11px 20px;border-radius:12px;font-size:13px;font-weight:800;
        display:flex;align-items:center;gap:6px;white-space:nowrap;
        box-shadow:0 4px 14px rgba(0,0,0,.15);flex-shrink:0">
        ✚ Register School
      </a>
    </div>

    <!-- Primary stats: 2×2 on mobile, 4-col on desktop -->
    <div class="rg-4" style="margin-bottom:16px">
      ${[
        ["Total Schools",    schools.length,                "#003366","#eff6ff","#bfdbfe","🏫"],
        ["Total Students",   students.length,               "#065f46","#ecfdf5","#6ee7b7","🎓"],
        ["Pending Apps",     pendingApps.length,            "#92400e","#fffbeb","#fcd34d","📋"],
        ["Revenue (TZS)",    collected.toLocaleString(),    "#5b21b6","#f5f3ff","#c4b5fd","₵"],
      ].map(([label,val,tc,bg,bdr,icon]) => `
        <div style="
          background:${bg};border:1.5px solid ${bdr};border-radius:16px;
          padding:16px;position:relative;overflow:hidden">
          <div style="font-size:28px;margin-bottom:8px">${icon}</div>
          <div style="font-size:24px;font-weight:900;color:${tc};line-height:1;margin-bottom:4px">
            ${val}
          </div>
          <div style="font-size:11.5px;font-weight:700;color:${tc};opacity:.7">
            ${label}
          </div>
        </div>`).join("")}
    </div>

    <!-- Secondary stats: 3-col -->
    <div class="rg-3" style="margin-bottom:22px">
      ${[
        ["Regions",          regions.length,                "#0369a1","#f0f9ff","#bae6fd","🗺️"],
        ["Apps Approved",    apps.filter(a=>a.status==="approved").length,"#065f46","#ecfdf5","#6ee7b7","✅"],
        ["Pending Revenue",  "TZS "+pending$.toLocaleString(),"#92400e","#fffbeb","#fcd34d","⏳"],
      ].map(([label,val,tc,bg,bdr,icon]) => `
        <div style="
          background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:14px 16px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px;flex-shrink:0">${icon}</div>
          <div>
            <div style="font-size:18px;font-weight:900;color:${tc};line-height:1">${val}</div>
            <div style="font-size:11px;font-weight:700;color:${tc};opacity:.7;margin-top:2px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Schools table + type breakdown -->
    <div class="rg-sidebar-sm" style="margin-bottom:20px">

      <!-- Schools list -->
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="
          padding:14px 18px;border-bottom:1px solid #f1f5f9;
          display:flex;align-items:center;justify-content:space-between">
          <div style="font-weight:800;font-size:14px;color:#0f172a">
            🏫 Registered Schools
          </div>
          <a href="#/gov/schools" class="btn btn-ghost btn-sm">Manage →</a>
        </div>
        <div style="overflow-x:auto">
          <table class="tsid-table">
            <thead>
              <tr>
                <th>Code</th><th>School</th><th>Region</th><th>Students</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${schools.map(sc => {
                const cnt = students.filter(st=>st.schoolCode===sc.code).length;
                return `<tr>
                  <td class="mono" style="font-size:11px">${escapeHtml(sc.code)}</td>
                  <td>
                    <div style="font-weight:700;font-size:13px">${escapeHtml(sc.name)}</div>
                    <div style="font-size:11px;color:#64748b">${escapeHtml(sc.type)}</div>
                  </td>
                  <td style="font-size:12.5px">${escapeHtml(sc.region)}</td>
                  <td>
                    <span style="
                      background:#ecfdf5;color:#065f46;font-size:12px;
                      font-weight:800;padding:3px 10px;border-radius:99px">
                      ${cnt}
                    </span>
                  </td>
                  <td><span class="badge green">Active</span></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right column: type breakdown + quick actions -->
      <div style="display:flex;flex-direction:column;gap:14px">

        <!-- School types -->
        <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
          <div style="
            background:linear-gradient(135deg,#003366,#1e40af);
            padding:13px 16px">
            <div style="font-weight:800;font-size:13px;color:#fff">🏫 Schools by Type</div>
          </div>
          <div style="padding:14px 16px">
            ${Object.entries(typeMap).map(([type,count]) => {
              const pct = schools.length ? Math.round((count/schools.length)*100) : 0;
              return `
                <div style="margin-bottom:12px">
                  <div style="display:flex;justify-content:space-between;
                    font-size:12.5px;font-weight:600;margin-bottom:4px">
                    <span style="color:#374151">${escapeHtml(type)}</span>
                    <span style="color:#003366;font-weight:800">${count}</span>
                  </div>
                  <div style="background:#f1f5f9;border-radius:99px;height:6px;overflow:hidden">
                    <div style="background:linear-gradient(90deg,#003366,#059669);
                      height:100%;width:${pct}%;border-radius:99px"></div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>

        <!-- Quick actions -->
        <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:16px">
          <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:12px">
            ⚡ Quick Actions
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <a href="#/gov/schools" style="
              display:flex;align-items:center;gap:10px;padding:11px 14px;
              background:linear-gradient(135deg,#059669,#047857);
              border-radius:11px;text-decoration:none;color:#fff;
              font-weight:700;font-size:13px">
              ✚ Register New School
            </a>
            <a href="#/gov/students" style="
              display:flex;align-items:center;gap:10px;padding:11px 14px;
              background:#f8fafc;border:1.5px solid #e2e8f0;
              border-radius:11px;text-decoration:none;color:#374151;
              font-weight:700;font-size:13px">
              🎓 View All Students
            </a>
            <a href="#/gov/logs" style="
              display:flex;align-items:center;gap:10px;padding:11px 14px;
              background:#f8fafc;border:1.5px solid #e2e8f0;
              border-radius:11px;text-decoration:none;color:#374151;
              font-weight:700;font-size:13px">
              📋 Activity Logs
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Regional breakdown -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;
      overflow:hidden;margin-bottom:20px">
      <div style="padding:14px 18px;border-bottom:1px solid #f1f5f9">
        <div style="font-weight:800;font-size:14px;color:#0f172a">🗺️ Regional Breakdown</div>
      </div>
      <div style="overflow-x:auto">
        <table class="tsid-table">
          <thead>
            <tr><th>Region</th><th>Schools</th><th>Students</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${regionData.map(r => `
              <tr>
                <td style="font-weight:700">${escapeHtml(r.region)}</td>
                <td>${r.schools}</td>
                <td>${r.students}</td>
                <td style="font-weight:700;color:#059669;white-space:nowrap">
                  TZS ${r.revenue.toLocaleString()}
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent activity -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="
        padding:14px 18px;border-bottom:1px solid #f1f5f9;
        display:flex;align-items:center;justify-content:space-between">
        <div style="font-weight:800;font-size:14px;color:#0f172a">📋 Recent Activity</div>
        <a href="#/gov/logs" class="btn btn-ghost btn-sm">See all →</a>
      </div>
      ${recentLogs.length === 0
        ? `<div class="empty-state"><div class="ic">📋</div><p>No activity yet.</p></div>`
        : `<div style="padding:8px 0">
            ${recentLogs.map(l => `
              <div style="
                display:flex;align-items:flex-start;gap:12px;
                padding:10px 18px;border-bottom:1px solid #f8fafc">
                <div style="
                  width:32px;height:32px;border-radius:8px;flex-shrink:0;
                  background:${LOG_COLORS[l.action]||"#94a3b8"}22;
                  display:flex;align-items:center;justify-content:center;
                  font-size:14px">
                  ${LOG_ICONS[l.action]||"•"}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:12.5px;font-weight:600;color:#0f172a;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${escapeHtml(l.message)}
                  </div>
                  <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                    ${escapeHtml(l.by)} · ${fmtDate(l.at)}
                  </div>
                </div>
                <div style="
                  font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px;
                  background:${LOG_COLORS[l.action]||"#94a3b8"}22;
                  color:${LOG_COLORS[l.action]||"#64748b"};
                  flex-shrink:0;white-space:nowrap">
                  ${escapeHtml(l.action.split(":")[1]||l.action)}
                </div>
              </div>`).join("")}
          </div>`}
    </div>
  `;

  return Shell("Government", "#/gov/dashboard", LINKS, html);
}

function redirectLogin() {
  setTimeout(() => window.location.hash = "#/login/gov", 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting…</p></div>`;
}
