// ============================================================================
//  SchoolApplicationsView — approve/reject with photo preview + detail drawer
// ============================================================================
import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";
import { toast } from "../../lib/toast.js";

const LINKS = [
  { href: "#/school/dashboard",      label: "Dashboard",       icon: "▣" },
  { href: "#/school/create-student", label: "Create Student",  icon: "✚" },
  { href: "#/school/students",       label: "Student Database",icon: "☰" },
  { href: "#/school/applications",   label: "Applications",    icon: "✓" },
  { href: "#/school/payments",       label: "Payments",        icon: "₵" },
  { href: "#/school/settings",       label: "School Settings", icon: "⚙" },
];

function appPhotoThumb(a) {
  if (a.photo) {
    return `<img src="${a.photo}" alt="" style="
      width:40px;height:50px;object-fit:cover;border-radius:6px;
      border:1.5px solid #e2e8f0;display:block">`;
  }
  return `<div style="
    width:40px;height:50px;border-radius:6px;background:#f1f5f9;
    border:1.5px solid #e2e8f0;display:flex;align-items:center;
    justify-content:center;font-size:18px;color:#94a3b8">👤</div>`;
}

function buildRows(list, withActions) {
  return list.map((a) => `
    <tr data-appid="${escapeHtml(a.id)}">
      <td>${appPhotoThumb(a)}</td>
      <td class="mono" style="font-size:12px">${escapeHtml(a.id)}</td>
      <td>
        <div style="font-weight:700;color:#0f172a">${escapeHtml(a.fullname)}</div>
        <div style="font-size:11px;color:#64748b">${escapeHtml(a.gender || "—")} · DOB ${fmtDate(a.dob)}</div>
      </td>
      <td style="font-size:13px">${escapeHtml(a.level || "—")}</td>
      <td>
        <div style="font-weight:600">${escapeHtml(a.parentName || "—")}</div>
        <div style="font-size:11px;color:#64748b">${escapeHtml(a.parentPhone || "—")}</div>
      </td>
      <td>${fmtDate(a.submittedAt)}</td>
      <td>
        ${a.status === "pending"
          ? `<span class="badge yellow">⏳ Pending</span>`
          : a.status === "approved"
          ? `<span class="badge green">✓ Approved</span>`
          : `<span class="badge red">✗ Rejected</span>`}
      </td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" data-preview="${escapeHtml(a.id)}" title="Preview full details">👁</button>
        ${withActions && a.status === "pending" ? `
          <button class="btn btn-green btn-sm" data-approve="${escapeHtml(a.id)}">✓ Approve</button>
          <button class="btn btn-red btn-sm"   data-reject="${escapeHtml(a.id)}">✗ Reject</button>` : ""}
        ${!withActions ? `<span style="font-size:11px;color:#64748b">${fmtDate(a.decidedAt)}</span>` : ""}
      </td>
    </tr>`).join("");
}

