import { Shell } from "../../components/Shell.js";
import { currentSession, db } from "../../store/db.js";
import { fmtDate, escapeHtml } from "../../lib/util.js";

const LINKS = [
  { href: "#/gov/dashboard", label: "Dashboard",     icon: "▣" },
  { href: "#/gov/students",  label: "Students",      icon: "🎓" },
  { href: "#/gov/schools",   label: "Schools",       icon: "🏫" },
  { href: "#/gov/logs",      label: "Activity Logs", icon: "📋" },
];

export function GovStudentsView() {
  const s = currentSession();
  if (!s || s.role !== "gov") return redirectLogin();

  const students = db.getStudents();
  const schools  = db.getSchools();
  const regions  = [...new Set(schools.map(sc => sc.region))];
  const active   = students.filter(st => st.status === "active").length;
  const withPhoto= students.filter(st => st.photo).length;

  const html = `
    <!-- Page head -->
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;
        flex-wrap:wrap;gap:12px;margin-bottom:16px">
        <div>
          <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin-bottom:4px">
            🎓 National Students Database
          </h1>
          <p style="font-size:13px;color:#64748b">
            ${students.length} students across ${schools.length} schools in ${regions.length} regions
          </p>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="rg-4" style="margin-bottom:16px">
        ${[
          ["Total",       students.length,  "#003366","#eff6ff","#bfdbfe","👥"],
          ["Active",      active,           "#065f46","#ecfdf5","#6ee7b7","✅"],
          ["With Photos", withPhoto,        "#7c3aed","#f5f3ff","#c4b5fd","📷"],
          ["Schools",     schools.length,   "#92400e","#fffbeb","#fcd34d","🏫"],
        ].map(([label,val,tc,bg,bdr,icon]) => `
          <div style="background:${bg};border:1.5px solid ${bdr};border-radius:14px;padding:14px 16px">
            <div style="font-size:22px;margin-bottom:6px">${icon}</div>
            <div style="font-size:20px;font-weight:900;color:${tc};line-height:1">${val}</div>
            <div style="font-size:11px;font-weight:700;color:${tc};opacity:.7;margin-top:3px">${label}</div>
          </div>`).join("")}
      </div>
    </div>

    <!-- Search / filter bar -->
    <div style="
      background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
      padding:12px 14px;margin-bottom:16px;
      display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div style="flex:1;min-width:180px;display:flex;align-items:center;gap:8px;
        background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px">
        <span style="color:#94a3b8;font-size:15px">🔍</span>
        <input id="searchInput" placeholder="Search by name, TSID or school…" style="
          border:none;background:transparent;padding:9px 4px;
          font-size:13px;width:100%;font-family:inherit;outline:none">
      </div>
      <select id="searchRegion" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:13px;background:#f8fafc;font-family:inherit">
        <option value="">All regions</option>
        ${regions.map(r => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("")}
      </select>
      <select id="searchSchool" style="
        padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:13px;background:#f8fafc;font-family:inherit;max-width:200px">
        <option value="">All schools</option>
        ${schools.map(sc => `<option value="${escapeHtml(sc.code)}">${escapeHtml(sc.name)}</option>`).join("")}
      </select>
      <div id="resultCount" style="font-size:12px;color:#64748b;font-weight:700;white-space:nowrap">
        ${students.length} students
      </div>
    </div>

    <!-- Students list — card style, not table -->
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:14px 18px;border-bottom:1px solid #f1f5f9;
        display:flex;align-items:center;justify-content:space-between">
        <div style="font-weight:800;font-size:14px;color:#0f172a">
          All Students
        </div>
        <span id="tableCount" style="font-size:12px;color:#64748b">${students.length} records</span>
      </div>

      ${students.length === 0
        ? `<div class="empty-state"><div class="ic">📭</div><p>No students registered nationally yet.</p></div>`
        : `<div style="overflow-x:auto">
            <table class="tsid-table" id="studentsTable">
              <thead>
                <tr>
                  <th style="width:48px">Photo</th>
                  <th>Student</th>
                  <th>School</th>
                  <th>Region</th>
                  <th class="hide-mobile">Level</th>
                  <th class="hide-mobile">Issued</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${students.map(st => {
                  const photoEl = st.photo
                    ? `<img src="${st.photo}" style="width:38px;height:48px;object-fit:cover;border-radius:7px;border:1.5px solid #e2e8f0;display:block">`
                    : `<div style="width:38px;height:48px;border-radius:7px;background:#f1f5f9;border:1.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:16px;color:#cbd5e1">👤</div>`;
                  return `
                  <tr data-name="${escapeHtml(st.fullname.toLowerCase())}"
                      data-tsid="${escapeHtml(st.tsid.toLowerCase())}"
                      data-school="${escapeHtml(st.schoolCode||"")}"
                      data-region="${escapeHtml(st.region||"")}">
                    <td>${photoEl}</td>
                    <td>
                      <div style="font-weight:700;font-size:13px">${escapeHtml(st.fullname)}</div>
                      <div style="font-size:10.5px;color:#94a3b8;font-family:ui-monospace;margin-top:1px">${escapeHtml(st.tsid)}</div>
                      <div style="font-size:11px;color:#64748b;margin-top:1px">${escapeHtml(st.gender||"—")} · ${fmtDate(st.dob)}</div>
                    </td>
                    <td>
                      <div style="font-size:12.5px;font-weight:600">${escapeHtml(st.schoolName||"—")}</div>
                      <div style="font-size:11px;color:#64748b;font-family:ui-monospace">${escapeHtml(st.schoolCode||"")}</div>
                    </td>
                    <td style="font-size:12.5px">${escapeHtml(st.region||"—")}</td>
                    <td class="hide-mobile" style="font-size:12.5px">${escapeHtml(st.level||"—")}</td>
                    <td class="hide-mobile" style="font-size:12px;color:#64748b">${fmtDate(st.issueDate)}</td>
                    <td><span class="badge green" style="font-size:10px">Active</span></td>
                    <td>
                      <button class="btn btn-outline btn-sm" data-view="${escapeHtml(st.tsid)}"
                        style="white-space:nowrap;font-size:11px">
                        View →
                      </button>
                    </td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
            <div id="emptyFilter" style="display:none">
              <div class="empty-state"><div class="ic">🔍</div><p>No students match your filters.</p></div>
            </div>
          </div>`}
    </div>
  `;

  return Shell("Government", "#/gov/students", LINKS, html);
}

export function initGovStudents() {
  const searchEl  = document.getElementById("searchInput");
  const regionSel = document.getElementById("searchRegion");
  const schoolSel = document.getElementById("searchSchool");
  const tbody     = document.querySelector("#studentsTable tbody");
  const countEl   = document.getElementById("resultCount");
  const tableCount= document.getElementById("tableCount");
  const emptyEl   = document.getElementById("emptyFilter");
  const tableEl   = document.getElementById("studentsTable");

  function filter() {
    if (!tbody) return;
    const q  = (searchEl?.value||"").toLowerCase().trim();
    const r  = regionSel?.value||"";
    const sc = schoolSel?.value||"";
    let vis = 0;

    tbody.querySelectorAll("tr").forEach(row => {
      const matchQ = !q  || row.dataset.name.includes(q) || row.dataset.tsid.includes(q)
                          || row.textContent.toLowerCase().includes(q);
      const matchR = !r  || row.dataset.region === r;
      const matchS = !sc || row.dataset.school === sc;
      const show = matchQ && matchR && matchS;
      row.style.display = show ? "" : "none";
      if (show) vis++;
    });

    const txt = `${vis} student${vis!==1?"s":""}`;
    if (countEl)   countEl.textContent   = txt;
    if (tableCount)tableCount.textContent= `${vis} records`;
    if (emptyEl && tableEl) {
      emptyEl.style.display = vis===0 ? "" : "none";
      tableEl.style.display = vis===0 ? "none" : "";
    }
  }

  searchEl?.addEventListener("input",  filter);
  regionSel?.addEventListener("change",filter);
  schoolSel?.addEventListener("change",filter);

  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.hash = "#/search/result/student/" + encodeURIComponent(btn.getAttribute("data-view"));
    });
  });
}

function redirectLogin() {
  setTimeout(() => window.location.hash = "#/login/gov", 0);
  return `<div class="empty-state"><div class="ic">🔒</div><p>Redirecting…</p></div>`;
}
