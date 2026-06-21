import { Navbar } from "../../components/Navbar.js";
import { Footer } from "../../components/Footer.js";
import { db, login, log } from "../../store/db.js";
import { toast } from "../../lib/toast.js";

const META = {
  school:  { title: "School / College / University Login", icon: "🏫", redirect: "#/school/dashboard" },
  gov:     { title: "Government Staff Login",              icon: "🏛️", redirect: "#/gov/dashboard" },
  student: { title: "Student / Parent Login",              icon: "🎓", redirect: "#/student/dashboard" },
};

function buildDemoCreds(role) {
  if (role === "school") {
    return db.getSchools().slice(0, 3).map(
      (s) => `<div style="display:flex;gap:8px;align-items:center;padding:4px 0">
        <span style="font-size:11px;color:#64748b;min-width:80px">🏫 ${s.name.split(" ").slice(0,3).join(" ")}…</span>
        <code>${s.username}</code> / <code>${s.password}</code>
      </div>`
    ).join("");
  }
  if (role === "gov") {
    return db.getGovUsers().map(
      (u) => `<div style="display:flex;gap:8px;align-items:center;padding:4px 0">
        <span style="font-size:11px;color:#64748b;min-width:80px">🏛️ ${u.name.split(" ").slice(0,2).join(" ")}</span>
        <code>${u.username}</code> / <code>${u.password}</code>
      </div>`
    ).join("");
  }
  if (role === "student") {
    return db.getStudents().slice(0, 3).map(
      (st) => `<div style="display:flex;gap:8px;align-items:center;padding:4px 0">
        <span style="font-size:11px;color:#64748b;min-width:80px">🎓 ${st.fullname.split(" ").slice(0,2).join(" ")}</span>
        <code>${st.credentials.username}</code> / <code>${st.credentials.password}</code>
      </div>`
    ).join("");
  }
  return "";
}

export function LoginView(role) {
  role = role || "school";
  const meta = META[role];

  return `
  ${Navbar()}
  <div class="login-wrap">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px">
      <div style="
        width:56px;height:56px;border-radius:16px;
        background:linear-gradient(135deg,#003366,#059669);
        display:flex;align-items:center;justify-content:center;
        font-size:26px;margin:0 auto 12px">
        ${meta.icon}
      </div>
      <h2>${meta.title}</h2>
      <p class="sub">Enter your credentials to access the ${role} panel.</p>
    </div>

    <!-- Role tabs -->
    <div style="display:flex;gap:6px;margin-bottom:20px;background:#f1f5f9;padding:4px;border-radius:10px">
      ${["school","gov","student"].map((r) => `
        <a href="#/login/${r}" style="
          flex:1;text-align:center;padding:8px 6px;border-radius:8px;
          font-size:12px;font-weight:700;text-decoration:none;
          ${r === role
            ? "background:#fff;color:#003366;box-shadow:0 1px 4px rgba(0,0,0,.1)"
            : "color:#64748b"}">
          ${r === "school" ? "🏫 School" : r === "gov" ? "🏛️ Gov" : "🎓 Student"}
        </a>`).join("")}
    </div>

    <div class="tsid-form" id="loginFormWrap">
      <div class="group">
        <label>Username / TSID</label>
        <input id="username" placeholder="${role === "student" ? "e.g. TSID-2026-XXXXXXX" : role === "gov" ? "e.g. gov" : "e.g. mwangaza"}" autocomplete="username">
      </div>
      <div class="group">
        <label>Password</label>
        <input id="password" type="password" placeholder="••••••••" autocomplete="current-password">
      </div>
      <button id="loginBtn" class="btn btn-primary" style="
        width:100%;padding:12px;border-radius:10px;font-size:14px;font-weight:800;
        background:linear-gradient(135deg,#003366,#059669);border:none;cursor:pointer">
        Sign In →
      </button>
    </div>

    <!-- Demo credentials -->
    <div style="
      background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
      padding:12px 14px;margin-top:18px">
      <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;
        letter-spacing:.5px;margin-bottom:8px">Demo Credentials</div>
      <div id="demoCreds" style="font-size:12px;color:#0f172a">
        ${buildDemoCreds(role)}
      </div>
    </div>

    <div style="text-align:center;margin-top:16px">
      <a href="#/" style="font-size:12px;color:#64748b;text-decoration:none">← Back to home</a>
    </div>
  </div>
  ${Footer()}
  `;
}

export function initLogin(role) {
  const btn = document.getElementById("loginBtn");
  if (!btn) return;

  const doLogin = () => {
    const u = (document.getElementById("username")?.value || "").trim();
    const p = document.getElementById("password")?.value || "";
    if (!u || !p) { toast("Please enter your username and password.", "error"); return; }

    let identity = null;

    if (role === "school") {
      const school = db.getSchools().find((s) => s.username === u && s.password === p);
      if (school) identity = { name: school.name, ref: school.code };
    } else if (role === "gov") {
      const govUser = db.getGovUsers().find((g) => g.username === u && g.password === p);
      if (govUser) identity = { name: govUser.name, ref: govUser.id };
    } else if (role === "student") {
      const student = db.getStudents().find(
        (s) => s.credentials && s.credentials.username === u && s.credentials.password === p
      );
      if (student) identity = { name: student.fullname, ref: student.tsid };
    }

    if (!identity) {
      toast("Invalid credentials. Use the demo accounts shown below.", "error");
      return;
    }

    login(role, identity);
    toast("Karibu, " + identity.name + "! Signing you in…", "success");
    setTimeout(() => { window.location.hash = META[role].redirect; }, 500);
  };

  btn.addEventListener("click", doLogin);

  // Enter key support
  ["username", "password"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin();
    });
  });
}
