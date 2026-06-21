import { Navbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db } from "../../store/db.js";
import { MiniIDCard } from "../../components/IDCard.js";
import { escapeHtml } from "../../lib/util.js";

export function PublicSearchView() {
  const schools = db.getSchools();
  const students = db.getStudents();

  const schoolCards = schools
    .map(
      (sc) => {
        const count = students.filter((st) => st.schoolCode === sc.code).length;
        return `<a href="#/search/result/school/${encodeURIComponent(sc.code)}" class="role-card" style="text-decoration:none;color:inherit">
          <div class="ic green">🏫</div>
          <h3>${escapeHtml(sc.name)}</h3>
          <p style="font-size:12px;color:#64748b">${escapeHtml(sc.type)} · Code <span class="mono" style="font-family:ui-monospace;font-weight:700">${escapeHtml(sc.code)}</span></p>
          <ul>
            <li>${escapeHtml(sc.region)}, ${escapeHtml(sc.district)}</li>
            <li>${count} student${count !== 1 ? "s" : ""} registered</li>
            <li>${escapeHtml(sc.contact)}</li>
          </ul>
        </a>`;
      }
    )
    .join("");

  const studentCards = students
    .map((st) => `<a href="#/search/result/student/${encodeURIComponent(st.tsid)}" style="text-decoration:none;color:inherit">${MiniIDCard(st)}</a>`)
    .join("");

  return `
  ${Navbar("#/search")}

  <section class="bg-gradient-to-r from-blue-900 to-green-700 text-white py-12">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-4xl font-black mb-2">Public Verification Search</h1>
      <p class="opacity-90">Search and verify any school or student registered with TSID — no login required.</p>
    </div>
  </section>

  <section class="max-w-6xl mx-auto py-10 px-6">
    <!-- Search bar -->
    <div class="search-bar" style="margin-bottom:30px">
      <input id="globalSearch" placeholder="Search by name, TSID, school code, or region...">
      <select id="searchKind">
        <option value="all">All</option>
        <option value="schools">Schools only</option>
        <option value="students">Students only</option>
      </select>
    </div>

    <!-- Schools section -->
    <div id="schoolsSection" style="margin-bottom:36px">
      <h2 style="font-size:18px;font-weight:900;color:#003366;margin-bottom:14px">🏫 Schools (${schools.length})</h2>
      <div class="role-grid">${schoolCards}</div>
    </div>

    <!-- Students section -->
    <div id="studentsSection">
      <h2 style="font-size:18px;font-weight:900;color:#003366;margin-bottom:14px">🎓 Students (${students.length})</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px">${studentCards}</div>
    </div>
  </section>

  ${Footer()}
  `;
}

export function initPublicSearch() {
  const input = document.getElementById("globalSearch");
  const kindSel = document.getElementById("searchKind");
  if (!input) return;

  function filter() {
    const q = (input.value || "").toLowerCase().trim();
    const kind = kindSel.value;
    const schoolsSection = document.getElementById("schoolsSection");
    const studentsSection = document.getElementById("studentsSection");

    // Schools
    if (kind === "students") {
      schoolsSection.style.display = "none";
    } else {
      schoolsSection.style.display = "";
      let visible = 0;
      schoolsSection.querySelectorAll(".role-card").forEach((card) => {
        const text = card.textContent.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      const heading = schoolsSection.querySelector("h2");
      if (heading) heading.textContent = `🏫 Schools (${visible})`;
    }

    // Students
    if (kind === "schools") {
      studentsSection.style.display = "none";
    } else {
      studentsSection.style.display = "";
      let visible = 0;
      studentsSection.querySelectorAll("a").forEach((card) => {
        const text = card.textContent.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      const heading = studentsSection.querySelector("h2");
      if (heading) heading.textContent = `🎓 Students (${visible})`;
    }
  }

  input.addEventListener("input", filter);
  kindSel.addEventListener("change", filter);
}
