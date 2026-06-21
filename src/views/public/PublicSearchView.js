// ============================================================================
//  PublicSearchView — search-first: nothing shown until user types
// ============================================================================
import { Navbar, initNavbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db } from "../../store/db.js";
import { escapeHtml } from "../../lib/util.js";

export function PublicSearchView() {
  setTimeout(initNavbar, 0);
  const schools  = db.getSchools();
  const students = db.getStudents();
  const regions  = [...new Set(schools.map(s => s.region))].length;

  return `
  ${Navbar("#/search")}

  <!-- Hero / search section -->
  <section style="
    background:linear-gradient(135deg,#003366 0%,#059669 100%);
    padding:52px 20px 40px;text-align:center">
    <div style="max-width:620px;margin:0 auto">
      <div style="
        display:inline-flex;align-items:center;gap:8px;
        background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);
        border-radius:99px;padding:5px 16px;font-size:11.5px;font-weight:700;
        color:#a7f3d0;margin-bottom:14px;letter-spacing:.4px">
        🔍 PUBLIC VERIFICATION PORTAL
      </div>
      <h1 style="font-size:30px;font-weight:900;color:#fff;
        margin-bottom:8px;line-height:1.2">
        Verify Any Student or School
      </h1>
      <p style="font-size:13.5px;color:#a7f3d0;margin-bottom:24px;line-height:1.6">
        Confirm TSID registration instantly — no login required.
      </p>

      <!-- Search bar -->
      <div style="
        background:#fff;border-radius:14px;
        padding:6px 6px 6px 16px;
        display:flex;gap:8px;align-items:center;
        box-shadow:0 8px 32px rgba(0,0,0,.25)">
        <span style="font-size:18px;color:#94a3b8;flex-shrink:0">🔍</span>
        <input id="globalSearch" autocomplete="off"
          placeholder="Type a name, TSID, school code or region…"
          style="flex:1;border:none;background:transparent;font-size:14px;
            font-family:inherit;outline:none;padding:8px 4px;color:#0f172a;
            min-width:0">
        <select id="searchKind" style="
          border:none;background:#f1f5f9;border-radius:9px;
          padding:9px 10px;font-size:12.5px;font-family:inherit;
          font-weight:700;color:#374151;cursor:pointer;outline:none;flex-shrink:0">
          <option value="all">All</option>
          <option value="schools">Schools</option>
          <option value="students">Students</option>
        </select>
        <button id="clearSearch" style="
          padding:9px 12px;border-radius:9px;border:none;background:#ef4444;
          color:#fff;font-size:12px;font-weight:700;cursor:pointer;
          display:none;flex-shrink:0">✕</button>
      </div>

      <!-- Stats pills under search -->
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:18px">
        ${[
          [`🏫 ${schools.length} Schools`],
          [`🎓 ${students.length} Students`],
          [`🗺 ${regions} Regions`],
        ].map(([t]) => `
          <div style="
            background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2);
            border-radius:99px;padding:4px 14px;
            font-size:12px;font-weight:700;color:#fff">${t}</div>`).join("")}
      </div>
    </div>
  </section>

  <!-- Empty prompt (shown before search) -->
  <div id="searchPrompt" style="text-align:center;padding:56px 24px">
    <div style="font-size:52px;margin-bottom:14px;opacity:.3">🔍</div>
    <h3 style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:6px">
      Start typing to search
    </h3>
    <p style="font-size:13px;color:#64748b;max-width:340px;margin:0 auto;line-height:1.6">
      Search by student name, TSID number, school name, school code, or region.
    </p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px">
      <span style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;
        padding:6px 14px;border-radius:99px;font-size:12px;font-weight:700">
        e.g. "Juma"
      </span>
      <span style="background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;
        padding:6px 14px;border-radius:99px;font-size:12px;font-weight:700;font-family:ui-monospace">
        TSID-2026-A7K9P2X
      </span>
      <span style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;
        padding:6px 14px;border-radius:99px;font-size:12px;font-weight:700">
        e.g. "Arusha" or "DS1024"
      </span>
    </div>
  </div>

  <!-- Results (hidden until search) -->
  <div id="resultsArea" style="display:none;max-width:1000px;margin:0 auto;padding:20px 16px 40px">

    <!-- Schools results -->
    <div id="schoolsSection" style="margin-bottom:32px;display:none">
      <h2 id="schoolsHeading" style="
        font-size:16px;font-weight:800;color:#0f172a;
        margin-bottom:14px;display:flex;align-items:center;gap:8px">
        🏫 Schools
      </h2>
      <div id="schoolsGrid" style="
        display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
      </div>
      <div id="schoolsEmpty" style="display:none">
        <div class="empty-state"><div class="ic">🏫</div><p>No schools match.</p></div>
      </div>
    </div>

    <!-- Students results -->
    <div id="studentsSection" style="display:none">
      <h2 id="studentsHeading" style="
        font-size:16px;font-weight:800;color:#0f172a;
        margin-bottom:14px;display:flex;align-items:center;gap:8px">
        🎓 Students
      </h2>
      <div id="studentsGrid" style="display:flex;flex-direction:column;gap:10px"></div>
      <div id="studentsEmpty" style="display:none">
        <div class="empty-state"><div class="ic">🎓</div><p>No students match.</p></div>
      </div>
    </div>

    <!-- No results -->
    <div id="noResults" style="display:none;text-align:center;padding:40px 20px">
      <div style="font-size:48px;opacity:.2;margin-bottom:12px">😔</div>
      <h3 style="font-size:18px;font-weight:800;color:#0f172a">No results found</h3>
      <p style="color:#64748b;margin-top:6px;font-size:13px">
        Try a different name, TSID number, or school code.
      </p>
    </div>
  </div>

  <style>
    .search-school-card:hover {
      border-color:#059669 !important;
      transform:translateY(-2px);
      box-shadow:0 6px 20px rgba(5,150,105,.12);
    }
    .search-student-row:hover {
      background:#f0fdf4 !important;
    }
  </style>

  ${Footer()}
  `;
}

export function initPublicSearch() {
  const searchEl  = document.getElementById("globalSearch");
  const kindSel   = document.getElementById("searchKind");
  const clearBtn  = document.getElementById("clearSearch");
  const prompt    = document.getElementById("searchPrompt");
  const results   = document.getElementById("resultsArea");
  if (!searchEl) return;

  const schools  = db.getSchools();
  const students = db.getStudents();

  function buildSchoolCard(sc) {
    const cnt = students.filter(st => st.schoolCode === sc.code).length;
    return `
      <a href="#/search/result/school/${encodeURIComponent(sc.code)}"
        style="text-decoration:none;color:inherit">
        <div class="search-school-card" style="
          background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
          padding:16px;display:flex;flex-direction:column;gap:10px;
          transition:all .18s;cursor:pointer">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div style="
              width:44px;height:44px;border-radius:10px;flex-shrink:0;
              background:linear-gradient(135deg,#059669,#047857);
              display:flex;align-items:center;justify-content:center;font-size:20px">🏫</div>
            <span class="badge green" style="flex-shrink:0;font-size:10px">✓ Verified</span>
          </div>
          <div>
            <div style="font-weight:800;font-size:14px;color:#0f172a;line-height:1.3">
              ${escapeHtml(sc.name)}
            </div>
            <div style="font-size:11.5px;color:#64748b;margin-top:2px">${escapeHtml(sc.type)}</div>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            <span style="background:#f0fdf4;color:#166534;font-size:11px;font-weight:700;
              padding:3px 8px;border-radius:6px">📍 ${escapeHtml(sc.region)}</span>
            <span style="background:#eff6ff;color:#1e40af;font-size:11px;font-weight:700;
              padding:3px 8px;border-radius:6px;font-family:ui-monospace">${escapeHtml(sc.code)}</span>
            <span style="background:#f5f3ff;color:#5b21b6;font-size:11px;font-weight:700;
              padding:3px 8px;border-radius:6px">🎓 ${cnt} student${cnt!==1?"s":""}</span>
          </div>
          <div style="font-size:12px;color:#059669;font-weight:700">View school profile →</div>
        </div>
      </a>`;
  }

  function buildStudentRow(st) {
    const photoEl = st.photo
      ? `<img src="${st.photo}" style="width:44px;height:56px;object-fit:cover;border-radius:8px;border:1.5px solid #e2e8f0;flex-shrink:0">`
      : `<div style="width:44px;height:56px;border-radius:8px;background:#f1f5f9;border:1.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:20px;color:#cbd5e1;flex-shrink:0">👤</div>`;

    return `
      <a href="#/search/result/student/${encodeURIComponent(st.tsid)}"
        style="text-decoration:none;color:inherit">
        <div class="search-student-row" style="
          background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;
          padding:14px 16px;display:flex;align-items:center;gap:14px;
          transition:background .15s;cursor:pointer">
          ${photoEl}
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:14px;color:#0f172a;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${escapeHtml(st.fullname)}
            </div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;
              display:flex;gap:10px;flex-wrap:wrap">
              <span>🏫 ${escapeHtml(st.schoolName)}</span>
              <span>📚 ${escapeHtml(st.level || "—")}</span>
            </div>
            <div style="font-size:11px;color:#94a3b8;font-family:ui-monospace;margin-top:2px">
              ${escapeHtml(st.tsid)}
            </div>
          </div>
          <div style="flex-shrink:0">
            <span class="badge green" style="font-size:10px">✓ Verified</span>
          </div>
        </div>
      </a>`;
  }

  function filter() {
    const q    = (searchEl.value || "").trim();
    const kind = kindSel?.value || "all";

    // Toggle UI states
    clearBtn.style.display = q ? "" : "none";

    if (!q) {
      prompt.style.display   = "";
      results.style.display  = "none";
      return;
    }

    prompt.style.display  = "none";
    results.style.display = "";

    const ql = q.toLowerCase();

    // Filter schools
    const matchedSchools = (kind !== "students")
      ? schools.filter(sc =>
          sc.name.toLowerCase().includes(ql) ||
          sc.code.toLowerCase().includes(ql)  ||
          sc.region.toLowerCase().includes(ql) ||
          sc.district.toLowerCase().includes(ql) ||
          sc.type.toLowerCase().includes(ql))
      : [];

    // Filter students
    const matchedStudents = (kind !== "schools")
      ? students.filter(st =>
          st.fullname.toLowerCase().includes(ql)    ||
          st.tsid.toLowerCase().includes(ql)        ||
          (st.schoolName||"").toLowerCase().includes(ql) ||
          (st.region||"").toLowerCase().includes(ql)     ||
          (st.level||"").toLowerCase().includes(ql)      ||
          (st.parentName||"").toLowerCase().includes(ql))
      : [];

    // Render schools
    const schSec   = document.getElementById("schoolsSection");
    const schGrid  = document.getElementById("schoolsGrid");
    const schEmpty = document.getElementById("schoolsEmpty");
    const schHead  = document.getElementById("schoolsHeading");
    if (kind !== "students") {
      schSec.style.display = "";
      schHead.innerHTML = `🏫 Schools <span style="font-size:13px;font-weight:600;color:#64748b">(${matchedSchools.length})</span>`;
      if (matchedSchools.length) {
        schGrid.innerHTML = matchedSchools.map(buildSchoolCard).join("");
        schGrid.style.display = "";
        schEmpty.style.display = "none";
      } else {
        schGrid.style.display  = "none";
        schEmpty.style.display = "";
      }
    } else {
      schSec.style.display = "none";
    }

    // Render students
    const stuSec   = document.getElementById("studentsSection");
    const stuGrid  = document.getElementById("studentsGrid");
    const stuEmpty = document.getElementById("studentsEmpty");
    const stuHead  = document.getElementById("studentsHeading");
    if (kind !== "schools") {
      stuSec.style.display = "";
      stuHead.innerHTML = `🎓 Students <span style="font-size:13px;font-weight:600;color:#64748b">(${matchedStudents.length})</span>`;
      if (matchedStudents.length) {
        stuGrid.innerHTML = matchedStudents.map(buildStudentRow).join("");
        stuGrid.style.display  = "";
        stuEmpty.style.display = "none";
      } else {
        stuGrid.style.display  = "none";
        stuEmpty.style.display = "";
      }
    } else {
      stuSec.style.display = "none";
    }

    // No results at all
    const noRes = document.getElementById("noResults");
    noRes.style.display = (!matchedSchools.length && !matchedStudents.length) ? "" : "none";
  }

  searchEl.addEventListener("input", filter);
  kindSel?.addEventListener("change", filter);
  clearBtn?.addEventListener("click", () => {
    searchEl.value = "";
    filter();
    searchEl.focus();
  });

  setTimeout(() => searchEl.focus(), 80);
}
