import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

export function LandingView() {
  return `
  ${Navbar()}

  <!-- Hero -->
  <section style="
    background:linear-gradient(135deg,#003366 0%,#059669 100%);
    padding:64px 24px;text-align:center">
    <div style="max-width:560px;margin:0 auto">
      <div style="
        display:inline-block;background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.25);border-radius:99px;
        padding:6px 18px;font-size:11.5px;font-weight:700;
        color:#a7f3d0;letter-spacing:.5px;margin-bottom:20px">
        🇹🇿 JAMHURI YA MUUNGANO WA TANZANIA
      </div>
      <h1 style="font-size:52px;font-weight:900;color:#fff;line-height:1;margin-bottom:10px;letter-spacing:-1px">
        TSID
      </h1>
      <p style="font-size:17px;color:#a7f3d0;font-weight:600;margin-bottom:6px">
        Tanzania Student Identification System
      </p>
      <p style="font-size:13.5px;color:rgba(255,255,255,.7);margin-bottom:32px;line-height:1.6">
        National lifelong student ID — for schools, government and students across Tanzania.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="#/search" style="
          background:#fff;color:#003366;padding:12px 28px;border-radius:12px;
          font-weight:800;font-size:14px;text-decoration:none;
          box-shadow:0 4px 16px rgba(0,0,0,.2)">
          🔍 Verify a Student or School
        </a>
      </div>
    </div>
  </section>

  <!-- Role cards -->
  <section style="max-width:960px;margin:0 auto;padding:40px 24px">
    <p style="text-align:center;font-size:13px;color:#64748b;font-weight:600;
      text-transform:uppercase;letter-spacing:.6px;margin-bottom:20px">
      Sign in to your portal
    </p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">

      <a href="#/login/school" style="text-decoration:none">
        <div style="
          background:#fff;border:2px solid #e2e8f0;border-radius:18px;
          padding:26px 22px;text-align:center;
          transition:all .18s;cursor:pointer" class="landing-role-card">
          <div style="
            width:52px;height:52px;border-radius:14px;margin:0 auto 14px;
            background:linear-gradient(135deg,#059669,#047857);
            display:flex;align-items:center;justify-content:center;font-size:24px">🏫</div>
          <div style="font-weight:800;font-size:15px;color:#0f172a;margin-bottom:6px">School</div>
          <div style="font-size:12.5px;color:#64748b;line-height:1.5">
            Register students, manage applications & payments
          </div>
          <div style="
            margin-top:16px;padding:9px;border-radius:10px;
            background:linear-gradient(135deg,#059669,#047857);
            color:#fff;font-size:13px;font-weight:700">
            Sign In →
          </div>
        </div>
      </a>

      <a href="#/login/gov" style="text-decoration:none">
        <div style="
          background:#fff;border:2px solid #e2e8f0;border-radius:18px;
          padding:26px 22px;text-align:center;
          transition:all .18s;cursor:pointer" class="landing-role-card">
          <div style="
            width:52px;height:52px;border-radius:14px;margin:0 auto 14px;
            background:linear-gradient(135deg,#003366,#1e40af);
            display:flex;align-items:center;justify-content:center;font-size:24px">🏛️</div>
          <div style="font-weight:800;font-size:15px;color:#0f172a;margin-bottom:6px">Government</div>
          <div style="font-size:12.5px;color:#64748b;line-height:1.5">
            National oversight of all schools and students
          </div>
          <div style="
            margin-top:16px;padding:9px;border-radius:10px;
            background:linear-gradient(135deg,#003366,#1e40af);
            color:#fff;font-size:13px;font-weight:700">
            Sign In →
          </div>
        </div>
      </a>

      <a href="#/login/student" style="text-decoration:none">
        <div style="
          background:#fff;border:2px solid #e2e8f0;border-radius:18px;
          padding:26px 22px;text-align:center;
          transition:all .18s;cursor:pointer" class="landing-role-card">
          <div style="
            width:52px;height:52px;border-radius:14px;margin:0 auto 14px;
            background:linear-gradient(135deg,#7c3aed,#5b21b6);
            display:flex;align-items:center;justify-content:center;font-size:24px">🎓</div>
          <div style="font-weight:800;font-size:15px;color:#0f172a;margin-bottom:6px">Student</div>
          <div style="font-size:12.5px;color:#64748b;line-height:1.5">
            View your ID card, certificates and letters
          </div>
          <div style="
            margin-top:16px;padding:9px;border-radius:10px;
            background:linear-gradient(135deg,#7c3aed,#5b21b6);
            color:#fff;font-size:13px;font-weight:700">
            Sign In →
          </div>
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
