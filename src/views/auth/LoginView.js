import { Navbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db, login, log } from "../../store/db.js";
import { toast } from "../../lib/toast.js";

const DEMO = {
  school: [
    { label: "Shule Ya Msingi Mwangaza", username: "mwangaza", password: "school123" },
    { label: "Arusha Secondary School", username: "arusha", password: "school123" },
    { label: "Mbeya University College", username: "mbeya", password: "school123" },
  ],
  gov: [
    { label: "Government Officer", username: "gov", password: "gov123" },
  ],
  student: [
    { label: "Juma A. Mwanza", username: "TSID-2026-A7K9P2X", password: "student123" },
    { label: "Neema Joseph Komba", username: "TSID-2026-B3M8Q1Y", password: "student123" },
    { label: "Grace Baraka Mushi", username: "TSID-2026-C5T9Z7W", password: "student123" },
  ],
};

const META = {
  school: { title: "School / College / University Login", redirect: "#/school/dashboard" },
  gov: { title: "Government Staff Login", redirect: "#/gov/dashboard" },
  student: { title: "Student / Parent Login", redirect: "#/student/dashboard" },
};

export function LoginView(role) {
  role = role || "school";
  const meta = META[role];
  const creds = DEMO[role] || [];

  const credsHtml = creds
    .map(
      (c) =>
        `<div>• ${c.label}: <code>${c.username}</code> / <code>${c.password}</code></div>`
    )
    .join("");

  return `
  ${Navbar()}
  <div class="login-wrap">
    <h2>${meta.title}</h2>
    <p class="sub">Enter your credentials to access the ${role} panel.</p>

    <form class="tsid-form" id="loginForm">
      <div class="group">
        <label>Username / TSID</label>
        <input id="username" placeholder="e.g. mwangaza" required>
      </div>
      <div class="group">
        <label>Password</label>
        <input id="password" type="password" placeholder="••••••••" required>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%">Sign In</button>
    </form>

    <div class="demo-creds">
      <strong>Demo credentials</strong>
      <div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">${credsHtml}</div>
    </div>

    <div style="text-align:center;margin-top:14px">
      <a href="#/" style="font-size:12px;color:#64748b;text-decoration:none">← Back to home</a>
    </div>
  </div>
  ${Footer()}
  `;
}

export function initLogin(role) {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value;

    let identity = null;

    if (role === "school") {
      const school = db.getSchools().find(
        (s) => s.username === u && s.password === p
      );
      if (school) identity = { name: school.name, ref: school.code };
    } else if (role === "gov") {
      if (u === "gov" && p === "gov123") identity = { name: "Government Officer", ref: "GOV-001" };
    } else if (role === "student") {
      const student = db.getStudents().find(
        (s) => s.credentials && s.credentials.username === u && s.credentials.password === p
      );
      if (student) identity = { name: student.fullname, ref: student.tsid };
    }

    if (!identity) {
      toast("Invalid credentials. Try the demo accounts below.", "error");
      return;
    }

    login(role, identity);
    toast("Welcome, " + identity.name + "!", "success");
    setTimeout(() => {
      window.location.hash = META[role].redirect;
    }, 400);
  });
}
