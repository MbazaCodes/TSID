import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDateTime, escapeHtml } from "../../lib/util.js";
import { supabase } from "../../store/supabase.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard",     icon: "▣" },
  { href: "#/gov/students",  label: "Students",      icon: "🎓" },
  { href: "#/gov/schools",   label: "Schools",       icon: "🏫" },
  { href: "#/gov/logs",      label: "Activity Logs", icon: "📋" },
];

const ACTION_META = {
  "auth:login":           { label: "Login",             color: "#1e40af", bg: "#eff6ff", icon: "🔑" },
  "auth:logout":          { label: "Logout",            color: "#64748b", bg: "#f1f5f9", icon: "🚪" },
  "student:create":       { label: "Student Created",   color: "#065f46", bg: "#ecfdf5", icon: "🎓" },
  "application:approve":  { label: "App Approved",      color: "#065f46", bg: "#ecfdf5", icon: "✅" },
  "application:reject":   { label: "App Rejected",      color: "#991b1b", bg: "#fef2f2", icon: "❌" },
  "payment:markPaid":     { label: "Payment Paid",      color: "#065f46", bg: "#ecfdf5", icon: "₵" },
  "school:create":        { label: "School Registered", color: "#5b21b6", bg: "#f5f3ff", icon: "🏫" },
  "school:update":        { label: "School Updated",    color: "#92400e", bg: "#fffbeb", icon: "✎" },
  "letter:request":       { label: "Letter Requested",  color: "#92400e", bg: "#fffbeb", icon: "✉" },
  "letter:download":      { label: "Letter Downloaded", color: "#065f46", bg: "#ecfdf5", icon: "⬇" },
  "system:seed":          { label: "System Init",       color: "#64748b", bg: "#f1f5f9", icon: "⚙" },
};

function getMeta(action) {
  return ACTION_META[action] || { label: action, color: "#64748b", bg: "#f1f5f9", icon: "•" };
}