export function SchoolApplicationsView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const apps     = db.applicationsForSchool(school.code);
  const pending  = apps.filter((a) => a.status === "pending");
  const approved = apps.filter((a) => a.status === "approved");
  const rejected = apps.filter((a) => a.status === "rejected");
  const decided  = apps.filter((a) => a.status !== "pending");

  const html = `

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <h1>Student Applications</h1>
        <p>Review and approve or reject pending enrolment applications for <strong>${escapeHtml(school.name)}</strong>.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="rg-3" style="margin-bottom:22px">
      ${[
        ["Pending Review", pending.length,  "#92400e","#fffbeb","#fcd34d","⏳"],
        ["Approved",       approved.length, "#065f46","#ecfdf5","#6ee7b7","✅"],
        ["Rejected",       rejected.length, "#991b1b","#fef2f2","#fca5a5","❌"],
      ].map(([label, val, tc, bg, bdr, icon]) => `
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;
          padding:16px 18px;display:flex;align-items:center;gap:12px">
          <div style="font-size:26px">${icon}</div>
          <div>
            <div style="font-size:26px;font-weight:900;color:${tc};line-height:1">${val}</div>
            <div style="font-size:12px;font-weight:700;color:${tc};opacity:.75;margin-top:2px">${label}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Pending table -->
    <div style="background:#fff;border:1.5px solid ${pending.length ? "#fde68a" : "#e2e8f0"};
      border-radius:16px;overflow:hidden;margin-bottom:24px">
      <div style="
        padding:14px 20px;border-bottom:1px solid #f1f5f9;
        background:${pending.length ? "linear-gradient(135deg,#fffbeb,#fef3c7)" : "#f8fafc"};
        display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">${pending.length ? "⚠️" : "✅"}</span>
          <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">
            Pending Applications
            ${pending.length ? `<span style="background:#d97706;color:#fff;
              font-size:11px;padding:2px 8px;border-radius:99px;margin-left:6px">${pending.length}</span>` : ""}
          </h3>
        </div>
      </div>
      ${pending.length === 0
        ? `<div class="empty-state"><div class="ic">✅</div><p>All caught up — no pending applications.</p></div>`
        : `<div style="overflow-x:auto">
            <table class="tsid-table" id="pendingTable">
              <thead><tr>
                <th style="width:52px">Photo</th><th>App ID</th><th>Applicant</th>
                <th>Level</th><th>Parent</th><th>Submitted</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>${buildRows(pending, true)}</tbody>
            </table>
          </div>`}
    </div>

    <!-- Decided table -->
    ${decided.length ? `
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="padding:14px 20px;border-bottom:1px solid #f1f5f9;
          display:flex;align-items:center;gap:10px">
          <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">
            Decided Applications
            <span style="background:#94a3b8;color:#fff;font-size:11px;
              padding:2px 8px;border-radius:99px;margin-left:6px">${decided.length}</span>
          </h3>
        </div>
        <div style="overflow-x:auto">
          <table class="tsid-table">
            <thead><tr>
              <th style="width:52px">Photo</th><th>App ID</th><th>Applicant</th>
              <th>Level</th><th>Parent</th><th>Submitted</th><th>Status</th><th>Decided</th>
            </tr></thead>
            <tbody>${buildRows(decided, false)}</tbody>
          </table>
        </div>
      </div>` : ""}

    <!-- ── Applicant detail drawer ──────────────────────────────────────── -->
    <div id="previewOverlay" style="
      display:none;position:fixed;inset:0;z-index:300;
      background:rgba(15,23,42,.45);backdrop-filter:blur(3px)"></div>
    <div id="previewDrawer" style="
      position:fixed;top:0;right:-500px;width:480px;height:100vh;
      background:#fff;z-index:350;overflow-y:auto;
      box-shadow:-8px 0 40px rgba(0,0,0,.15);
      transition:right .28s cubic-bezier(.4,0,.2,1)">
      <div id="previewContent"></div>
    </div>

    <!-- ── Reject reason modal ───────────────────────────────────────────── -->
    <div id="rejectModal" style="
      display:none;position:fixed;inset:0;z-index:500;
      background:rgba(15,23,42,.55);backdrop-filter:blur(4px);
      align-items:center;justify-content:center;padding:16px">
      <div style="
        background:#fff;border-radius:18px;padding:28px;
        width:100%;max-width:480px;
        box-shadow:0 24px 60px rgba(0,0,0,.2)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="
            width:38px;height:38px;border-radius:10px;background:#fef2f2;
            border:2px solid #fca5a5;display:flex;align-items:center;
            justify-content:center;font-size:20px">✗</div>
          <div>
            <div style="font-weight:800;font-size:15px;color:#991b1b">Reject Application</div>
            <div id="rejectAppName" style="font-size:12px;color:#64748b;margin-top:1px"></div>
          </div>
        </div>
        <label style="display:block;font-size:12.5px;font-weight:700;color:#374151;margin-bottom:6px">
          Reason for rejection <span style="font-weight:400;color:#94a3b8">(optional)</span>
        </label>
        <textarea id="rejectReason" rows="3"
          placeholder="e.g. Incomplete documentation, age requirement not met, school capacity full…"
          style="
            width:100%;padding:11px 14px;border:1.5px solid #fca5a5;border-radius:10px;
            font-family:inherit;font-size:13px;resize:vertical;
            transition:border-color .15s;line-height:1.55"></textarea>
        <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
          <button class="btn btn-ghost" id="rejectCancel">Cancel</button>
          <button class="btn btn-red" id="rejectConfirm">✗ Confirm Rejection</button>
        </div>
      </div>
    </div>
  `;

  return Shell("School", "#/school/applications", LINKS, html);
}

// ============================================================================
//  Init
// ============================================================================
export function initSchoolApplications() {

  // ── Approve ──────────────────────────────────────────────────────────────
  document.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id      = btn.getAttribute("data-approve");
      const app     = db.getApplications().find((a) => a.id === id);
      const student = db.approveApplication(id);
      toast(`✅ Application approved — TSID: ${student?.tsid}`, "success");
      setTimeout(() => window.location.reload(), 700);
    });
  });

  // ── Reject modal ─────────────────────────────────────────────────────────
  let rejectId = null;
  const rejectModal   = document.getElementById("rejectModal");
  const rejectNameEl  = document.getElementById("rejectAppName");
  const rejectReasonEl= document.getElementById("rejectReason");

  document.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => {
      rejectId = btn.getAttribute("data-reject");
      const app = db.getApplications().find((a) => a.id === rejectId);
      if (rejectNameEl) rejectNameEl.textContent = app ? `${app.fullname} · ${rejectId}` : rejectId;
      if (rejectReasonEl) rejectReasonEl.value = "";
      rejectModal.style.display = "flex";
      setTimeout(() => rejectReasonEl?.focus(), 50);
    });
  });

  document.getElementById("rejectCancel")?.addEventListener("click", () => {
    rejectModal.style.display = "none";
  });

  document.getElementById("rejectConfirm")?.addEventListener("click", () => {
    const reason = (rejectReasonEl?.value || "").trim() || "Not specified";
    db.rejectApplication(rejectId, reason);
    toast("Application rejected.", "error");
    rejectModal.style.display = "none";
    setTimeout(() => window.location.reload(), 700);
  });

  rejectModal?.addEventListener("click", (e) => {
    if (e.target === rejectModal) rejectModal.style.display = "none";
  });

  // ── Preview drawer ───────────────────────────────────────────────────────
  const overlay = document.getElementById("previewOverlay");
  const drawer  = document.getElementById("previewDrawer");
  const content = document.getElementById("previewContent");

  function closeDrawer() {
    drawer.style.right    = "-500px";
    overlay.style.display = "none";
  }

  overlay?.addEventListener("click", closeDrawer);

  document.querySelectorAll("[data-preview]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id  = btn.getAttribute("data-preview");
      const app = db.getApplications().find((a) => a.id === id);
      if (!app) return;

      const statusBadge = app.status === "pending"
        ? `<span class="badge yellow">⏳ Pending</span>`
        : app.status === "approved"
        ? `<span class="badge green">✓ Approved</span>`
        : `<span class="badge red">✗ Rejected</span>`;

      content.innerHTML = `
        <div style="background:linear-gradient(135deg,#003860,#004f8a);
          padding:20px 22px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:800;font-size:16px;color:#fff">${escapeHtml(app.fullname)}</div>
            <div style="font-size:12px;color:#a7f3d0;margin-top:2px">${escapeHtml(app.id)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            ${statusBadge}
            <button id="closePreview" style="
              width:32px;height:32px;border-radius:50%;border:none;
              background:rgba(255,255,255,.2);color:#fff;font-size:18px;
              cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
          </div>
        </div>

        <div style="padding:20px 22px">

          <!-- Large photo -->
          <div style="text-align:center;margin-bottom:18px">
            ${app.photo
              ? `<img src="${app.photo}" style="
                  width:120px;height:150px;object-fit:cover;
                  border-radius:12px;border:3px solid #e2e8f0;
                  box-shadow:0 4px 12px rgba(0,0,0,.1)">`
              : `<div style="
                  width:120px;height:150px;border-radius:12px;
                  background:#f1f5f9;border:3px dashed #d1d5db;
                  display:inline-flex;align-items:center;justify-content:center;
                  font-size:52px;color:#cbd5e1">👤</div>`}
            <div style="margin-top:8px;font-size:12px;color:#94a3b8">
              ${app.photo ? "Photo provided" : "No photo uploaded"}
            </div>
          </div>

          <!-- Student info -->
          <div style="background:#f8fafc;border-radius:12px;padding:14px;margin-bottom:14px">
            <div style="font-weight:800;font-size:12px;color:#374151;margin-bottom:8px">🎓 Student Details</div>
            ${[
              ["Full Name",    app.fullname],
              ["Date of Birth",fmtDate(app.dob)],
              ["Gender",       app.gender || "—"],
              ["Nationality",  app.nationality || "Tanzanian"],
              ["Level",        app.level || "—"],
              ["Blood Group",  app.bloodGroup || "—"],
              ["Enrollment",   fmtDate(app.enrollmentDate)],
            ].map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;
                padding:5px 0;border-bottom:1px solid #e2e8f0;font-size:12.5px">
                <span style="color:#64748b;font-weight:600">${k}</span>
                <span style="font-weight:700">${escapeHtml(String(v))}</span>
              </div>`).join("")}
          </div>

          <!-- Parent info -->
          <div style="background:#f0fdf4;border-radius:12px;padding:14px;margin-bottom:14px">
            <div style="font-weight:800;font-size:12px;color:#065f46;margin-bottom:8px">👨‍👩‍👧 Parent / Guardian</div>
            ${[
              ["Name",         app.parentName || "—"],
              ["Relationship", app.relationship || "—"],
              ["NIDA",         app.parentNida || "—"],
              ["Phone",        app.parentPhone || "—"],
            ].map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;
                padding:5px 0;border-bottom:1px solid #bbf7d0;font-size:12.5px">
                <span style="color:#065f46;font-weight:600">${k}</span>
                <span style="font-weight:700">${escapeHtml(String(v))}</span>
              </div>`).join("")}
          </div>

          <!-- Submitted + status -->
          <div style="background:#dce8f5;border-radius:12px;padding:12px 14px;margin-bottom:18px;
            font-size:12.5px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <span style="color:#002540;font-weight:600">Submitted:</span>
              <span style="font-weight:700;margin-left:6px">${fmtDate(app.submittedAt)}</span>
            </div>
            <div>${statusBadge}</div>
          </div>

          ${app.status === "rejected" && app.rejectReason ? `
            <div style="background:#fef2f2;border-radius:10px;padding:12px 14px;
              margin-bottom:18px;font-size:12.5px;color:#991b1b">
              <strong>Rejection reason:</strong> ${escapeHtml(app.rejectReason)}
            </div>` : ""}

          <!-- Actions -->
          ${app.status === "pending" ? `
            <div style="display:flex;gap:8px">
              <button class="btn btn-green" data-approve="${escapeHtml(app.id)}"
                style="flex:1;justify-content:center">✓ Approve</button>
              <button class="btn btn-red" data-reject="${escapeHtml(app.id)}"
                style="flex:1;justify-content:center">✗ Reject</button>
            </div>` : ""}
        </div>
      `;

      overlay.style.display = "block";
      drawer.style.right    = "0";

      document.getElementById("closePreview")?.addEventListener("click", closeDrawer);

      // Wire approve/reject inside drawer
      content.querySelector("[data-approve]")?.addEventListener("click", (e) => {
        const id      = e.currentTarget.getAttribute("data-approve");
        const student = db.approveApplication(id);
        toast(`✅ Approved — TSID: ${student?.tsid}`, "success");
        closeDrawer();
        setTimeout(() => window.location.reload(), 700);
      });

      content.querySelector("[data-reject]")?.addEventListener("click", (e) => {
        rejectId = e.currentTarget.getAttribute("data-reject");
        const app2 = db.getApplications().find((a) => a.id === rejectId);
        if (rejectNameEl) rejectNameEl.textContent = app2 ? `${app2.fullname} · ${rejectId}` : rejectId;
        if (rejectReasonEl) rejectReasonEl.value = "";
        closeDrawer();
        setTimeout(() => { rejectModal.style.display = "flex"; }, 300);
      });
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
