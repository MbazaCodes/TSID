import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDateTime, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/gov/students", label: "Students Database", icon: "☰" },
  { href: "#/gov/schools", label: "Create School", icon: "✚" },
  { href: "#/gov/logs", label: "Logs", icon: "⌷" },
];

const ACTION_META = {
  "auth:login": { label: "Login", color: "blue", icon: "🔑" },
  "auth:logout": { label: "Logout", color: "gray", icon: "🚪" },
  "student:create": { label: "Student Created", color: "green", icon: "✚" },
  "application:approve": { label: "Application Approved", color: "green", icon: "✓" },
  "application:reject": { label: "Application Rejected", color: "red", icon: "✗" },
  "payment:record": { label: "Payment Recorded", color: "blue", icon: "₵" },
  "payment:markPaid": { label: "Payment Marked Paid", color: "green", icon: "✓" },
  "school:create": { label: "School Registered", color: "blue", icon: "🏫" },
  "school:update": { label: "School Updated", color: "yellow", icon: "✎" },
  "letter:request": { label: "Letter Requested", color: "blue", icon: "✉" },
  "letter:approve": { label: "Letter Approved", color: "green", icon: "✓" },
  "system:seed": { label: "System", color: "gray", icon: "⚙" },
};

export function GovLogsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const logs = db.getLogs();

  const rows = logs
    .map((l) => {
      const meta = ACTION_META[l.action] || { label: l.action, color: "gray", icon: "•" };
      return `<tr>
        <td><span class="badge ${meta.color}">${meta.icon} ${escapeHtml(meta.label)}</span></td>
        <td>${escapeHtml(l.message)}</td>
        <td>${escapeHtml(l.by)}</td>
        <td>${escapeHtml(l.role || "—")}</td>
        <td>${fmtDateTime(l.at)}</td>
        <td class="mono" style="font-size:11px;color:#64748b">${escapeHtml(l.id)}</td>
      </tr>`;
    })
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>System Activity Logs</h1>
        <p>Audit trail of all actions across the TSID platform (most recent first).</p>
      </div>
    </div>

    <div class="search-bar">
      <input id="searchInput" placeholder="Filter logs by action, message, or user...">
      <select id="actionFilter">
        <option value="">All actions</option>
        ${Object.keys(ACTION_META)
          .map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(ACTION_META[k].label)}</option>`)
          .join("")}
      </select>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>Recent Activity (${logs.length})</h3>
      </div>
      ${
        logs.length === 0
          ? `<div class="empty-state"><div class="ic">⌷</div><p>No activity recorded yet.</p></div>`
          : `<table class="tsid-table" id="logsTable">
              <thead><tr><th>Action</th><th>Message</th><th>By</th><th>Role</th><th>When</th><th>Log ID</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>
  `;

  return Shell("Government", "#/gov/logs", LINKS, html);
}

export function initGovLogs() {
  const search = document.getElementById("searchInput");
  const actionSel = document.getElementById("actionFilter");
  const table = document.getElementById("logsTable");
  if (!table) return;

  function filter() {
    const q = (search?.value || "").toLowerCase();
    const a = actionSel?.value || "";
    table.querySelectorAll("tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();
      const showQ = !q || text.includes(q);
      // For action filter, match against the badge label (in the first cell)
      const firstCell = row.querySelector("td").textContent.toLowerCase();
      const meta = a ? ACTION_META[a] : null;
      const showA = !a || (meta && firstCell.includes(meta.label.toLowerCase()));
      row.style.display = showQ && showA ? "" : "none";
    });
  }
  search?.addEventListener("input", filter);
  actionSel?.addEventListener("change", filter);
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/gov"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
