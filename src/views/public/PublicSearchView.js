// ============================================================================
//  PublicSearchView — public student/school verification portal
// ============================================================================
import { Navbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db } from "../../store/db.js";
import { MiniIDCard } from "../../components/IDCard.js";
import { escapeHtml } from "../../lib/util.js";

export function PublicSearchView() {
  const schools  = db.getSchools();
  const students = db.getStudents();

  const schoolCards = schools.map((sc) => {
    const cnt = students.filter((st) => st.schoolCode === sc.code).length;
    return `
      <a href="#/search/result/school/${encodeURIComponent(sc.code)}"
        style="text-decoration:none;color:inherit">
        <div style="
          background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;
          padding:20px;display:flex;flex-direction:column;gap:10px;
          transition:all .18s;cursor:pointer"
          class="search-school-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
            <div style="
              width:48px;height:48px;border-radius:12px;flex-shrink:0;
              background:linear-gradient(135deg,#059669,#047857);
              display:flex;align-items:center;justify-content:center;font-size:22px">🏫</div>
            <span class="badge green" style="flex-shrink:0">Verified</span>
          </div>
          <div>
            <div style="font-weight:800;font-size:14px;color:#0f172a;line-height:1.3">${escapeHtml(sc.name)}</div>
            <div style="font-size:11.5px;color:#64748b;margin-top:2px">${escapeHtml(sc.type)}</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <span style="background:#f0fdf4;color:#166534;font-size:11px;font-weight:700;
              padding:3px 8px;border-radius:6px">📍 ${escapeHtml(sc.region)}</span>
            <span style="background:#eff6ff;color:#1e40af;font-size:11px;font-weight:700;
              padding:3px 8px;border-radius:6px;font-family:ui-monospace">${escapeHtml(sc.code)}</span>
            <span style="background:#f5f3ff;color:#5b21b6;font-size:11px;font-weight:700;
              padding:3px 8px;border-radius:6px">🎓 ${cnt} students</span>
          </div>
          <div style="font-size:12px;color:#059669;font-weight:700;display:flex;align-items:center;gap:4px">
            View school details →
          </div>
        </div>
      </a>`;
  }).join("");

  const studentCards = students.map((st) => `
    <a href="#/search/result/student/${encodeURIComponent(st.tsid)}"
      style="text-decoration:none;color:inherit;display:block">
      ${MiniIDCard(st)}
    </a>`).join("");

  return `
  ${Navbar("#/search")}

  <!-- Hero -->
  <section style="
    background:linear-gradient(135deg,#003366 0%,#059669 100%);
    padding:52px 24px;text-align:center">
    <div style="max-width:680px;margin:0 auto">
      <div style="
        display:inline-flex;align-items:center;gap:8px;
        background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);
        border-radius:99px;padding:6px 16px;font-size:12px;font-weight:700;
        color:#a7f3d0;margin-bottom:16px;letter-spacing:.4px">
        🔍 PUBLIC VERIFICATION PORTAL
      </div>
      <h1 style="font-size:36px;font-weight:900;color:#fff;margin-bottom:10px;line-height:1.15">
        Verify Any Student or School
      </h1>
      <p style="font-size:15px;color:#a7f3d0;margin-bottom:28px;line-height:1.6">
        Instantly confirm TSID registration for any student or school in Tanzania's national registry — no login required.
      </p>

      <!-- Search bar -->
      <div style="
        background:#fff;border-radius:14px;padding:8px 8px 8px 18px;
        display:flex;gap:8px;align-items:center;
        box-shadow:0 8px 32px rgba(0,0,0,.2)">
        <span style="font-size:18px;color:#94a3b8">🔍</span>
        <input id="globalSearch" placeholder="Search by name, TSID number, school code, or region…" style="
          flex:1;border:none;background:transparent;font-size:14px;
          font-family:inherit;outline:none;padding:6px 4px;color:#0f172a">
        <select id="searchKind" style="
          border:none;background:#f1f5f9;border-radius:9px;
          padding:9px 12px;font-size:13px;font-family:inherit;
          font-weight:700;color:#374151;cursor:pointer;outline:none">
          <option value="all">All</option>
          <option value="schools">Schools only</option>
          <option value="students">Students only</option>
        </select>
        <button id="clearSearch" style="
          padding:9px 14px;border-radius:9px;border:none;background:#003366;
          color:#fff;font-size:12px;font-weight:700;cursor:pointer;
          display:none">✕ Clear</button>
      </div>
    </div>
  </section>

  <!-- Stats band -->
  <div style="background:#fff;border-bottom:1.5px solid #e2e8f0">
    <div style="max-width:1100px;margin:0 auto;padding:16px 24px;
      display:flex;gap:32px;justify-content:center;flex-wrap:wrap">
      ${[
        ["Schools registered",  schools.length,  "🏫"],
        ["Students verified",   students.length, "🎓"],
        ["Regions covered",     [...new Set(schools.map(s => s.region))].length, "🗺"],
      ].map(([label, val, icon]) => `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">${icon}</span>
          <div>
            <div style="font-size:20px;font-weight:900;color:#003366;line-height:1">${val}</div>
            <div style="font-size:11.5px;color:#64748b;font-weight:600">${label}</div>
          </div>
        </div>`).join(`<div style="width:1px;height:36px;background:#e2e8f0"></div>`)}
    </div>
  </div>

  <!-- Results -->
  <div style="max-width:1100px;margin:0 auto;padding:32px 24px">

    <!-- Schools section -->
    <div id="schoolsSection" style="margin-bottom:40px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h2 id="schoolsHeading" style="font-size:18px;font-weight:900;color:#0f172a">
          🏫 Schools <span style="font-size:14px;font-weight:600;color:#64748b">(${schools.length})</span>
        </h2>
      </div>
      <div id="schoolsGrid" style="
        display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        ${schoolCards}
      </div>
      <div id="schoolsEmpty" style="display:none">
        <div class="empty-state"><div class="ic">🏫</div><p>No schools match your search.</p></div>
      </div>
    </div>

    <!-- Students section -->
    <div id="studentsSection">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h2 id="studentsHeading" style="font-size:18px;font-weight:900;color:#0f172a">
          🎓 Students <span style="font-size:14px;font-weight:600;color:#64748b">(${students.length})</span>
        </h2>
      </div>
      <div id="studentsGrid" style="
        display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">
        ${studentCards}
      </div>
      <div id="studentsEmpty" style="display:none">
        <div class="empty-state"><div class="ic">🎓</div><p>No students match your search.</p></div>
      </div>
    </div>

    <!-- No results at all -->
    <div id="noResults" style="display:none;text-align:center;padding:60px 20px">
      <div style="font-size:56px;opacity:.3">🔍</div>
      <h3 style="font-size:20px;font-weight:800;color:#0f172a;margin-top:14px">No results found</h3>
      <p style="color:#64748b;margin-top:6px">Try a different name, TSID number, or school code.</p>
    </div>
  </div>

  <style>
    .search-school-card:hover {
      border-color:#059669 !important;
      transform:translateY(-2px);
      box-shadow:0 8px 24px rgba(5,150,105,.12);
    }
  </style>

  ${Footer()}
  `;
}

