// ============================================================================
//  GovLogsView — system audit trail with filter, date range, role filter
// ============================================================================
import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDateTime, fmtDate, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard",        icon: "▣" },
  { href: "#/gov/students",  label: "Students Database",icon: "☰" },
  { href: "#/gov/schools",   label: "Create School",    icon: "✚" },
  { href: "#/gov/logs",      label: "Activity Logs",    icon: "⌷" },
];

const ACTION_META = {
  "auth:login":           { label: "Login",              color: "blue",   icon: "🔑" },
  "auth:logout":          { label: "Logout",             color: "gray",   icon: "🚪" },
  "student:create":       { label: "Student Created",    color: "green",  icon: "✚" },
  "application:approve":  { label: "App Approved",       color: "green",  icon: "✅" },
  "application:reject":   { label: "App Rejected",       color: "red",    icon: "❌" },
  "payment:record":       { label: "Payment Recorded",   color: "blue",   icon: "₵" },
  "payment:markPaid":     { label: "Payment Paid",       color: "green",  icon: "✓" },
  "school:create":        { label: "School Registered",  color: "blue",   icon: "🏫" },
  "school:update":        { label: "School Updated",     color: "yellow", icon: "✎" },
  "letter:request":       { label: "Letter Requested",   color: "blue",   icon: "✉" },
  "letter:download":      { label: "Letter Downloaded",  color: "green",  icon: "⬇" },
  "letter:approve":       { label: "Letter Approved",    color: "green",  icon: "✓" },
  "system:seed":          { label: "System",             color: "gray",   icon: "⚙" },
};

function getMeta(action) {
  return ACTION_META[action] || { label: action, color: "gray", icon: "•" };
}

