import { currentSession, logout, loadAll } from "../store/db.js";
import { showSpinner } from "../lib/loader.js";

import { LandingView }   from "../views/LandingView.js";
import { FormView }      from "../views/FormView.js";
import { IDView }        from "../views/IDView.js";
import { initForm }      from "../js/form.js";
import { initCard }      from "../js/script.js";

import { LoginView, initLogin }     from "../views/auth/LoginView.js";
import { SchoolDashboardView }      from "../views/school/SchoolDashboardView.js";
import { SchoolCreateStudentView, initSchoolCreateStudent } from "../views/school/SchoolCreateStudentView.js";
import { SchoolStudentDBView,     initSchoolStudentDB }     from "../views/school/SchoolStudentDBView.js";
import { SchoolApplicationsView,  initSchoolApplications }  from "../views/school/SchoolApplicationsView.js";
import { SchoolPaymentsView,      initSchoolPayments }      from "../views/school/SchoolPaymentsView.js";
import { SchoolSettingsView,      initSchoolSettings }      from "../views/school/SchoolSettingsView.js";
import { GovDashboardView }        from "../views/gov/GovDashboardView.js";
import { GovStudentsView, initGovStudents } from "../views/gov/GovStudentsView.js";
import { GovSchoolsView,  initGovSchools }  from "../views/gov/GovSchoolsView.js";
import { GovLogsView,     initGovLogs }     from "../views/gov/GovLogsView.js";
import { StudentDashboardView }    from "../views/student/StudentDashboardView.js";
import { StudentIDView,            initStudentID }           from "../views/student/StudentIDView.js";
import { StudentCertificatesView,  initStudentCertificates } from "../views/student/StudentCertificatesView.js";
import { StudentRequestLetterView, initStudentRequestLetter }from "../views/student/StudentRequestLetterView.js";
import { StudentPaymentsView,      initStudentPayments }     from "../views/student/StudentPaymentsView.js";
import { PublicSearchView,  initPublicSearch }  from "../views/public/PublicSearchView.js";
import { StudentResultView, SchoolResultView, initResultView } from "../views/public/SearchResultView.js";

// ── render: load data → build HTML → init ─────────────────────────────────────
async function render(viewFn, initFn) {
  const app = document.getElementById("app");
  if (!app) return;
  showSpinner(app);
  try {
    await loadAll();                                    // refresh cache before every render
    const html = viewFn();
    app.innerHTML = html;
    if (initFn) initFn();
  } catch (err) {
    console.error("[TSID router]", err);
    app.innerHTML = `
      <div class="empty-state" style="margin-top:60px">
        <div class="ic">⚠️</div>
        <p style="color:#ef4444;font-weight:700">Something went wrong loading this page.</p>
        <p style="font-size:12px;color:#64748b;margin-top:4px">${err.message||""}</p>
        <a href="#/" class="btn btn-primary" style="margin-top:16px">← Home</a>
      </div>`;
  }
}

export async function router() {
  const raw = window.location.hash || "#/";
  const app = document.getElementById("app");
  if (!app) return;
  document.body.classList.add("tsid-app");
  window.scrollTo(0, 0);

  if (raw === "#/logout") { logout(); window.location.hash = "#/"; return; }

  const parts = raw.replace(/^#\//, "").split("/");
  const route = parts[0] || "";
  const sub   = parts[1] || "";

  if (route === "create") return render(() => FormView(), initForm);
  if (route === "id")     return render(() => IDView(),   initCard);

  if (route === "login") {
    const role = sub || "school";
    return render(() => LoginView(role), () => initLogin(role));
  }

  if (route === "search") {
    if (sub === "result" && parts[2] === "student")
      return render(() => StudentResultView(decodeURIComponent(parts[3]||"")), initResultView);
    if (sub === "result" && parts[2] === "school")
      return render(() => SchoolResultView(decodeURIComponent(parts[3]||"")),  initResultView);
    return render(PublicSearchView, initPublicSearch);
  }

  if (route === "school") {
    if (!requireRole("school")) return;
    switch(sub) {
      case "dashboard":      return render(SchoolDashboardView);
      case "create-student": return render(SchoolCreateStudentView, initSchoolCreateStudent);
      case "students":       return render(SchoolStudentDBView,     initSchoolStudentDB);
      case "applications":   return render(SchoolApplicationsView,  initSchoolApplications);
      case "payments":       return render(SchoolPaymentsView,      initSchoolPayments);
      case "settings":       return render(SchoolSettingsView,      initSchoolSettings);
    }
  }

  if (route === "gov") {
    if (!requireRole("gov")) return;
    switch(sub) {
      case "dashboard": return render(GovDashboardView);
      case "students":  return render(GovStudentsView, initGovStudents);
      case "schools":   return render(GovSchoolsView,  initGovSchools);
      case "logs":      return render(GovLogsView,     initGovLogs);
    }
  }

  if (route === "student") {
    if (!requireRole("student")) return;
    switch(sub) {
      case "dashboard":      return render(StudentDashboardView);
      case "id":             return render(StudentIDView,            initStudentID);
      case "certificates":   return render(StudentCertificatesView,  initStudentCertificates);
      case "request-letter": return render(StudentRequestLetterView, initStudentRequestLetter);
      case "payments":       return render(StudentPaymentsView,      initStudentPayments);
    }
  }

  return render(LandingView);
}

function requireRole(role) {
  const s = currentSession();
  if (!s || s.role !== role) {
    const app = document.getElementById("app");
    if (app) app.innerHTML = `
      <div class="empty-state" style="margin-top:60px">
        <div class="ic">🔒</div>
        <p>Please sign in as <strong>${role}</strong> to continue.</p>
        <a href="#/login/${role}" class="btn btn-primary" style="margin-top:14px">Sign In</a>
      </div>`;
    return false;
  }
  return true;
}
