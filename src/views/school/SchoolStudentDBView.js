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

export function SchoolStudentDBView() {
  const s = currentSession();
  if (!s || s.role !== "school") return redirectLogin();
  const school = db.findSchool(s.ref);
  if (!school) return redirectLogin();

  const students = db.findStudentsBySchool(school.code);

  const rows = students
    .map(
      (st) => `<tr>
        <td class="mono">${escapeHtml(st.tsid)}</td>
        <td>
          <div style="font-weight:700">${escapeHtml(st.fullname)}</div>
          <div style="font-size:11px;color:#64748b">${escapeHtml(st.level || "—")} · ${escapeHtml(st.gender || "—")}</div>
        </td>
        <td>${escapeHtml(st.bloodGroup || "—")}</td>
        <td>${fmtDate(st.issueDate)}</td>
        <td>
          ${st.remarks && st.remarks.length
            ? `<span class="badge blue">${st.remarks.length} remark${st.remarks.length > 1 ? "s" : ""}</span>`
            : `<span class="badge gray">None</span>`}
        </td>
        <td><span class="badge green">Active</span></td>
        <td style="white-space:nowrap">
          <button class="btn btn-outline btn-sm" data-view="${escapeHtml(st.tsid)}">View</button>
          <button class="btn btn-ghost btn-sm" data-remark="${escapeHtml(st.tsid)}">+ Remark</button>
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>Student Database</h1>
        <p>${students.length} students registered at ${escapeHtml(school.name)}.</p>
      </div>
      <a href="#/school/create-student" class="btn btn-green">+ Create Student</a>
    </div>

    <div class="search-bar">
      <input id="searchInput" placeholder="Search by name or TSID...">
      <select id="searchLevel">
        <option value="">All levels</option>
        ${[...new Set(students.map((s) => s.level).filter(Boolean))].map(
          (l) => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`
        )}
      </select>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>All Students</h3>
        <span style="font-size:12px;color:#64748b">${students.length} records</span>
      </div>
      ${
        students.length === 0
          ? `<div class="empty-state"><div class="ic">📭</div><p>No students yet. Click "Create Student" to begin.</p></div>`
          : `<table class="tsid-table" id="studentsTable">
              <thead><tr>
                <th>TSID</th><th>Name</th><th>Blood</th><th>Issued</th><th>Remarks</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>

    <!-- Remark modal -->
    <div id="remarkModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:none;align-items:center;justify-content:center">
      <div style="background:#fff;border-radius:14px;padding:24px;width:90%;max-width:480px">
        <h3 style="font-size:16px;font-weight:800;color:#003366;margin-bottom:12px">Add Remark</h3>
        <p style="font-size:12px;color:#64748b;margin-bottom:12px" id="remarkStudentName"></p>
        <textarea id="remarkText" rows="4" placeholder="Enter remark (e.g. Excellent academic performance, disciplinary note, etc.)" style="width:100%;padding:10px;border:1.5px solid #e2e8f0;border-radius:9px;font-family:inherit;font-size:13px"></textarea>
        <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
          <button class="btn btn-ghost" id="remarkCancel">Cancel</button>
          <button class="btn btn-primary" id="remarkSave">Save Remark</button>
        </div>
      </div>
    </div>
  `;

  return Shell("School", "#/school/students", LINKS, html);
}

export function initSchoolStudentDB() {
  const search = document.getElementById("searchInput");
  const levelSel = document.getElementById("searchLevel");
  const table = document.getElementById("studentsTable");

  function filter() {
    if (!table) return;
    const q = (search?.value || "").toLowerCase();
    const lvl = levelSel?.value || "";
    table.querySelectorAll("tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();
      const showQ = !q || text.includes(q);
      const showL = !lvl || text.includes(lvl.toLowerCase());
      row.style.display = showQ && showL ? "" : "none";
    });
  }
  search?.addEventListener("input", filter);
  levelSel?.addEventListener("change", filter);

  // View → student detail in public search layout (reuse search result)
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tsid = btn.getAttribute("data-view");
      window.location.hash = "#/search/result/student/" + encodeURIComponent(tsid);
    });
  });

  // Remark modal
  let activeTsid = null;
  const modal = document.getElementById("remarkModal");
  const nameEl = document.getElementById("remarkStudentName");
  const textEl = document.getElementById("remarkText");

  document.querySelectorAll("[data-remark]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTsid = btn.getAttribute("data-remark");
      const st = db.findStudent(activeTsid);
      nameEl.textContent = (st && st.fullname + " · " + st.tsid) || "";
      textEl.value = "";
      modal.style.display = "flex";
    });
  });
  document.getElementById("remarkCancel").addEventListener("click", () => {
    modal.style.display = "none";
  });
  document.getElementById("remarkSave").addEventListener("click", () => {
    const text = textEl.value.trim();
    if (!text) {
      toast("Please enter a remark.", "error");
      return;
    }
    db.addRemark(activeTsid, text);
    toast("Remark added.", "success");
    modal.style.display = "none";
    setTimeout(() => window.location.reload(), 500);
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/school"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
