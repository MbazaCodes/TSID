import { Navbar }  from "../../components/Navbar.js";
import { Footer }  from "../../components/Footer.js";
import { db, login, log } from "../../store/db.js";
import { toast }   from "../../lib/toast.js";

const META = {
  school:  { title: "School Login",    icon: "🏫", color: "#059669", redirect: "#/school/dashboard" },
  gov:     { title: "Government Login", icon: "🏛️", color: "#003366", redirect: "#/gov/dashboard" },
  student: { title: "Student Login",   icon: "🎓", color: "#7c3aed", redirect: "#/student/dashboard" },
};

// Demo creds read from cache (loadAll already ran before this view renders)
function demoCreds(role) {
  if (role === "school") {
    return db.getSchools().slice(0, 3).map(s =>
      `<div style="padding:4px 0;font-size:12px">
        🏫 <strong>${s.name.split(" ").slice(0,3).join(" ")}</strong>
        — <code>${s.username}</code> / <code>${s.password}</code>
      </div>`).join("");
  }
  if (role === "gov") {
    return db.getGovUsers().map(u =>
      `<div style="padding:4px 0;font-size:12px">
        🏛️ <strong>${u.name.split(" ").slice(0,2).join(" ")}</strong>
        — <code>${u.username}</code> / <code>${u.password}</code>
      </div>`).join("");
  }
  if (role === "student") {
    return db.getStudents().slice(0, 3).map(st =>
      `<div style="padding:4px 0;font-size:12px">
        🎓 <strong>${st.fullname.split(" ").slice(0,2).join(" ")}</strong>
        — <code>${st.credentials.username}</code> / <code>${st.credentials.password}</code>
      </div>`).join("");
  }
  return "";
}

export function LoginView(role) {
  role = role || "school";
  const m = META[role] || META.school;

  return `
  ${Navbar()}
  <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:24px">
    <div style="
      width:100%;max-width:420px;background:#fff;border-radius:20px;
      padding:36px 32px;box-shadow:0 16px 48px rgba(0,0,0,.1);
      border:1.5px solid #e2e8f0">

      <!-- Icon + title -->
      <div style="text-align:center;margin-bottom:26px">
        <div style="
          width:60px;height:60px;border-radius:16px;
          background:linear-gradient(135deg,${m.color},${m.color}cc);
          display:flex;align-items:center;justify-content:center;
          font-size:28px;margin:0 auto 14px">
          ${m.icon}
        </div>
        <h2 style="font-size:20px;font-weight:900;color:#0f172a;margin-bottom:4px">${m.title}</h2>
        <p style="font-size:13px;color:#64748b">Enter your credentials to continue</p>
      </div>

      <!-- Role tabs -->
      <div style="display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:12px;margin-bottom:24px">
        ${["school","gov","student"].map(r => `
          <a href="#/login/${r}" style="
            flex:1;text-align:center;padding:8px 4px;border-radius:9px;
            font-size:12px;font-weight:700;text-decoration:none;
            ${r === role
              ? `background:#fff;color:${m.color};box-shadow:0 1px 4px rgba(0,0,0,.1)`
              : "color:#94a3b8"}">
            ${r === "school" ? "🏫 School" : r === "gov" ? "🏛️ Gov" : "🎓 Student"}
          </a>`).join("")}
      </div>

      <!-- Form -->
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:5px">
          Username / TSID
        </label>
        <input id="loginUser" type="text" autocomplete="username"
          placeholder="${role === "student" ? "TSID-2026-XXXXXXX" : role === "gov" ? "gov" : "mwangaza"}"
          style="
            width:100%;padding:11px 14px;border:1.5px solid #d1d5db;border-radius:10px;
            font-size:14px;font-family:inherit;outline:none;
            transition:border-color .15s;box-sizing:border-box">
      </div>
      <div style="margin-bottom:22px">
        <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:5px">
          Password
        </label>
        <input id="loginPass" type="password" autocomplete="current-password"
          placeholder="••••••••"
          style="
            width:100%;padding:11px 14px;border:1.5px solid #d1d5db;border-radius:10px;
            font-size:14px;font-family:inherit;outline:none;
            transition:border-color .15s;box-sizing:border-box">
      </div>

      <button id="loginBtn" type="button" style="
        width:100%;padding:13px;border-radius:12px;border:none;cursor:pointer;
        background:linear-gradient(135deg,${m.color},${m.color}cc);
        color:#fff;font-size:15px;font-weight:800;
        box-shadow:0 4px 14px rgba(0,0,0,.15);
        transition:opacity .15s">
        Sign In →
      </button>

      <!-- Demo creds -->
      <div style="
        margin-top:20px;background:#f8fafc;border:1px solid #e2e8f0;
        border-radius:12px;padding:14px 16px">
        <div style="font-size:11px;font-weight:800;color:#94a3b8;
          text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">
          Demo credentials
        </div>
        ${demoCreds(role)}
      </div>

      <div style="text-align:center;margin-top:16px">
        <a href="#/" style="font-size:12px;color:#94a3b8;text-decoration:none">← Back to home</a>
      </div>
    </div>
  </div>
  ${Footer()}
  `;
}

export function initLogin(role) {
  // Focus username field
  setTimeout(() => document.getElementById("loginUser")?.focus(), 50);

  const btn = document.getElementById("loginBtn");
  if (!btn) return;

  function doLogin() {
    const u = (document.getElementById("loginUser")?.value || "").trim();
    const p =  document.getElementById("loginPass")?.value || "";

    if (!u || !p) { toast("Please enter your username and password.", "error"); return; }

    btn.textContent = "Signing in…";
    btn.style.opacity = ".7";

    let identity = null;

    if (role === "school") {
      const school = db.getSchools().find(s => s.username === u && s.password === p);
      if (school) identity = { name: school.name, ref: school.code };
    } else if (role === "gov") {
      const g = db.getGovUsers().find(g => g.username === u && g.password === p);
      if (g) identity = { name: g.name, ref: g.id };
    } else if (role === "student") {
      const st = db.getStudents().find(s => s.credentials?.username === u && s.credentials?.password === p);
      if (st) identity = { name: st.fullname, ref: st.tsid };
    }

    if (!identity) {
      toast("Invalid credentials. Check the demo accounts below.", "error");
      btn.textContent = "Sign In →";
      btn.style.opacity = "1";
      return;
    }

    login(role, identity);
    toast(`Karibu, ${identity.name}!`, "success");
    setTimeout(() => { window.location.hash = META[role].redirect; }, 400);
  }

  btn.addEventListener("click", doLogin);
  document.getElementById("loginUser")?.addEventListener("keydown", e => { if (e.key==="Enter") doLogin(); });
  document.getElementById("loginPass")?.addEventListener("keydown", e => { if (e.key==="Enter") doLogin(); });
}
