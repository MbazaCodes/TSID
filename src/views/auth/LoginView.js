import { Navbar, initNavbar } from "../../components/Navbar.js";
import { Footer }  from "../../components/Footer.js";
import { supabase } from "../../store/supabase.js";
import { toast }   from "../../lib/toast.js";

const META = {
  school:  { title:"School Login",     icon:"🏫", color:"#334155", grad:"135deg,#475569,#334155", redirect:"#/school/dashboard" },
  gov:     { title:"Government Login", icon:"🏛️", color:"#334155", grad:"135deg,#334155,#1e293b", redirect:"#/gov/dashboard"    },
  student: { title:"Student Login",    icon:"🎓", color:"#334155", grad:"135deg,#64748b,#475569", redirect:"#/student/dashboard" },
};

export function LoginView(role) {
  role = role || "school";
  const m = META[role] || META.school;
  setTimeout(initNavbar, 0);

  return `
  ${Navbar()}
  <div class="login-outer" style="min-height:80vh;display:flex;align-items:center;
    justify-content:center;padding:24px;background:#f8fafc">
    <div class="login-card" style="
      width:100%;max-width:420px;background:#fff;border-radius:20px;
      padding:36px 32px;box-shadow:0 16px 48px rgba(0,0,0,.1);
      border:1.5px solid #e2e8f0">

      <div style="text-align:center;margin-bottom:24px">
        <div style="width:60px;height:60px;border-radius:16px;
          background:linear-gradient(${m.grad});
          display:flex;align-items:center;justify-content:center;
          font-size:28px;margin:0 auto 12px">${m.icon}</div>
        <h2 style="font-size:20px;font-weight:900;color:#0f172a;margin-bottom:4px">${m.title}</h2>
        <p style="font-size:13px;color:#64748b">Sign in with your email and password</p>
      </div>

      <!-- Role tabs -->
      <div style="display:flex;gap:4px;background:#f1f5f9;padding:4px;border-radius:12px;margin-bottom:22px">
        ${["school","gov","student"].map(r => `
          <a href="#/login/${r}" style="
            flex:1;text-align:center;padding:8px 4px;border-radius:9px;
            font-size:11.5px;font-weight:700;text-decoration:none;
            ${r===role ? `background:#fff;color:${m.color};box-shadow:0 1px 4px rgba(0,0,0,.1)` : "color:#94a3b8"}">
            ${r==="school"?"🏫 School":r==="gov"?"🏛️ Gov":"🎓 Student"}
          </a>`).join("")}
      </div>

      <div style="margin-bottom:14px">
        <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:5px">
          Email Address
        </label>
        <input id="loginEmail" type="email" autocomplete="email"
          placeholder="you@example.com"
          style="width:100%;padding:12px 14px;border:1.5px solid #d1d5db;border-radius:10px;
            font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;
            transition:border-color .15s">
      </div>
      <div style="margin-bottom:22px">
        <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:5px">
          Password
        </label>
        <input id="loginPass" type="password" autocomplete="current-password"
          placeholder="••••••••"
          style="width:100%;padding:12px 14px;border:1.5px solid #d1d5db;border-radius:10px;
            font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;
            transition:border-color .15s">
      </div>

      <button id="loginBtn" type="button" style="
        width:100%;padding:14px;border-radius:12px;border:none;cursor:pointer;
        background:linear-gradient(${m.grad});
        color:#fff;font-size:15px;font-weight:800;
        box-shadow:0 4px 14px rgba(0,0,0,.15);transition:opacity .15s;
        -webkit-tap-highlight-color:transparent">
        Sign In →
      </button>

      <div style="text-align:center;margin-top:14px">
        <a href="#/" style="font-size:12px;color:#94a3b8;text-decoration:none">← Back to home</a>
      </div>
    </div>
  </div>
  ${Footer()}
  `;
}

export function initLogin(role) {
  setTimeout(() => document.getElementById("loginEmail")?.focus(), 80);
  const btn = document.getElementById("loginBtn");
  if (!btn) return;

  async function doLogin() {
    const email = (document.getElementById("loginEmail")?.value || "").trim();
    const pass  = document.getElementById("loginPass")?.value || "";
    if (!email || !pass) { toast("Please enter your email and password.", "error"); return; }

    btn.textContent = "Signing in…";
    btn.style.opacity = ".7";

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        toast(authError.message || "Invalid email or password.", "error");
        btn.textContent = "Sign In →";
        btn.style.opacity = "1";
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast("Authentication failed. No user ID returned.", "error");
        btn.textContent = "Sign In →";
        btn.style.opacity = "1";
        return;
      }

      // 2. Fetch the user's role from user_profiles
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("role, display_name, ref")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError || !profiles) {
        // No profile yet — this shouldn't happen if admin created the account properly
        toast("No TSID profile found. Contact your administrator.", "error");
        await supabase.auth.signOut();
        btn.textContent = "Sign In →";
        btn.style.opacity = "1";
        return;
      }

      const profileRole = profiles.role;
      const displayName = profiles.display_name || authData.user?.email || "User";
      const ref = profiles.ref || "";

      // 3. Check that the user is logging into the correct role portal
      if (profileRole !== role) {
        toast(`This account is registered as "${profileRole}", not "${role}". Redirecting...`, "error");
        btn.textContent = "Sign In →";
        btn.style.opacity = "1";
        setTimeout(() => { window.location.hash = `#/login/${profileRole}`; }, 1200);
        return;
      }

      // 4. Store session in localStorage (compatible with existing session system)
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
      setTimeout(() => { window.location.hash = META[role].redirect; }, 400);

    } catch (err) {
      console.error("[TSID Login]", err);
      toast("An error occurred during login.", "error");
      btn.textContent = "Sign In →";
      btn.style.opacity = "1";
    }
  }

  btn.addEventListener("click", doLogin);
  document.getElementById("loginEmail")?.addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
  document.getElementById("loginPass")?.addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
}