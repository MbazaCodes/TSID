import { Navbar, initNavbar } from "../../components/Navbar.js";
import { Footer }  from "../../components/Footer.js";
import { supabase } from "../../store/supabase.js";
import { toast }   from "../../lib/toast.js";

const ROLES = [
  { value: "school",  label: "School",  redirect: "#/school/dashboard" },
  { value: "gov",     label: "Government", redirect: "#/gov/dashboard" },
  { value: "student", label: "Student", redirect: "#/student/dashboard" },
];

export function LoginView(role) {
  role = role || "school";
  setTimeout(initNavbar, 0);

  const current = ROLES.find(r => r.value === role) || ROLES[0];

  return `
  ${Navbar()}
  <div class="login-outer" style="min-height:80vh;display:flex;align-items:center;
    justify-content:center;padding:24px;background:#f8fafc">
    <div class="login-card" style="
      width:100%;max-width:400px;background:#fff;border-radius:16px;
      padding:40px 36px 36px;box-shadow:0 20px 60px rgba(0,0,0,.08);
      border:1px solid #e2e8f0">

      <!-- Coat of Arms -->
      <div style="text-align:center;margin-bottom:20px">
        <img src="/assets/tanzania-coat.png" alt="Tanzania Coat of Arms"
          style="width:80px;height:80px;object-fit:contain;margin-bottom:12px">
        <h1 style="font-size:18px;font-weight:900;color:#1e293b;margin:0 0 2px;
          letter-spacing:-.3px">TSID Portal</h1>
        <p style="font-size:13px;color:#64748b;margin:0">Tanzania Student Identification System</p>
      </div>

      <!-- Role selector + Login button row -->
      <div style="display:flex;gap:10px;margin-bottom:18px;align-items:stretch">
        <div id="roleSelectWrap" style="position:relative;min-width:130px">
          <select id="roleSelect" style="
            width:100%;height:100%;padding:10px 32px 10px 12px;
            border:2px solid #1e293b;border-radius:8px;
            font-size:13px;font-weight:600;font-family:inherit;
            background:#fff;color:#1e293b;outline:none;
            appearance:none;-webkit-appearance:none;cursor:pointer;
            box-sizing:border-box">
            ${ROLES.map(r => `<option value="${r.value}" ${r.value===role?"selected":""}>${r.label}</option>`).join("")}
          </select>
          <!-- Dropdown arrow -->
          <svg style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
            width:14px;height:14px;pointer-events:none" viewBox="0 0 24 24" fill="none"
            stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <button id="loginBtn" type="button" style="
          flex:1;padding:10px 20px;border-radius:8px;border:2px solid #1e293b;
          cursor:pointer;background:#1e293b;color:#fff;
          font-size:14px;font-weight:800;font-family:inherit;
          letter-spacing:.3px;transition:background .15s,opacity .15s;
          -webkit-tap-highlight-color:transparent">
          Login
        </button>
      </div>

      <!-- Email / Username -->
      <div style="margin-bottom:14px;position:relative">
        <label style="display:block;font-size:11px;font-weight:700;color:#475569;
          margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">
          Email Address
        </label>
        <div style="position:relative">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
            width:16px;height:16px;pointer-events:none" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M22 7l-10 7L2 7"></path>
          </svg>
          <input id="loginEmail" type="email" autocomplete="email"
            placeholder="you@example.com"
            style="width:100%;padding:11px 14px 11px 38px;
              border:2px solid #cbd5e1;border-radius:8px;
              font-size:14px;font-family:inherit;outline:none;
              box-sizing:border-box;transition:border-color .15s;
              background:#fff;color:#0f172a">
        </div>
      </div>

      <!-- Password -->
      <div style="margin-bottom:20px;position:relative">
        <label style="display:block;font-size:11px;font-weight:700;color:#475569;
          margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">
          Password
        </label>
        <div style="position:relative">
          <svg id="lockIcon" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
            width:16px;height:16px;pointer-events:none" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input id="loginPass" type="password" autocomplete="current-password"
            placeholder="••••••••"
            style="width:100%;padding:11px 42px 11px 38px;
              border:2px solid #cbd5e1;border-radius:8px;
              font-size:14px;font-family:inherit;outline:none;
              box-sizing:border-box;transition:border-color .15s;
              background:#fff;color:#0f172a">
          <button id="togglePass" type="button" style="
            position:absolute;right:8px;top:50%;transform:translateY(-50%);
            background:none;border:none;cursor:pointer;padding:4px;
            display:flex;align-items:center;justify-content:center;
            -webkit-tap-highlight-color:transparent" aria-label="Toggle password visibility">
            <svg id="eyeOpen" style="width:18px;height:18px;display:block" viewBox="0 0 24 24" fill="none"
              stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg id="eyeClosed" style="width:18px;height:18px;display:none" viewBox="0 0 24 24" fill="none"
              stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>

      <div style="text-align:center;margin-top:4px">
        <a href="#/" style="font-size:12px;color:#94a3b8;text-decoration:none">← Back to home</a>
      </div>
    </div>
  </div>
  ${Footer()}
  `;
}

