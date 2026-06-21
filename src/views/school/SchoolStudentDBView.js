// ============================================================================
//  SchoolStudentDBView — student list with photo thumbnails, search, remark modal
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

function photoThumb(st) {
  if (st.photo) {
    return `<img src="${st.photo}" alt="${escapeHtml(st.fullname)}" style="
      width:40px;height:50px;object-fit:cover;border-radius:6px;
      border:1.5px solid #e2e8f0;display:block">`;
  }
  return `<div style="
    width:40px;height:50px;border-radius:6px;background:#f1f5f9;
    border:1.5px solid #e2e8f0;display:flex;align-items:center;
    justify-content:center;font-size:18px;color:#94a3b8">👤</div>`;
}

export function SchoolStudentDBView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const students = db.findStudentsBySchool(school.code);
  const levels   = [...new Set(students.map((st) => st.level).filter(Boolean))];

  const rows = students.map((st) => `
    <tr data-tsid="${escapeHtml(st.tsid)}" data-level="${escapeHtml(st.level || "")}">
      <td>${photoThumb(st)}</td>
      <td class="mono" style="font-size:12px">${escapeHtml(st.tsid)}</td>
      <td>
        <div style="font-weight:700;color:#0f172a">${escapeHtml(st.fullname)}</div>
        <div style="font-size:11px;color:#64748b">${escapeHtml(st.gender || "—")} · DOB ${fmtDate(st.dob)}</div>
      </td>
      <td style="font-size:13px">${escapeHtml(st.level || "—")}</td>
      <td>${escapeHtml(st.bloodGroup || "—")}</td>
      <td>${fmtDate(st.issueDate)}</td>
      <td>
        ${st.remarks && st.remarks.length
          ? `<span class="badge blue">📝 ${st.remarks.length}</span>`
          : `<span class="badge gray">—</span>`}
      </td>
      <td><span class="badge green">Active</span></td>
      <td style="white-space:nowrap">
        <button class="btn btn-primary btn-sm" data-view="${escapeHtml(st.tsid)}" title="View ID card">🪪 ID</button>
        <button class="btn btn-ghost btn-sm" data-remark="${escapeHtml(st.tsid)}" title="Add remark">📝</button>
      </td>
    </tr>`).join("");

  const html = `

    <!-- Page header -->
    <div class="tsid-page-head">
      <div>
        <h1>Student Database</h1>
        <p><strong>${students.length}</strong> student${students.length !== 1 ? "s" : ""} registered at ${escapeHtml(school.name)}.</p>
      </div>
      <a href="#/school/create-student" class="btn btn-green">✚ Create Student</a>
    </div>

    <!-- Search + filter bar -->
    <div style="
      background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
      padding:14px 16px;margin-bottom:20px;
      display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div style="flex:1;min-width:200px;display:flex;align-items:center;gap:8px;
        background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px">
        <span style="color:#94a3b8;font-size:15px">🔍</span>
        <input id="searchInput" placeholder="Search name or TSID…" style="
          border:none;background:transparent;padding:9px 4px;
          font-size:13px;width:100%;font-family:inherit;outline:none">
      </div>
      <select id="levelFilter" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:13px;background:#f8fafc;font-family:inherit;min-width:150px">
        <option value="">All levels</option>
        ${levels.map((l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("")}
      </select>
      <select id="genderFilter" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:13px;background:#f8fafc;font-family:inherit">
        <option value="">All genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <div id="resultCount" style="font-size:12.5px;color:#64748b;font-weight:600;white-space:nowrap">
        ${students.length} records
      </div>
    </div>

    <!-- Table -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid #f1f5f9;
        display:flex;justify-content:space-between;align-items:center">
        <h3 style="font-size:15px;font-weight:800;color:#0f172a;margin:0">All Students</h3>
        <div style="display:flex;gap:8px">
          <span class="badge blue">${students.filter(st => st.photo).length} with photos</span>
          <span class="badge green">${students.length} active</span>
        </div>
      </div>
      ${students.length === 0
        ? `<div class="empty-state">
            <div class="ic">📭</div>
            <p>No students yet.</p>
            <a href="#/school/create-student" class="btn btn-green" style="margin-top:12px">✚ Create First Student</a>
          </div>`
        : `<div style="overflow-x:auto">
            <table class="tsid-table" id="studentsTable">
              <thead>
                <tr>
                  <th style="width:52px">Photo</th>
                  <th>TSID</th>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Blood</th>
                  <th>Issued</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div id="emptyFilter" style="display:none">
            <div class="empty-state"><div class="ic">🔍</div><p>No students match your filters.</p></div>
          </div>`}
    </div>

    <!-- ── Remark modal ──────────────────────────────────────────────────── -->
    <div id="remarkModal" style="
      display:none;position:fixed;inset:0;z-index:400;
      background:rgba(15,23,42,.45);backdrop-filter:blur(3px);
      align-items:center;justify-content:center;padding:16px">
      <div style="
        background:#fff;border-radius:18px;padding:26px;
        width:100%;max-width:500px;
        box-shadow:0 24px 60px rgba(0,0,0,.18)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="
            width:38px;height:38px;border-radius:10px;
            background:linear-gradient(135deg,#003366,#059669);
            display:flex;align-items:center;justify-content:center;font-size:18px">📝</div>
          <div>
            <div style="font-weight:800;font-size:15px;color:#0f172a">Add Remark</div>
            <div id="remarkStudentName" style="font-size:12px;color:#64748b;margin-top:1px"></div>
          </div>
        </div>
        <textarea id="remarkText" rows="4"
          placeholder="Enter remark — e.g. Excellent academic performance in term 1, disciplinary note, special needs, etc."
          style="
            width:100%;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
            font-family:inherit;font-size:13px;resize:vertical;min-height:100px;
            line-height:1.55;transition:border-color .15s"></textarea>
        <div id="remarkCharCount" style="text-align:right;font-size:11px;color:#94a3b8;margin-top:3px">0/300</div>
        <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
          <button class="btn btn-ghost" id="remarkCancel">Cancel</button>
          <button class="btn btn-primary" id="remarkSave" style="
            background:linear-gradient(135deg,#003366,#059669)">
            💾 Save Remark
          </button>
        </div>
      </div>
    </div>

    <!-- ── Student ID drawer (slide-in preview) ──────────────────────────── -->
    <div id="idDrawerOverlay" style="
      display:none;position:fixed;inset:0;z-index:300;
      background:rgba(15,23,42,.45);backdrop-filter:blur(3px)">
    </div>
    <div id="idDrawer" style="
      position:fixed;top:0;right:-480px;width:460px;height:100vh;
      background:#fff;z-index:350;overflow-y:auto;
      box-shadow:-8px 0 40px rgba(0,0,0,.15);
      transition:right .28s cubic-bezier(.4,0,.2,1);padding:0">
      <div id="idDrawerContent"></div>
    </div>
  `;

  return Shell("School", "#/school/students", LINKS, html);
}

