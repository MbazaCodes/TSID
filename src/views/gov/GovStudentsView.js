import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard", icon: "▣" },
  { href: "#/gov/students", label: "Students Database", icon: "☰" },
  { href: "#/gov/schools", label: "Create School", icon: "✚" },
  { href: "#/gov/logs", label: "Logs", icon: "⌷" },
];

export function GovStudentsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const students = db.getStudents();
  const schools = db.getSchools();

  const rows = students
    .map(
      (st) => `<tr>
        <td class="mono">${escapeHtml(st.tsid)}</td>
        <td>
          <div style="font-weight:700">${escapeHtml(st.fullname)}</div>
          <div style="font-size:11px;color:#64748b">${escapeHtml(st.gender || "—")} · ${fmtDate(st.dob)}</div>
        </td>
        <td>${escapeHtml(st.schoolName || "—")}<br><span style="font-size:11px;color:#64748b">${escapeHtml(st.schoolCode || "")}</span></td>
        <td>${escapeHtml(st.region || "—")}</td>
        <td>${escapeHtml(st.level || "—")}</td>
        <td>${fmtDate(st.issueDate)}</td>
        <td><span class="badge green">Active</span></td>
        <td><button class="btn btn-outline btn-sm" data-view="${escapeHtml(st.tsid)}">View ID</button></td>
      </tr>`
    )
    .join("");

  const html = `
    <div class="tsid-page-head">
      <div>
        <h1>National Students Database</h1>
        <p>${students.length} students registered across ${schools.length} schools.</p>
      </div>
    </div>

    <div class="search-bar">
      <input id="searchInput" placeholder="Search by name, TSID, or school...">
      <select id="searchRegion">
        <option value="">All regions</option>
        ${[...new Set(schools.map((s) => s.region))].map(
          (r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`
        )}
      </select>
      <select id="searchSchool">
        <option value="">All schools</option>
        ${schools.map((sc) => `<option value="${escapeHtml(sc.code)}">${escapeHtml(sc.name)}</option>`).join("")}
      </select>
    </div>

    <div class="tsid-table-wrap">
      <div class="table-head">
        <h3>All Students</h3>
        <span style="font-size:12px;color:#64748b">${students.length} records</span>
      </div>
      ${
        students.length === 0
          ? `<div class="empty-state"><div class="ic">📭</div><p>No students registered nationally yet.</p></div>`
          : `<table class="tsid-table" id="studentsTable">
              <thead><tr>
                <th>TSID</th><th>Name</th><th>School</th><th>Region</th><th>Level</th><th>Issued</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>`
      }
    </div>
  `;

  return Shell("Government", "#/gov/students", LINKS, html);
}

export function initGovStudents() {
  const search = document.getElementById("searchInput");
  const regionSel = document.getElementById("searchRegion");
  const schoolSel = document.getElementById("searchSchool");
  const table = document.getElementById("studentsTable");

  function filter() {
    if (!table) return;
    const q = (search?.value || "").toLowerCase();
    const r = regionSel?.value || "";
    const sc = schoolSel?.value || "";
    table.querySelectorAll("tbody tr").forEach((row) => {
      const text = row.textContent.toLowerCase();
      const showQ = !q || text.includes(q);
      const showR = !r || text.includes(r.toLowerCase());
      const showS = !sc || text.includes(sc.toLowerCase());
      row.style.display = showQ && showR && showS ? "" : "none";
    });
  }
  search?.addEventListener("input", filter);
  regionSel?.addEventListener("change", filter);
  schoolSel?.addEventListener("change", filter);

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tsid = btn.getAttribute("data-view");
      window.location.hash = "#/search/result/student/" + encodeURIComponent(tsid);
    });
  });
}

function redirectLogin() {
  setTimeout(() => (window.location.hash = "#/login/gov"), 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting to login…</p></div>`;
}