export function initPublicSearch() {
  const searchEl   = document.getElementById("globalSearch");
  const kindSel    = document.getElementById("searchKind");
  const clearBtn   = document.getElementById("clearSearch");
  const schSection = document.getElementById("schoolsSection");
  const stuSection = document.getElementById("studentsSection");

  if (!searchEl) return;

  function filter() {
    const q    = (searchEl.value || "").toLowerCase().trim();
    const kind = kindSel?.value || "all";

    if (clearBtn) clearBtn.style.display = q ? "" : "none";

    // Schools
    const showSchools = kind !== "students";
    schSection.style.display = showSchools ? "" : "none";
    if (showSchools) {
      let visible = 0;
      document.querySelectorAll("#schoolsGrid > a").forEach((card) => {
        const show = !q || card.textContent.toLowerCase().includes(q);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      const heading = document.getElementById("schoolsHeading");
      if (heading) heading.innerHTML = `🏫 Schools <span style="font-size:14px;font-weight:600;color:#64748b">(${visible})</span>`;
      document.getElementById("schoolsEmpty").style.display = visible === 0 && q ? "" : "none";
      document.getElementById("schoolsGrid").style.display  = visible === 0 && q ? "none" : "";
    }

    // Students
    const showStudents = kind !== "schools";
    stuSection.style.display = showStudents ? "" : "none";
    if (showStudents) {
      let visible = 0;
      document.querySelectorAll("#studentsGrid > a").forEach((card) => {
        const show = !q || card.textContent.toLowerCase().includes(q);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      const heading = document.getElementById("studentsHeading");
      if (heading) heading.innerHTML = `🎓 Students <span style="font-size:14px;font-weight:600;color:#64748b">(${visible})</span>`;
      document.getElementById("studentsEmpty").style.display = visible === 0 && q ? "" : "none";
      document.getElementById("studentsGrid").style.display  = visible === 0 && q ? "none" : "";
    }

    // Global no-results
    const noResults = document.getElementById("noResults");
    if (noResults) {
      const allHidden = (kind !== "students" && schSection.style.display === "none") ||
        (kind !== "schools" && stuSection.style.display === "none");
      noResults.style.display = (q && kind === "all" &&
        document.getElementById("schoolsGrid").style.display === "none" &&
        document.getElementById("studentsGrid").style.display === "none") ? "" : "none";
    }
  }

  searchEl.addEventListener("input",  filter);
  kindSel?.addEventListener("change", filter);
  clearBtn?.addEventListener("click", () => {
    searchEl.value = "";
    filter();
    searchEl.focus();
  });

  // Autofocus search bar
  setTimeout(() => searchEl.focus(), 100);
}