// ============================================================================
//  Init
// ============================================================================
export function initSchoolStudentDB() {
  const searchEl   = document.getElementById("searchInput");
  const levelSel   = document.getElementById("levelFilter");
  const genderSel  = document.getElementById("genderFilter");
  const tbody      = document.querySelector("#studentsTable tbody");
  const countEl    = document.getElementById("resultCount");
  const emptyFilter= document.getElementById("emptyFilter");
  const tableWrap  = document.querySelector("#studentsTable");

  // ── Live filter ─────────────────────────────────────────────────────────
  function applyFilters() {
    if (!tbody) return;
    const q      = (searchEl?.value || "").toLowerCase().trim();
    const level  = levelSel?.value  || "";
    const gender = genderSel?.value || "";
    let visible  = 0;

    tbody.querySelectorAll("tr").forEach((row) => {
      const text     = row.textContent.toLowerCase();
      const rowLevel = row.dataset.level  || "";
      const rowText  = row.textContent;
      const matchQ   = !q      || text.includes(q);
      const matchL   = !level  || rowLevel === level;
      const matchG   = !gender || rowText.includes(gender);
      const show     = matchQ && matchL && matchG;
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (countEl) countEl.textContent = `${visible} record${visible !== 1 ? "s" : ""}`;
    if (emptyFilter && tableWrap) {
      emptyFilter.style.display = visible === 0 ? "" : "none";
      tableWrap.style.display   = visible === 0 ? "none" : "";
    }
  }

  searchEl?.addEventListener("input",  applyFilters);
  levelSel?.addEventListener("change", applyFilters);
  genderSel?.addEventListener("change",applyFilters);

  // ── ID drawer ────────────────────────────────────────────────────────────
  const overlay = document.getElementById("idDrawerOverlay");
  const drawer  = document.getElementById("idDrawer");
  const content = document.getElementById("idDrawerContent");

  function openDrawer(tsid) {
    const student = db.findStudent(tsid);
    const school  = student && db.findSchool(student.schoolCode);
    if (!student) return;

    content.innerHTML = `
      <div style="background:linear-gradient(135deg,#003366,#059669);padding:20px 22px;
        display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:800;font-size:16px;color:#fff">${escapeHtml(student.fullname)}</div>
          <div style="font-size:12px;color:#a7f3d0;margin-top:2px;font-family:ui-monospace">${escapeHtml(student.tsid)}</div>
        </div>
        <button id="closeDrawer" style="
          width:32px;height:32px;border-radius:50%;border:none;
          background:rgba(255,255,255,.2);color:#fff;font-size:18px;
          cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
      </div>

      <div style="padding:18px 22px">

        <!-- Photo + core fields -->
        <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:18px">
          ${student.photo
            ? `<img src="${student.photo}" style="width:80px;height:100px;object-fit:cover;border-radius:10px;border:2px solid #e2e8f0;flex-shrink:0">`
            : `<div style="width:80px;height:100px;border-radius:10px;background:#f1f5f9;border:2px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:36px;color:#cbd5e1;flex-shrink:0">👤</div>`}
          <div style="flex:1">
            ${[
              ["DOB",         fmtDate(student.dob)],
              ["Gender",      student.gender || "—"],
              ["Blood Group", student.bloodGroup || "—"],
              ["Nationality", student.nationality || "Tanzanian"],
              ["Level",       student.level || "—"],
              ["Enrolled",    fmtDate(student.enrollmentDate)],
            ].map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;padding:4px 0;
                border-bottom:1px solid #f1f5f9;font-size:12.5px">
                <span style="color:#64748b;font-weight:600">${k}</span>
                <span style="font-weight:700">${escapeHtml(String(v))}</span>
              </div>`).join("")}
          </div>
        </div>

        <!-- School info -->
        <div style="background:#f8fafc;border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <div style="font-weight:800;font-size:12px;color:#374151;margin-bottom:8px">🏫 School</div>
          ${[
            ["Name",    student.schoolName],
            ["Code",    student.schoolCode],
            ["Region",  student.region + " / " + student.district],
            ["Ward",    student.ward || "—"],
            ["Contact", (school && school.contact) || student.schoolContact || "—"],
          ].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px">
              <span style="color:#64748b;font-weight:600">${k}</span>
              <span style="font-weight:700;text-align:right;max-width:60%">${escapeHtml(String(v))}</span>
            </div>`).join("")}
        </div>

        <!-- Parent info -->
        <div style="background:#f0fdf4;border-radius:10px;padding:12px 14px;margin-bottom:14px">
          <div style="font-weight:800;font-size:12px;color:#065f46;margin-bottom:8px">👨‍👩‍👧 Guardian</div>
          ${[
            ["Name",         student.parentName || "—"],
            ["Relationship", student.relationship || "—"],
            ["NIDA",         student.parentNida || "—"],
            ["Phone",        student.parentPhone || "—"],
          ].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px">
              <span style="color:#065f46;font-weight:600">${k}</span>
              <span style="font-weight:700;text-align:right;max-width:60%">${escapeHtml(String(v))}</span>
            </div>`).join("")}
        </div>

        <!-- Remarks -->
        ${student.remarks && student.remarks.length ? `
          <div style="background:#fffbeb;border-radius:10px;padding:12px 14px;margin-bottom:14px">
            <div style="font-weight:800;font-size:12px;color:#92400e;margin-bottom:8px">📝 Remarks (${student.remarks.length})</div>
            ${student.remarks.map((r) => `
              <div style="padding:6px 0;border-bottom:1px solid #fde68a;font-size:12px">
                <div style="color:#451a03;font-weight:600">"${escapeHtml(r.text)}"</div>
                <div style="color:#92400e;font-size:11px;margin-top:2px">${escapeHtml(r.by)} · ${fmtDate(r.at)}</div>
              </div>`).join("")}
          </div>` : ""}

        <!-- Credentials -->
        <div style="background:#eff6ff;border-radius:10px;padding:12px 14px;margin-bottom:18px">
          <div style="font-weight:800;font-size:12px;color:#1e40af;margin-bottom:6px">🔑 Student Login Credentials</div>
          <div style="font-size:12px;color:#1e40af">
            Username: <code style="background:#dbeafe;padding:1px 6px;border-radius:4px">${escapeHtml(student.credentials?.username || student.tsid)}</code><br>
            Password: <code style="background:#dbeafe;padding:1px 6px;border-radius:4px">••••••••</code>
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="#/search/result/student/${encodeURIComponent(student.tsid)}"
            class="btn btn-primary btn-sm" style="flex:1;justify-content:center">🪪 Full ID View</a>
          <button class="btn btn-ghost btn-sm" data-remark="${escapeHtml(student.tsid)}"
            style="flex:1;justify-content:center">📝 Add Remark</button>
        </div>
      </div>
    `;

    overlay.style.display = "block";
    drawer.style.right    = "0";

    document.getElementById("closeDrawer")?.addEventListener("click", closeDrawer);
    // Wire remark button inside drawer
    content.querySelector("[data-remark]")?.addEventListener("click", () => {
      closeDrawer();
      setTimeout(() => openRemarkModal(tsid), 200);
    });
  }

  function closeDrawer() {
    drawer.style.right    = "-480px";
    overlay.style.display = "none";
  }

  overlay?.addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => openDrawer(btn.getAttribute("data-view")));
  });

  // ── Remark modal ─────────────────────────────────────────────────────────
  const modal      = document.getElementById("remarkModal");
  const nameEl     = document.getElementById("remarkStudentName");
  const textEl     = document.getElementById("remarkText");
  const charEl     = document.getElementById("remarkCharCount");
  let   activeTsid = null;

  function openRemarkModal(tsid) {
    activeTsid = tsid;
    const st = db.findStudent(tsid);
    if (nameEl) nameEl.textContent = st ? `${st.fullname} · ${st.tsid}` : tsid;
    if (textEl) textEl.value = "";
    if (charEl) charEl.textContent = "0/300";
    modal.style.display = "flex";
    setTimeout(() => textEl?.focus(), 50);
  }

  textEl?.addEventListener("input", () => {
    if (charEl) charEl.textContent = `${textEl.value.length}/300`;
  });

  document.querySelectorAll("[data-remark]").forEach((btn) => {
    btn.addEventListener("click", () => openRemarkModal(btn.getAttribute("data-remark")));
  });

  document.getElementById("remarkCancel")?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.getElementById("remarkSave")?.addEventListener("click", () => {
    const text = (textEl?.value || "").trim();
    if (!text) { toast("Please enter a remark.", "error"); return; }
    if (text.length > 300) { toast("Remark too long (max 300 chars).", "error"); return; }
    db.addRemark(activeTsid, text);
    toast("📝 Remark saved.", "success");
    modal.style.display = "none";
    setTimeout(() => window.location.reload(), 500);
  });

  // Close modal on overlay click
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