export function GovLogsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const logs     = db.getLogs();
  const today    = new Date().toISOString().slice(0,10);
  const todayN   = logs.filter(l => l.at?.startsWith(today)).length;
  const authN    = logs.filter(l => l.action?.startsWith("auth:")).length;
  const actionN  = logs.filter(l => !l.action?.startsWith("auth:") && l.action!=="system:seed").length;
  const roles    = [...new Set(logs.map(l=>l.role).filter(Boolean))];

  const html = `
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;
      flex-wrap:wrap;gap:12px;margin-bottom:20px">
      <div>
        <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin-bottom:4px">
          📋 System Activity Logs
        </h1>
        <p style="font-size:13px;color:#64748b">
          Audit trail of all TSID platform actions — most recent first.
        </p>
      </div>
      <button id="clearLogsBtn" style="
        padding:9px 16px;border-radius:10px;border:1.5px solid #fca5a5;
        background:#fef2f2;color:#dc2626;font-size:13px;font-weight:700;cursor:pointer">
        🗑 Clear Logs
      </button>
    </div>

    <!-- Stats -->
    <div class="rg-4" style="margin-bottom:20px">
      ${[
        ["Total Logs",     logs.length,  "#1e40af","#eff6ff","#bfdbfe","📋"],
        ["Today",          todayN,       "#065f46","#ecfdf5","#6ee7b7","📅"],
        ["Auth Events",    authN,        "#92400e","#fffbeb","#fcd34d","🔑"],
        ["System Actions", actionN,      "#5b21b6","#f5f3ff","#c4b5fd","⚡"],
      ].map(([label,val,tc,bg,bdr,icon])=>`
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;padding:14px 16px">
          <div style="font-size:22px;margin-bottom:6px">${icon}</div>
          <div style="font-size:22px;font-weight:900;color:${tc};line-height:1">${val}</div>
          <div style="font-size:11px;font-weight:700;color:${tc};opacity:.7;margin-top:3px">${label}</div>
        </div>`).join("")}
    </div>

    <!-- Filter bar -->
    <div style="
      background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
      padding:12px 14px;margin-bottom:16px;
      display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div style="flex:1;min-width:180px;display:flex;align-items:center;gap:8px;
        background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px">
        <span style="color:#94a3b8">🔍</span>
        <input id="logSearch" placeholder="Search message or user…" style="
          border:none;background:transparent;padding:9px 4px;
          font-size:13px;width:100%;font-family:inherit;outline:none">
      </div>
      <select id="actionFilter" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:12.5px;background:#f8fafc;font-family:inherit">
        <option value="">All actions</option>
        ${Object.entries(ACTION_META).map(([k,v])=>
          `<option value="${escapeHtml(k)}">${v.icon} ${escapeHtml(v.label)}</option>`
        ).join("")}
      </select>
      <select id="roleFilter" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:12.5px;background:#f8fafc;font-family:inherit">
        <option value="">All roles</option>
        ${roles.map(r=>`<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("")}
      </select>
      <div id="logCount" style="font-size:12px;color:#64748b;font-weight:700;white-space:nowrap">
        ${logs.length} entries
      </div>
    </div>

    <!-- Log feed — timeline style -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:14px 18px;border-bottom:1px solid #f1f5f9">
        <div style="font-weight:800;font-size:14px;color:#0f172a">
          Activity Feed
          <span style="font-size:12px;font-weight:600;color:#64748b">(${logs.length} entries)</span>
        </div>
      </div>

      ${logs.length === 0
        ? `<div class="empty-state"><div class="ic">📋</div><p>No activity recorded yet.</p></div>`
        : `<div id="logFeed" style="max-height:600px;overflow-y:auto">
            ${logs.map(l => {
              const meta = getMeta(l.action);
              return `
              <div class="log-entry" style="
                display:flex;align-items:flex-start;gap:12px;
                padding:12px 18px;border-bottom:1px solid #f8fafc;
                transition:background .15s"
                data-action="${escapeHtml(l.action)}"
                data-role="${escapeHtml(l.role||"")}"
                data-msg="${escapeHtml((l.message||"").toLowerCase())}">

                <!-- Icon -->
                <div style="
                  width:34px;height:34px;border-radius:9px;flex-shrink:0;
                  background:${meta.bg};border:1.5px solid ${meta.color}22;
                  display:flex;align-items:center;justify-content:center;
                  font-size:15px;margin-top:1px">
                  ${meta.icon}
                </div>

                <!-- Content -->
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px">
                    <span style="
                      font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:6px;
                      background:${meta.bg};color:${meta.color}">
                      ${escapeHtml(meta.label)}
                    </span>
                    ${l.role ? `<span style="
                      font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;
                      background:#f1f5f9;color:#64748b">
                      ${escapeHtml(l.role)}
                    </span>` : ""}
                  </div>
                  <div style="font-size:12.5px;color:#0f172a;font-weight:500;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${escapeHtml(l.message)}
                  </div>
                  <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                    ${escapeHtml(l.by||"system")} · ${fmtDateTime(l.at)}
                  </div>
                </div>
              </div>`;
            }).join("")}
          </div>
          <div id="logsEmpty" style="display:none">
            <div class="empty-state"><div class="ic">🔍</div><p>No logs match your filters.</p></div>
          </div>`}
    </div>

    <!-- Clear confirm modal -->
    <div id="clearModal" style="
      display:none;position:fixed;inset:0;z-index:400;
      background:rgba(15,23,42,.5);backdrop-filter:blur(4px);
      align-items:center;justify-content:center;padding:16px">
      <div style="
        background:#fff;border-radius:18px;padding:28px;
        width:100%;max-width:380px;text-align:center;
        box-shadow:0 24px 60px rgba(0,0,0,.2)">
        <div style="font-size:44px;margin-bottom:12px">🗑️</div>
        <h3 style="font-size:18px;font-weight:900;color:#991b1b;margin-bottom:8px">
          Clear All Logs?
        </h3>
        <p style="font-size:13px;color:#64748b;line-height:1.6;margin-bottom:22px">
          This will permanently delete all <strong>${logs.length}</strong> log entries.
          This cannot be undone.
        </p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-ghost" id="clearCancel">Cancel</button>
          <button class="btn btn-red" id="clearConfirm">Delete All</button>
        </div>
      </div>
    </div>
  `;

  return Shell("Government", "#/gov/logs", LINKS, html);
}

export function initGovLogs() {
  const searchEl  = document.getElementById("logSearch");
  const actionSel = document.getElementById("actionFilter");
  const roleSel   = document.getElementById("roleFilter");
  const feed      = document.getElementById("logFeed");
  const countEl   = document.getElementById("logCount");
  const emptyEl   = document.getElementById("logsEmpty");

  function applyFilters() {
    if (!feed) return;
    const q      = (searchEl?.value||"").toLowerCase().trim();
    const action = actionSel?.value||"";
    const role   = roleSel?.value||"";
    let vis = 0;

    feed.querySelectorAll(".log-entry").forEach(row => {
      const matchQ = !q      || row.dataset.msg.includes(q) || row.textContent.toLowerCase().includes(q);
      const matchA = !action || row.dataset.action === action;
      const matchR = !role   || row.dataset.role   === role;
      const show   = matchQ && matchA && matchR;
      row.style.display = show ? "" : "none";
      if (show) vis++;
    });

    if (countEl) countEl.textContent = `${vis} entr${vis!==1?"ies":"y"}`;
    if (emptyEl && feed) {
      emptyEl.style.display = vis===0 ? "" : "none";
    }
  }

  searchEl?.addEventListener("input",  applyFilters);
  actionSel?.addEventListener("change",applyFilters);
  roleSel?.addEventListener("change",  applyFilters);

  // Clear logs
  const clearModal = document.getElementById("clearModal");
  document.getElementById("clearLogsBtn")?.addEventListener("click", () => {
    clearModal.style.display = "flex";
  });
  document.getElementById("clearCancel")?.addEventListener("click", () => {
    clearModal.style.display = "none";
  });
  document.getElementById("clearConfirm")?.addEventListener("click", () => {
    clearModal.style.display = "none";
    // Clear logs from Supabase
    supabase.from("activity_logs").delete().neq("id", "IMPOSSIBLE_ID").then(() => {
      toast("All logs cleared.", "success");
      setTimeout(() => window.location.reload(), 300);
    });
  });
  clearModal?.addEventListener("click", e => {
    if (e.target === clearModal) clearModal.style.display = "none";
  });
}

function redirectLogin() {
  setTimeout(() => window.location.hash = "#/login/gov", 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting…</p></div>`;
}
