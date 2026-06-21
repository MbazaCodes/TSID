import { Navbar, initNavbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

// All Tanzania education bodies for the landing page marquee / grid
const PARTNERS = [
  { short: "MoEST",   name: "Wizara ya Elimu, Sayansi na Teknolojia", url: "https://www.moe.go.tz",     icon: "🏛️" },
  { short: "NECTA",   name: "National Examinations Council",           url: "https://www.necta.go.tz",   icon: "📋" },
  { short: "NACTE",   name: "National Council for Technical Education",url: "https://www.nacte.go.tz",   icon: "📜" },
  { short: "TCU",     name: "Tanzania Commission for Universities",     url: "https://www.tcu.go.tz",     icon: "🎓" },
  { short: "VETA",    name: "Vocational Education Training Authority",  url: "https://www.veta.go.tz",    icon: "🔧" },
  { short: "NIDA",    name: "National Identification Authority",        url: "https://www.nida.go.tz",    icon: "🪪" },
  { short: "COSTECH", name: "Commission for Science & Technology",      url: "https://www.costech.or.tz", icon: "🔬" },
  { short: "eGA",     name: "e-Government Authority",                   url: "https://www.ega.go.tz",     icon: "🖥️" },
  { short: "TAMISEMI",name: "Ofisi ya Rais — TAMISEMI",                 url: "https://www.tamisemi.go.tz",icon: "🏢" },
  { short: "UDSM",    name: "University of Dar es Salaam",              url: "https://www.udsm.ac.tz",    icon: "🏫" },
  { short: "OUT",     name: "Open University of Tanzania",              url: "https://www.out.ac.tz",     icon: "📡" },
  { short: "TLSB",    name: "Tanzania Library Services Board",          url: "https://www.tlsb.or.tz",    icon: "📚" },
];

export function LandingView() {
  setTimeout(initNavbar, 0);

  const partnerChips = PARTNERS.map(p => `
    <a href="${p.url}" target="_blank" rel="noopener noreferrer"
      title="${p.name}"
      style="
        display:inline-flex;align-items:center;gap:7px;
        background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;
        padding:9px 14px;text-decoration:none;
        transition:all .18s;white-space:nowrap"
      class="partner-chip">
      <span style="font-size:16px">${p.icon}</span>
      <div>
        <div style="font-size:12.5px;font-weight:800;color:#0f172a">${p.short}</div>
        <div style="font-size:10px;color:#64748b;line-height:1.2">${p.name.split(",")[0]}</div>
      </div>
    </a>`).join("");

  return `
  ${Navbar()}

  <!-- ── Hero ─────────────────────────────────────────────────────── -->
  <section class="landing-hero" style="
    background:linear-gradient(135deg,#003366 0%,#059669 100%);
    padding:56px 24px 48px;text-align:center">
    <div style="max-width:540px;margin:0 auto">

      <div style="
        display:inline-block;background:rgba(255,255,255,.12);
        border:1px solid rgba(255,255,255,.25);border-radius:99px;
        padding:5px 16px;font-size:11px;font-weight:700;
        color:#a7f3d0;letter-spacing:.5px;margin-bottom:18px">
        🇹🇿 JAMHURI YA MUUNGANO WA TANZANIA
      </div>

      <img src="/assets/tanzania-coat.png" alt="Tanzania Coat of Arms"
        style="width:72px;height:72px;border-radius:16px;margin-bottom:16px;
        border:3px solid rgba(255,255,255,.25)">
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

  <!-- ── Role cards ─────────────────────────────────────────────── -->
  <section style="max-width:900px;margin:0 auto;padding:36px 20px 0">
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
            Register students, manage applications &amp; payments
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

  <!-- ── Tanzania Education Bodies ─────────────────────────────── -->
  <section style="padding:40px 20px 48px">
    <div style="max-width:1000px;margin:0 auto">

      <!-- Section header -->
      <div style="
        display:flex;align-items:center;gap:12px;margin-bottom:20px;
        justify-content:center">
        <div style="height:1px;flex:1;background:#e2e8f0;max-width:80px"></div>
        <div style="text-align:center">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;
            text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px">
            Wadau wa Elimu Tanzania
          </div>
          <div style="font-size:18px;font-weight:900;color:#0f172a">
            Tanzania Education Bodies
          </div>
        </div>
        <div style="height:1px;flex:1;background:#e2e8f0;max-width:80px"></div>
      </div>

      <!-- Partner chips -->
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
        margin-bottom:20px">
        ${partnerChips}
      </div>

      <!-- View all note -->
      <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:14px">
        TSID is integrated with Tanzania's national education infrastructure.
        All links open official government websites.
      </p>
    </div>
  </section>

  <style>
    .landing-role-card:hover {
      border-color:#059669 !important;
      transform:translateY(-3px);
      box-shadow:0 10px 28px rgba(0,0,0,.1);
    }
    .partner-chip:hover {
      border-color:#059669 !important;
      box-shadow:0 4px 14px rgba(5,150,105,.12);
      transform:translateY(-2px);
    }
    @media(max-width:768px){
      .partner-chip { padding:8px 12px !important; }
      .partner-chip > div > div:last-child { display:none; }
    }
  </style>

  ${Footer()}
  `;
}
