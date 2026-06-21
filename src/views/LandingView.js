import { Navbar, initNavbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

export function LandingView() {
  setTimeout(initNavbar, 0);
  return `
  ${Navbar()}

  <!-- Hero -->
  <section class="landing-hero" style="
    background:linear-gradient(135deg,#003366 0%,#059669 100%);
    padding:64px 24px;text-align:center">
    <div style="max-width:520px;margin:0 auto">
      <div style="
        display:inline-block;background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.25);border-radius:99px;
        padding:5px 16px;font-size:11px;font-weight:700;
        color:#a7f3d0;letter-spacing:.5px;margin-bottom:18px">
        🇹🇿 JAMHURI YA MUUNGANO WA TANZANIA
      </div>
      <h1 style="font-size:56px;font-weight:900;color:#fff;line-height:1;
        margin-bottom:8px;letter-spacing:-2px">TSID</h1>
      <p style="font-size:16px;color:#a7f3d0;font-weight:700;margin-bottom:6px">
        Tanzania Student Identification System
      </p>
      <p style="font-size:13px;color:rgba(255,255,255,.65);margin-bottom:28px;line-height:1.6">
        National lifelong student ID — for schools, government and students across Tanzania.
      </p>
      <a href="#/search" class="landing-verify-btn" style="
        display:inline-block;background:#fff;color:#003366;
        padding:13px 32px;border-radius:12px;
        font-weight:800;font-size:14px;text-decoration:none;
        box-shadow:0 4px 18px rgba(0,0,0,.2)">
        🔍 Verify a Student or School
      </a>
    </div>
  </section>

  <!-- Role cards -->
  <section style="max-width:900px;margin:0 auto;padding:36px 20px 48px">
    <p style="text-align:center;font-size:12px;color:#94a3b8;font-weight:700;
      text-transform:uppercase;letter-spacing:.6px;margin-bottom:18px">
      Sign in to your portal
    </p>
    <div class="rg-landing landing-role-grid">

      <a href="#/login/school" style="text-decoration:none">
        <div class="landing-role-card" style="
          background:#fff;border:2px solid #e2e8f0;border-radius:18px;
          padding:26px 20px;text-align:center">
          <div style="width:52px;height:52px;border-radius:14px;margin:0 auto 14px;
            background:linear-gradient(135deg,#059669,#047857);
            display:flex;align-items:center;justify-content:center;font-size:24px">🏫</div>
          <div style="font-weight:800;font-size:15px;color:#0f172a;margin-bottom:6px">School</div>
          <div style="font-size:12.5px;color:#64748b;line-height:1.5;margin-bottom:16px">
            Register students, manage applications & payments
          </div>
          <div style="padding:10px;border-radius:10px;
            background:linear-gradient(135deg,#059669,#047857);
            color:#fff;font-size:13px;font-weight:700">Sign In →</div>
        </div>
      </a>

      <a href="#/login/gov" style="text-decoration:none">
        <div class="landing-role-card" style="
          background:#fff;border:2px solid #e2e8f0;border-radius:18px;
          padding:26px 20px;text-align:center">
          <div style="width:52px;height:52px;border-radius:14px;margin:0 auto 14px;
            background:linear-gradient(135deg,#003366,#1e40af);
            display:flex;align-items:center;justify-content:center;font-size:24px">🏛️</div>
          <div style="font-weight:800;font-size:15px;color:#0f172a;margin-bottom:6px">Government</div>
          <div style="font-size:12.5px;color:#64748b;line-height:1.5;margin-bottom:16px">
            National oversight of all schools and students
          </div>
          <div style="padding:10px;border-radius:10px;
            background:linear-gradient(135deg,#003366,#1e40af);
            color:#fff;font-size:13px;font-weight:700">Sign In →</div>
        </div>
      </a>

      <a href="#/login/student" style="text-decoration:none">
        <div class="landing-role-card" style="
          background:#fff;border:2px solid #e2e8f0;border-radius:18px;
          padding:26px 20px;text-align:center">
          <div style="width:52px;height:52px;border-radius:14px;margin:0 auto 14px;
            background:linear-gradient(135deg,#7c3aed,#5b21b6);
            display:flex;align-items:center;justify-content:center;font-size:24px">🎓</div>
          <div style="font-weight:800;font-size:15px;color:#0f172a;margin-bottom:6px">Student</div>
          <div style="font-size:12.5px;color:#64748b;line-height:1.5;margin-bottom:16px">
            View your ID card, certificates and letters
          </div>
          <div style="padding:10px;border-radius:10px;
            background:linear-gradient(135deg,#7c3aed,#5b21b6);
            color:#fff;font-size:13px;font-weight:700">Sign In →</div>
        </div>
      </a>

    </div>
  </section>

  <style>
    .landing-role-card:hover {
      border-color:#059669 !important;
      transform:translateY(-3px);
      box-shadow:0 10px 28px rgba(0,0,0,.1);
    }
  </style>

  ${Footer()}
  `;
}
