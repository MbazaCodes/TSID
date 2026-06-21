import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/school/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/school/create-student", label: "Create Student", icon: "✚" },
  { href: "#/school/students", label: "Student Database", icon: "☰" },
  { href: "#/school/applications", label: "Applications", icon: "✓" },
  { href: "#/school/payments", label: "Payments", icon: "₵" },
  { href: "#/school/settings", label: "School Settings", icon: "⚙" },
];

export function SchoolApplicationsView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const apps = db.applicationsForSchool(school.code);
  const pending = apps.filter((a) => a.status === "pending");
  const decided = apps.filter((a) => a.status !== "pending");

  const rows = (list) =>
    list
      .map(
        (a) => `<tr>
          <td class="mono">${escapeHtml(a.id)}</td>
          <td>
            <div style="font-weight:700">${escapeHtml(a.fullname)}</div>
            <div style="font-size:11px;color:#64748b">${escapeHtml(a.level || "—")} · ${escapeHtml(a.gender || "—")}</div>
          </td>
          <td>${fmtDate(a.dob)}</td>
          <td>${escapeHtml(a.parentName || "—")}<br><span style="font-size:11px;color:#64748b">${escapeHtml(a.parentPhone || "—")}</span></td>
          <td>${fmtDate(a.submittedAt)}</td>
          <td>
            ${
              a.status === "pending"
                ? `<span class="badge yellow">Pending</span>`
                : a.status === "approved"
                ? `<span class="badge green">Approved</span>`
                : `<span class="badge red">Rejected</span>`
            }
          </td>
          <td style="white-space:nowrap">
            ${
              a.status === "pending"
                ? `<button class="btn btn-green btn-sm" data-approve="${escapeHtml(a.id)}">Approve</button>
                   <button class="btn btn-red btn-sm" data-reject="${escapeHtml(a.id)}">Reject</button>`
                : `<span style="font-size:11px;color:#64748b">${fmtDate(a.decidedAt)}</span>`
            }
          </td>
        </tr>`
      )
      .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>Student Applications</h1>
        <p>Review and approve/reject pending student applications for ${escapeHtml(school.name)}.</p>
      </div>
    </div>

    <div class="tsid-stat-grid">
      <div class="tsid-stat"><div class="icon yellow">✓</div><div><div class="label">Pending</div><div class="value">${pending.length}</div></div></div>
      <div class="tsid-stat"><div class="icon green">✓</div><div><div class="label">Approved</div><div class="value">${apps.filter(a=>a.status==="approved").length}</div></div></div>
      <div class="tsid-stat"><div class="icon red">✗</div><div><div class="label">Rejected</div><div class="value">${apps.filter(a=>a.status==="rejected").length}</div></div></div>
    </div>

    <div class="tsid-table-wrap" style="margin-bottom:24px">
      <div class="table-head"><h3>Pending Applications</h3></div>
      ${
        pending.length === 0
          ? `<div class="empty-state"><div class="ic">✓</div><p>No pending applications.</p></div>`
          : `<table class="tsid-table">
              <thead><tr><th>App ID</th><th>Student</th><th>DOB</th><th>Parent</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>${rows(pending)}</tbody>
            </table>`
      }
    </div>

    ${
      decided.length
        ? `<div class="tsid-table-wrap">
            <div class="table-head"><h3>Decided Applications</h3></div>
            <table class="tsid-table">
              <thead><tr><th>App ID</th><th>Student</th><th>DOB</th><th>Parent</th><th>Submitted</th><th>Status</th><th>Decided</th></tr></thead>
              <tbody>${rows(decided)}</tbody>
            </table>
          </div>`
        : ""
    }

    <!-- Reject modal -->
    <div id="rejectModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;align-items:center;justify-content:center">
      <div style="background:#fff;border-radius:14px;padding:24px;width:90%;max-width:480px">
        <h3 style="font-size:16px;font-weight:800;color:#DC2626;margin-bottom:12px">Reject Application</h3>
        <textarea id="rejectReason" rows="3" placeholder="Reason for rejection (optional)" style="width:100%;padding:10px;border:1.5px solid #e2e8f0;border-radius:9px;font-family:inherit;font-size:13px"></textarea>
        <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
          <button class="btn btn-ghost" id="rejectCancel">Cancel</button>
          <button class="btn btn-red" id="rejectConfirm">Confirm Reject</button>
        </div>
      </div>
    </div>
  `;

  return Shell("School", "#/school/applications", LINKS, html);
}

export function initSchoolApplications() {
  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-approve");
      const student = db.approveApplication(id);
      toast("Application approved — TSID " + (student && student.tsid), "success");
      setTimeout(() => window.location.reload(), 700);
    });
  });

  let rejectId = null;
  const modal = document.getElementById("rejectModal");
  document.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => {
      rejectId = btn.getAttribute("data-reject");
      document.getElementById("rejectReason").value = "";
      modal.style.display = "flex";
    });
  });
  document.getElementById("rejectCancel").addEventListener("click", () => {
    modal.style.display = "none";
  });
  document.getElementById("rejectConfirm").addEventListener("click", () => {
    const reason = document.getElementById("rejectReason").value.trim() || "Not specified";
    db.rejectApplication(rejectId, reason);
    toast("Application rejected.", "error");
    modal.style.display = "none";
    setTimeout(() => window.location.reload(), 700);
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
