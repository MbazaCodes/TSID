import { ensureSeed, currentSession, logout } from "../store/db.js";

import { LandingView } from "../views/LandingView.js";
import { FormView } from "../views/FormView.js";
import { IDView } from "../views/IDView.js";
import { initForm } from "../js/form.js";
import { initCard } from "../js/script.js";

// Auth
import { LoginView, initLogin } from "../views/auth/LoginView.js";

// School panel
import { SchoolDashboardView } from "../views/school/SchoolDashboardView.js";
import { SchoolCreateStudentView, initSchoolCreateStudent } from "../views/school/SchoolCreateStudentView.js";
import { SchoolStudentDBView, initSchoolStudentDB } from "../views/school/SchoolStudentDBView.js";
import { SchoolApplicationsView, initSchoolApplications } from "../views/school/SchoolApplicationsView.js";
import { SchoolPaymentsView, initSchoolPayments } from "../views/school/SchoolPaymentsView.js";
import { SchoolSettingsView, initSchoolSettings } from "../views/school/SchoolSettingsView.js";

// Gov panel
import { GovDashboardView } from "../views/gov/GovDashboardView.js";
import { GovStudentsView, initGovStudents } from "../views/gov/GovStudentsView.js";
import { GovSchoolsView, initGovSchools } from "../views/gov/GovSchoolsView.js";
import { GovLogsView, initGovLogs } from "../views/gov/GovLogsView.js";

// Student panel
import { StudentDashboardView } from "../views/student/StudentDashboardView.js";
import { StudentIDView, initStudentID } from "../views/student/StudentIDView.js";
import { StudentCertificatesView, initStudentCertificates } from "../views/student/StudentCertificatesView.js";
import { StudentRequestLetterView, initStudentRequestLetter } from "../views/student/StudentRequestLetterView.js";
import { StudentPaymentsView, initStudentPayments } from "../views/student/StudentPaymentsView.js";

// Public search
import { PublicSearchView, initPublicSearch } from "../views/public/PublicSearchView.js";
import { StudentResultView, SchoolResultView, initResultView } from "../views/public/SearchResultView.js";

export function router() {
  ensureSeed();

  const raw = window.location.hash || "#/";
  const app = document.getElementById("app");
  if (!app) return;

  document.body.classList.add("tsid-app");

  // Scroll to top on route change
  window.scrollTo(0, 0);

  // Handle logout
  if (raw === "#/logout") {
    logout();
    window.location.hash = "#/";
    return;
  }

  // Parse path + optional params
  const parts = raw.replace(/^#\//, "").split("/");
  const route = parts[0] || "";
  const sub = parts[1] || "";

  // ----- Original flows (kept for backwards compatibility) -----
  if (route === "create") {
    app.innerHTML = FormView();
    initForm();
    return;
  }
  if (route === "id") {
    app.innerHTML = IDView();
    initCard();
    return;
  }

  // ----- Auth -----
  if (route === "login") {
    const role = sub || "school";
    app.innerHTML = LoginView(role);
    initLogin(role);
    return;
  }

  // ----- Public search -----
  if (route === "search") {
    if (sub === "result" && parts[2] === "student") {
      app.innerHTML = StudentResultView(decodeURIComponent(parts[3] || ""));
      initResultView();
      return;
    }
    if (sub === "result" && parts[2] === "school") {
      app.innerHTML = SchoolResultView(decodeURIComponent(parts[3] || ""));
      initResultView();
      return;
    }
    app.innerHTML = PublicSearchView();
    initPublicSearch();
    return;
  }

  // ----- School panel -----
  if (route === "school") {
    if (!requireRole("school")) return;
    switch (sub) {
      case "dashboard":
        app.innerHTML = SchoolDashboardView();
        return;
      case "create-student":
        app.innerHTML = SchoolCreateStudentView();
        initSchoolCreateStudent();
        return;
      case "students":
        app.innerHTML = SchoolStudentDBView();
        initSchoolStudentDB();
        return;
      case "applications":
        app.innerHTML = SchoolApplicationsView();
        initSchoolApplications();
        return;
      case "payments":
        app.innerHTML = SchoolPaymentsView();
        initSchoolPayments();
        return;
      case "settings":
        app.innerHTML = SchoolSettingsView();
        initSchoolSettings();
        return;
    }
  }

  // ----- Gov panel -----
  if (route === "gov") {
    if (!requireRole("gov")) return;
    switch (sub) {
      case "dashboard":
        app.innerHTML = GovDashboardView();
        return;
      case "students":
        app.innerHTML = GovStudentsView();
        initGovStudents();
        return;
      case "schools":
        app.innerHTML = GovSchoolsView();
        initGovSchools();
        return;
      case "logs":
        app.innerHTML = GovLogsView();
        initGovLogs();
        return;
    }
  }

  // ----- Student panel -----
  if (route === "student") {
    if (!requireRole("student")) return;
    switch (sub) {
      case "dashboard":
        app.innerHTML = StudentDashboardView();
        return;
      case "id":
        app.innerHTML = StudentIDView();
        initStudentID();
        return;
      case "certificates":
        app.innerHTML = StudentCertificatesView();
        initStudentCertificates();
        return;
      case "request-letter":
        app.innerHTML = StudentRequestLetterView();
        initStudentRequestLetter();
        return;
      case "payments":
        app.innerHTML = StudentPaymentsView();
        initStudentPayments();
        return;
    }
  }

  // ----- Landing (default) -----
  app.innerHTML = LandingView();
}

function requireRole(role) {
  const s = currentSession();
  if (!s || s.role !== role) {
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div class="empty-state" style="margin-top:60px">
          <div class="ic">🔒</div>
          <p>Access denied — please sign in as <strong>${role}</strong>.</p>
          <a href="#/login/${role}" class="btn btn-primary" style="margin-top:14px">Go to Login</a>
        </div>`;
    }
    return false;
  }
  return true;
}