export function GovLogsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const logs  = db.getLogs();
  const roles  = [...new Set(logs.map((l) => l.role).filter(Boolean))];

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((l) => l.at && l.at.startsWith(todayStr));
  const authLogs  = logs.filter((l) => l.action?.startsWith("auth:"));
  const actionLogs= logs.filter((l) => !l.action?.startsWith("auth:") && l.action !== "system:seed");

  const rows = logs.map((l) => {
    const meta = getMeta(l.action);
    return `<tr data-action="${escapeHtml(l.action)}" data-role="${escapeHtml(l.role || "")}" data-msg="${escapeHtml(l.message.toLowerCase())}">
      <td>
        <span class="badge ${meta.color}" style="white-space:nowrap">
          ${meta.icon} ${escapeHtml(meta.label)}
        </span>
      </td>
      <td style="font-size:12.5px;max-width:300px;white-space:normal">${escapeHtml(l.message)}</td>
      <td style="font-weight:600;font-size:12.5px">${escapeHtml(l.by)}</td>
      <td>
        ${l.role
          ? `<span class="badge ${l.role === "gov" ? "blue" : l.role === "school" ? "green" : l.role === "student" ? "yellow" : "gray"}">${escapeHtml(l.role)}</span>`
          : `<span style="color:#94a3b8;font-size:12px">—</span>`}
      </td>
      <td style="font-size:12px;color:#64748b;white-space:nowrap">${fmtDateTime(l.at)}</td>
      <td class="mono" style="font-size:10.5px;color:#94a3b8">${escapeHtml(l.id)}</td>
    </tr>`;
  }).join("");

  const html = `

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <h1>⌷ System Activity Logs</h1>
        <p>Complete audit trail of all TSID platform actions. Most recent first.</p>
      </div>
      <button id="clearLogsBtn" class="btn btn-ghost btn-sm" style="color:#ef4444">
        🗑 Clear All Logs
      </button>
    </div>

    <!-- Stats row -->
    <div style="class="rg-4" style="margin-bottom:22px">
      ${[
        ["Total Logs",       logs.length,       "#1e40af","#eff6ff","#bfdbfe","📋"],
        ["Today's Activity", todayLogs.length,  "#065f46","#ecfdf5","#6ee7b7","📅"],
        ["Auth Events",      authLogs.length,   "#92400e","#fffbeb","#fcd34d","🔑"],
        ["System Actions",   actionLogs.length, "#5b21b6","#f5f3ff","#c4b5fd","⚡"],
      ].map(([label, val, tc, bg, bdr, icon]) => `
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:14px 16px;display:flex;align-items:center;gap:10px">
          <div style="font-size:22px">${icon}</div>
          <div>
            <div style="font-size:22px;font-weight:900;color:${tc};line-height:1">${val}</div>
            <div style="font-size:11.5px;font-weight:600;color:${tc};opacity:.75;margin-top:2px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Filter bar -->
    <div style="
      background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
      padding:14px 16px;margin-bottom:20px;
      display:flex;gap:10px;align-items:center;flex-wrap:wrap">

      <!-- Text search -->
      <div style="flex:1;min-width:200px;display:flex;align-items:center;gap:8px;
        background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px">
        <span style="color:#94a3b8">🔍</span>
        <input id="logSearch" placeholder="Search message or user…" style="
          border:none;background:transparent;padding:9px 4px;
          font-size:13px;width:100%;font-family:inherit;outline:none">
      </div>

      <!-- Action filter -->
      <select id="actionFilter" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:13px;background:#f8fafc;font-family:inherit;min-width:160px">
        <option value="">All actions</option>
        ${Object.entries(ACTION_META).map(([k, v]) =>
          `<option value="${escapeHtml(k)}">${v.icon} ${escapeHtml(v.label)}</option>`
        ).join("")}
      </select>

      <!-- Role filter -->
      <select id="roleFilter" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:13px;background:#f8fafc;font-family:inherit">
        <option value="">All roles</option>
        ${roles.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("")}
      </select>

      <div id="logCount" style="font-size:12.5px;color:#64748b;font-weight:600;white-space:nowrap">
        ${logs.length} entries
      </div>
    </div>

    <!-- Logs table -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid #f1f5f9">
        <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">
          Activity Log
          <span style="font-size:12px;font-weight:600;color:#64748b">(${logs.length} total — capped at 500)</span>
        </h3>
      </div>
      ${logs.length === 0
        ? `<div class="empty-state"><div class="ic">⌷</div><p>No activity recorded yet.</p></div>`
        : `<div style="overflow-x:auto">
            <table class="tsid-table" id="logsTable">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Message</th>
                  <th>By</th>
                  <th>Role</th>
                  <th>When</th>
                  <th style="width:100px">Log ID</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div id="logsEmpty" style="display:none">
            <div class="empty-state"><div class="ic">🔍</div><p>No logs match your filters.</p></div>
          </div>`}
    </div>

    <!-- Confirm clear modal -->
    <div id="clearModal" style="
      display:none;position:fixed;inset:0;z-index:400;
      background:rgba(15,23,42,.5);backdrop-filter:blur(3px);
      align-items:center;justify-content:center;padding:16px">
      <div style="
        background:#fff;border-radius:18px;padding:28px;
        width:100%;max-width:400px;
        box-shadow:0 24px 60px rgba(0,0,0,.2);text-align:center">
        <div style="font-size:48px;margin-bottom:12px">⚠️</div>
        <h3 style="font-size:18px;font-weight:800;color:#991b1b;margin-bottom:8px">Clear All Logs?</h3>
        <p style="font-size:13px;color:#64748b;margin-bottom:22px">
          This will permanently delete all ${logs.length} log entries. This action cannot be undone.
        </p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-ghost" id="clearCancel">Cancel</button>
          <button class="btn btn-red" id="clearConfirm">🗑 Delete All Logs</button>
        </div>
      </div>
    </div>
  `;

  return Shell("Government", "#/gov/logs", LINKS, html);
}

export function initGovLogs() {
  const searchEl   = document.getElementById("logSearch");
  const actionSel  = document.getElementById("actionFilter");
  const roleSel    = document.getElementById("roleFilter");
  const tbody      = document.querySelector("#logsTable tbody");
  const countEl    = document.getElementById("logCount");
  const emptyEl    = document.getElementById("logsEmpty");
  const tableEl    = document.getElementById("logsTable");

  // ── Live filter ─────────────────────────────────────────────────────────
  function applyFilters() {
    if (!tbody) return;
    const q      = (searchEl?.value || "").toLowerCase().trim();
    const action = actionSel?.value || "";
    const role   = roleSel?.value   || "";
    let visible  = 0;

    tbody.querySelectorAll("tr").forEach((row) => {
      const rowAction = row.dataset.action || "";
      const rowRole   = row.dataset.role   || "";
      const rowMsg    = row.dataset.msg    || "";
      const text      = row.textContent.toLowerCase();

      const matchQ = !q      || text.includes(q)      || rowMsg.includes(q);
      const matchA = !action || rowAction === action;
      const matchR = !role   || rowRole   === role;

      const show = matchQ && matchA && matchR;
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (countEl) countEl.textContent = `${visible} entr${visible !== 1 ? "ies" : "y"}`;
    if (emptyEl && tableEl) {
      const hasRows = visible > 0;
      emptyEl.style.display             = hasRows ? "none" : "";
      tableEl.style.display             = hasRows ? ""     : "none";
    }
  }

  searchEl?.addEventListener("input",  applyFilters);
  actionSel?.addEventListener("change",applyFilters);
  roleSel?.addEventListener("change",  applyFilters);

  // ── Clear logs ──────────────────────────────────────────────────────────
  const clearModal  = document.getElementById("clearModal");
  const clearLogsBtn= document.getElementById("clearLogsBtn");

  clearLogsBtn?.addEventListener("click", () => {
    clearModal.style.display = "flex";
  });

  document.getElementById("clearCancel")?.addEventListener("click", () => {
    clearModal.style.display = "none";
  });

  document.getElementById("clearConfirm")?.addEventListener("click", () => {
    // Write empty logs array
    localStorage.setItem("tsid:logs", JSON.stringify([]));
    clearModal.style.display = "none";
    setTimeout(() => window.location.reload(), 300);
  });

  clearModal?.addEventListener("click", (e) => {
    if (e.target === clearModal) clearModal.style.display = "none";
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/gov"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