export function initLogin(role) {
  role = role || "school";
  setTimeout(() => document.getElementById("loginEmail")?.focus(), 80);
  const btn = document.getElementById("loginBtn");
  const roleSelect = document.getElementById("roleSelect");
  if (!btn) return;

  // Role dropdown → redirect to correct login page
  roleSelect?.addEventListener("change", () => {
    const val = roleSelect.value;
    if (val && val !== role) {
      window.location.hash = `#/login/${val}`;
    }
  });

  // Toggle password visibility
  const toggleBtn = document.getElementById("togglePass");
  const passInput = document.getElementById("loginPass");
  const eyeOpen = document.getElementById("eyeOpen");
  const eyeClosed = document.getElementById("eyeClosed");
  toggleBtn?.addEventListener("click", () => {
    const isPassword = passInput.type === "password";
    passInput.type = isPassword ? "text" : "password";
    eyeOpen.style.display = isPassword ? "none" : "block";
    eyeClosed.style.display = isPassword ? "block" : "none";
  });

  // Focus styling for inputs
  ["loginEmail", "loginPass"].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener("focus", () => { el.style.borderColor = "#1e293b"; });
    el?.addEventListener("blur", () => { el.style.borderColor = "#cbd5e1"; });
  });

  async function doLogin() {
    const selectedRole = roleSelect?.value || role;
    const email = (document.getElementById("loginEmail")?.value || "").trim();
    const pass  = document.getElementById("loginPass")?.value || "";
    if (!email || !pass) { toast("Please enter your email and password.", "error"); return; }

    btn.textContent = "Signing in…";
    btn.style.opacity = ".7";
    btn.style.cursor = "wait";

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (authError) {
        toast(authError.message || "Invalid email or password.", "error");
        btn.textContent = "Login";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast("Authentication failed. No user ID returned.", "error");
        btn.textContent = "Login";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        return;
      }

      // 2. Fetch the user's role from admin_users (new migration schema)
      const { data: profile, error: profileError } = await supabase
        .from("admin_users")
        .select("role, name, email, ref")
        .eq("auth_uid", userId)
        .maybeSingle();

      if (profileError || !profile) {
        toast("No TSID profile found. Contact your administrator.", "error");
        await supabase.auth.signOut();
        btn.textContent = "Login";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        return;
      }

      const profileRole = profile.role;
      const displayName = profile.name || authData.user?.email || "User";
      const ref = profile.ref || "";

      // 3. Check role matches the selected login portal
      if (profileRole !== selectedRole) {
        toast(`This account is registered as "${profileRole}". Redirecting...`, "error");
        btn.textContent = "Login";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        setTimeout(() => { window.location.hash = `#/login/${profileRole}`; }, 1200);
        return;
      }

      // 4. Store session
      const session = {
        role: profileRole,
        name: displayName,
        ref: ref,
        loginAt: new Date().toISOString(),
        email: email,
        userId: userId,
      };
      localStorage.setItem("tsid:session", JSON.stringify(session));

      toast(`Karibu, ${displayName}!`, "success");
      const redirect = ROLES.find(r => r.value === profileRole)?.redirect || "#/";
      setTimeout(() => { window.location.hash = redirect; }, 400);

    } catch (err) {
      console.error("[TSID Login]", err);
      toast("An error occurred during login.", "error");
      btn.textContent = "Login";
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  }

  btn.addEventListener("click", doLogin);
  document.getElementById("loginEmail")?.addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
  document.getElementById("loginPass")?.addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
}