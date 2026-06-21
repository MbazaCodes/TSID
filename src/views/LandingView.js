import { Navbar, initNavbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

// ── Happy students walking SVG illustration ─────────────────────────────────
const HERO_ILLUSTRATION = `
<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0ea5e9" stop-opacity=".18"/>
      <stop offset="100%" stop-color="#059669" stop-opacity=".08"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="path" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="school-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>

  <!-- Sky/background -->
  <rect width="900" height="320" fill="url(#sky)" rx="16"/>

  <!-- Sun -->
  <circle cx="820" cy="55" r="36" fill="#fde68a" opacity=".9"/>
  <circle cx="820" cy="55" r="28" fill="#fcd34d"/>
  <!-- Sun rays -->
  <g stroke="#fde68a" stroke-width="3" opacity=".7">
    <line x1="820" y1="8"  x2="820" y2="0"/>
    <line x1="856" y1="19" x2="862" y2="13"/>
    <line x1="867" y1="55" x2="875" y2="55"/>
    <line x1="856" y1="91" x2="862" y2="97"/>
    <line x1="820" y1="102" x2="820" y2="110"/>
    <line x1="784" y1="91" x2="778" y2="97"/>
    <line x1="773" y1="55" x2="765" y2="55"/>
    <line x1="784" y1="19" x2="778" y2="13"/>
  </g>

  <!-- Clouds -->
  <g fill="white" opacity=".55">
    <ellipse cx="160" cy="50" rx="55" ry="20"/>
    <ellipse cx="130" cy="56" rx="36" ry="18"/>
    <ellipse cx="192" cy="56" rx="36" ry="16"/>
    <ellipse cx="520" cy="38" rx="44" ry="16"/>
    <ellipse cx="496" cy="44" rx="30" ry="14"/>
    <ellipse cx="546" cy="44" rx="28" ry="13"/>
  </g>

  <!-- School building (right side) -->
  <rect x="640" y="100" width="220" height="170" fill="url(#school-wall)" rx="4"/>
  <!-- Roof -->
  <polygon points="628,100 860,100 800,60 700,60" fill="#dc2626" opacity=".85"/>
  <!-- School flag -->
  <line x1="750" y1="20" x2="750" y2="60" stroke="#92400e" stroke-width="3"/>
  <rect x="750" y="20" width="28" height="18" fill="#1B8F3A"/>
  <rect x="750" y="20" width="28" height="6" fill="#1B8F3A"/>
  <rect x="750" y="26" width="28" height="6" fill="#000"/>
  <rect x="750" y="32" width="28" height="6" fill="#00A3DD"/>
  <!-- Windows -->
  <g fill="#bae6fd" stroke="#7dd3fc" stroke-width="1.5">
    <rect x="662" y="125" width="40" height="36" rx="4"/>
    <rect x="720" y="125" width="40" height="36" rx="4"/>
    <rect x="778" y="125" width="40" height="36" rx="4"/>
    <rect x="662" y="178" width="40" height="36" rx="4"/>
    <rect x="778" y="178" width="40" height="36" rx="4"/>
  </g>
  <!-- Window cross -->
  <g stroke="#7dd3fc" stroke-width="1">
    <line x1="682" y1="125" x2="682" y2="161"/> <line x1="662" y1="143" x2="702" y2="143"/>
    <line x1="740" y1="125" x2="740" y2="161"/> <line x1="720" y1="143" x2="760" y2="143"/>
    <line x1="798" y1="125" x2="798" y2="161"/> <line x1="778" y1="143" x2="818" y2="143"/>
    <line x1="682" y1="178" x2="682" y2="214"/> <line x1="662" y1="196" x2="702" y2="196"/>
    <line x1="798" y1="178" x2="798" y2="214"/> <line x1="778" y1="196" x2="818" y2="196"/>
  </g>
  <!-- School door -->
  <rect x="718" y="188" width="44" height="82" fill="#92400e" rx="3"/>
  <circle cx="756" cy="230" r="3" fill="#fcd34d"/>
  <!-- School sign -->
  <rect x="665" y="102" width="130" height="18" fill="#003366" rx="3"/>
  <text x="730" y="114" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="Arial">SHULE YA MSINGI</text>

  <!-- Ground -->
  <rect x="0" y="265" width="900" height="55" fill="url(#ground)" rx="0"/>
  <!-- Path / road -->
  <path d="M0,280 Q200,265 450,268 Q650,271 900,266 L900,290 Q650,287 450,284 Q200,281 0,296 Z" fill="url(#path)" opacity=".7"/>
  <!-- Path dashes -->
  <g stroke="white" stroke-width="2" stroke-dasharray="20,14" opacity=".5">
    <line x1="0" y1="283" x2="900" y2="278"/>
  </g>

  <!-- Trees -->
  <g>
    <!-- Tree 1 -->
    <rect x="58" y="200" width="8" height="65" fill="#92400e"/>
    <ellipse cx="62" cy="185" rx="28" ry="32" fill="#15803d"/>
    <ellipse cx="50" cy="198" rx="20" ry="24" fill="#16a34a"/>
    <ellipse cx="74" cy="196" rx="18" ry="22" fill="#166534"/>
    <!-- Tree 2 -->
    <rect x="580" y="210" width="7" height="55" fill="#92400e"/>
    <ellipse cx="584" cy="196" rx="24" ry="28" fill="#15803d"/>
    <ellipse cx="572" cy="208" rx="17" ry="20" fill="#16a34a"/>
    <!-- Tree 3 -->
    <rect x="612" y="215" width="6" height="50" fill="#78350f"/>
    <ellipse cx="615" cy="203" rx="20" ry="24" fill="#166534"/>
  </g>

  <!-- STUDENT 1 — boy with backpack, waving, uniform -->
  <g transform="translate(160,100)">
    <ellipse cx="24" cy="168" rx="22" ry="6" fill="rgba(0,0,0,.15)"/>
    <rect x="14" y="128" width="11" height="42" rx="5" fill="#1e3a8a" transform="rotate(-6,19,128)"/>
    <rect x="22" y="128" width="11" height="42" rx="5" fill="#1e3a8a" transform="rotate(8,27,128)"/>
    <ellipse cx="16" cy="168" rx="9" ry="5" fill="#1e293b" transform="rotate(-6,16,168)"/>
    <ellipse cx="31" cy="170" rx="9" ry="5" fill="#1e293b" transform="rotate(8,31,170)"/>
    <rect x="10" y="80" width="32" height="52" rx="8" fill="#ffffff"/>
    <polygon points="22,80 26,80 24,92" fill="#dc2626"/>
    <rect x="36" y="84" width="18" height="32" rx="5" fill="#2563eb"/>
    <rect x="38" y="88" width="14" height="8" rx="3" fill="#1d4ed8"/>
    <line x1="38" y1="86" x2="38" y2="116" stroke="#1e40af" stroke-width="2"/>
    <path d="M10,90 Q-10,70 -15,50" stroke="#d97706" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M42,90 Q50,108 48,120" stroke="#d97706" stroke-width="11" stroke-linecap="round" fill="none"/>
    <rect x="19" y="64" width="14" height="20" rx="7" fill="#d97706"/>
    <circle cx="26" cy="52" r="24" fill="#d97706"/>
    <ellipse cx="26" cy="32" rx="22" ry="10" fill="#1c1917"/>
    <ellipse cx="10" cy="44" rx="6" ry="10" fill="#1c1917"/>
    <ellipse cx="42" cy="44" rx="6" ry="10" fill="#1c1917"/>
    <circle cx="19" cy="50" r="3.5" fill="#fff" opacity=".9"/>
    <circle cx="33" cy="50" r="3.5" fill="#fff" opacity=".9"/>
    <circle cx="20" cy="51" r="2" fill="#1c1917"/>
    <circle cx="34" cy="51" r="2" fill="#1c1917"/>
    <path d="M18,60 Q26,68 34,60" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M20,61 Q26,67 32,61" fill="white" opacity=".8"/>
    <ellipse cx="26" cy="30" rx="26" ry="9" fill="#003366"/>
    <rect x="0" y="26" width="52" height="8" rx="3" fill="#003366"/>
    <ellipse cx="42" cy="30" rx="8" ry="4" fill="#1e40af"/>
  </g>

  <!-- STUDENT 2 — girl with book, laughing -->
  <g transform="translate(280,110)">
    <ellipse cx="22" cy="158" rx="20" ry="5" fill="rgba(0,0,0,.14)"/>
    <path d="M6,118 Q4,158 0,162 L44,162 Q40,158 38,118 Z" fill="#7c3aed"/>
    <rect x="8" y="78" width="30" height="44" rx="8" fill="#ffffff"/>
    <rect x="6" y="118" width="32" height="6" rx="3" fill="#5b21b6"/>
    <rect x="-14" y="95" width="22" height="30" rx="3" fill="#dc2626" transform="rotate(-15,-3,110)"/>
    <line x1="-13" y1="95" x2="-12" y2="124" stroke="white" stroke-width="1" transform="rotate(-15,-3,110)"/>
    <path d="M8,92 Q-4,100 -8,115" stroke="#c2855a" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M38,92 Q52,106 50,122" stroke="#c2855a" stroke-width="10" stroke-linecap="round" fill="none"/>
    <rect x="10" y="158" width="10" height="40" rx="5" fill="#7c3aed" transform="rotate(-4,15,158)"/>
    <rect x="20" y="158" width="10" height="40" rx="5" fill="#5b21b6" transform="rotate(5,25,158)"/>
    <ellipse cx="12" cy="197" rx="9" ry="5" fill="#1e293b"/>
    <ellipse cx="27" cy="198" rx="9" ry="5" fill="#1e293b"/>
    <rect x="17" y="62" width="12" height="18" rx="6" fill="#c2855a"/>
    <circle cx="23" cy="50" r="22" fill="#c2855a"/>
    <ellipse cx="23" cy="30" rx="20" ry="12" fill="#1c1917"/>
    <ellipse cx="5" cy="44" rx="5" ry="14" fill="#1c1917"/>
    <ellipse cx="41" cy="44" rx="5" ry="14" fill="#1c1917"/>
    <path d="M6,52 Q4,62 8,70" stroke="#1c1917" stroke-width="4" fill="none"/>
    <path d="M40,52 Q42,62 38,70" stroke="#1c1917" stroke-width="4" fill="none"/>
    <ellipse cx="23" cy="26" rx="14" ry="6" fill="#f43f5e"/>
    <circle cx="23" cy="26" r="4" fill="#fff"/>
    <circle cx="17" cy="48" r="3" fill="#fff" opacity=".9"/>
    <circle cx="29" cy="48" r="3" fill="#fff" opacity=".9"/>
    <circle cx="17" cy="49" r="1.8" fill="#1c1917"/>
    <circle cx="29" cy="49" r="1.8" fill="#1c1917"/>
    <path d="M13,58 Q23,68 33,58" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M15,59 Q23,67 31,59" fill="white" opacity=".8"/>
    <ellipse cx="11" cy="56" rx="5" ry="3" fill="#fb7185" opacity=".4"/>
    <ellipse cx="35" cy="56" rx="5" ry="3" fill="#fb7185" opacity=".4"/>
  </g>

  <!-- STUDENT 3 — tall boy with soccer ball -->
  <g transform="translate(390,88)">
    <ellipse cx="23" cy="180" rx="22" ry="6" fill="rgba(0,0,0,.14)"/>
    <rect x="12" y="138" width="12" height="44" rx="6" fill="#1e3a8a" transform="rotate(-8,18,138)"/>
    <rect x="22" y="138" width="12" height="44" rx="6" fill="#1e3a8a" transform="rotate(6,28,138)"/>
    <ellipse cx="13" cy="180" rx="10" ry="5" fill="#1e293b" transform="rotate(-8,13,180)"/>
    <ellipse cx="30" cy="181" rx="10" ry="5" fill="#1e293b"/>
    <circle cx="48" cy="165" r="14" fill="white" stroke="#1c1917" stroke-width="1.5"/>
    <path d="M48,151 L44,158 L50,158 Z" fill="#1c1917"/>
    <path d="M48,179 L44,172 L50,172 Z" fill="#1c1917"/>
    <path d="M34,165 L41,161 L41,169 Z" fill="#1c1917"/>
    <path d="M62,165 L55,161 L55,169 Z" fill="#1c1917"/>
    <rect x="24" y="132" width="12" height="40" rx="6" fill="#1e3a8a" transform="rotate(35,30,132)"/>
    <ellipse cx="46" cy="158" rx="10" ry="5" fill="#1e293b" transform="rotate(35,46,158)"/>
    <rect x="9" y="88" width="32" height="54" rx="8" fill="#16a34a"/>
    <text x="25" y="118" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial">10</text>
    <path d="M9,95 Q-6,112 -4,128" stroke="#92400e" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M41,95 Q54,110 52,125" stroke="#92400e" stroke-width="11" stroke-linecap="round" fill="none"/>
    <rect x="18" y="72" width="13" height="18" rx="6" fill="#92400e"/>
    <circle cx="24" cy="58" r="24" fill="#92400e"/>
    <ellipse cx="24" cy="37" rx="22" ry="11" fill="#1c1917"/>
    <circle cx="17" cy="55" r="3.5" fill="#fff" opacity=".9"/>
    <circle cx="31" cy="55" r="3.5" fill="#fff" opacity=".9"/>
    <circle cx="17" cy="56" r="2.2" fill="#1c1917"/>
    <circle cx="31" cy="56" r="2.2" fill="#1c1917"/>
    <path d="M14,66 Q24,76 34,66" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M16,67 Q24,75 32,67" fill="white" opacity=".85"/>
    <circle cx="18" cy="54" r="1" fill="white"/>
    <circle cx="32" cy="54" r="1" fill="white"/>
  </g>

  <!-- STUDENT 4 — girl with laptop/tablet -->
  <g transform="translate(500,105)">
    <ellipse cx="22" cy="162" rx="20" ry="5" fill="rgba(0,0,0,.13)"/>
    <rect x="11" y="128" width="10" height="36" rx="5" fill="#0f172a" transform="rotate(-5,16,128)"/>
    <rect x="20" y="128" width="10" height="36" rx="5" fill="#0f172a" transform="rotate(4,25,128)"/>
    <ellipse cx="13" cy="163" rx="9" ry="5" fill="#1e293b"/>
    <ellipse cx="27" cy="164" rx="9" ry="5" fill="#1e293b"/>
    <path d="M8,118 Q6,132 2,136 L42,136 Q38,132 36,118 Z" fill="#0f172a"/>
    <rect x="8" y="76" width="30" height="46" rx="8" fill="#e0f2fe"/>
    <rect x="-16" y="72" width="26" height="36" rx="4" fill="#1e293b" transform="rotate(-10,-3,90)"/>
    <rect x="-14" y="74" width="22" height="30" rx="3" fill="#38bdf8" transform="rotate(-10,-3,90)"/>
    <text x="-3" y="93" text-anchor="middle" fill="white" font-size="7" font-weight="700" font-family="Arial" transform="rotate(-10,-3,90)">TSID</text>
    <path d="M8,88 Q-4,88 -12,92" stroke="#c68642" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M38,90 Q48,106 46,120" stroke="#c68642" stroke-width="10" stroke-linecap="round" fill="none"/>
    <rect x="17" y="62" width="12" height="16" rx="6" fill="#c68642"/>
    <circle cx="23" cy="50" r="22" fill="#c68642"/>
    <ellipse cx="23" cy="30" rx="22" ry="14" fill="#1c1917"/>
    <ellipse cx="4" cy="46" rx="6" ry="12" fill="#1c1917"/>
    <ellipse cx="42" cy="46" rx="6" ry="12" fill="#1c1917"/>
    <ellipse cx="23" cy="56" rx="8" ry="8" fill="#1c1917"/>
    <rect x="3" y="35" width="40" height="7" rx="3" fill="#f97316" opacity=".9"/>
    <circle cx="17" cy="48" r="3" fill="#fff" opacity=".9"/>
    <circle cx="29" cy="48" r="3" fill="#fff" opacity=".9"/>
    <circle cx="17" cy="49" r="2" fill="#1c1917"/>
    <circle cx="29" cy="49" r="2" fill="#1c1917"/>
    <path d="M14,58 Q23,70 32,58" stroke="#1c1917" stroke-width="2" fill="#dc2626" stroke-linecap="round"/>
    <path d="M16,60 Q23,68 30,60" fill="white" opacity=".9"/>
    <ellipse cx="12" cy="55" rx="5" ry="3" fill="#fb923c" opacity=".4"/>
    <ellipse cx="34" cy="55" rx="5" ry="3" fill="#fb923c" opacity=".4"/>
  </g>

  <!-- Floating sparkles / stars -->
  <g fill="#fde68a" opacity=".8">
    <polygon points="100,40 102,46 108,46 103,50 105,56 100,52 95,56 97,50 92,46 98,46" transform="scale(.6) translate(50,20)"/>
    <polygon points="350,20 352,26 358,26 353,30 355,36 350,32 345,36 347,30 342,26 348,26" transform="scale(.5) translate(200,40)"/>
    <polygon points="470,30 472,36 478,36 473,40 475,46 470,42 465,46 467,40 462,36 468,36" transform="scale(.55)"/>
  </g>

  <!-- Flying book pages -->
  <g opacity=".6">
    <rect x="340" y="55" width="18" height="24" rx="2" fill="white" transform="rotate(15,349,67)"/>
    <line x1="343" y1="62" x2="356" y2="60" stroke="#94a3b8" stroke-width="1" transform="rotate(15,349,67)"/>
    <line x1="343" y1="67" x2="356" y2="65" stroke="#94a3b8" stroke-width="1" transform="rotate(15,349,67)"/>
    <rect x="460" y="42" width="16" height="20" rx="2" fill="white" transform="rotate(-12,468,52)"/>
    <line x1="463" y1="48" x2="474" y2="47" stroke="#94a3b8" stroke-width="1" transform="rotate(-12,468,52)"/>
  </g>

  <!-- TSID ID cards floating -->
  <g>
    <rect x="88" y="130" width="42" height="28" rx="4" fill="#003366" opacity=".85" transform="rotate(-8,109,144)"/>
    <rect x="90" y="132" width="38" height="24" rx="3" fill="#1e40af" opacity=".7" transform="rotate(-8,109,144)"/>
    <text x="109" y="147" text-anchor="middle" fill="white" font-size="7" font-weight="900" font-family="Arial" transform="rotate(-8,109,144)">TSID</text>
    <text x="109" y="155" text-anchor="middle" fill="#a7f3d0" font-size="5" font-family="Arial" transform="rotate(-8,109,144)">STUDENT ID</text>
  </g>

  <!-- Caption ribbon at bottom -->
  <rect x="0" y="290" width="900" height="30" fill="rgba(0,51,102,.7)"/>
  <text x="450" y="309" text-anchor="middle" fill="white" font-size="11" font-weight="700"
    font-family="Arial" letter-spacing="2">
    WATOTO WA TANZANIA — MUSTAKABALI WA TAIFA
  </text>
</svg>`;

export function LandingView() {
  setTimeout(initNavbar, 0);

  const roleCards = [
    { href: "#/login/school", icon: "🏫", gradient: "linear-gradient(135deg,#059669,#047857)", title: "Shule / School", desc: "Register students, manage applications & payments" },
    { href: "#/login/gov", icon: "🏛️", gradient: "linear-gradient(135deg,#003366,#1e40af)", title: "Serikali / Gov", desc: "National oversight of all schools and students" },
    { href: "#/login/student", icon: "🎓", gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)", title: "Mwanafunzi / Student", desc: "View your ID card, certificates and letters" },
  ];

  return `
  ${Navbar()}

  <!-- ── HERO ─────────────────────────────────────────────────────────── -->
  <section style="
    background:linear-gradient(160deg,#003366 0%,#0f5a3a 50%,#059669 100%);
    position:relative;overflow:hidden;min-height:520px;
    display:flex;flex-direction:column">

    <!-- Top bar: coat of arms centred + country name -->
    <div style="
      display:flex;align-items:center;justify-content:center;
      gap:14px;padding:22px 24px 0;position:relative;z-index:2">
      <img src="/assets/coat-of-arms.png" alt="Coat of Arms"
        style="width:54px;height:54px;object-fit:contain;
          filter:drop-shadow(0 2px 8px rgba(0,0,0,.35))">
      <div style="text-align:left">
        <div style="font-size:11px;font-weight:800;color:#a7f3d0;
          letter-spacing:.8px;text-transform:uppercase">
          Jamhuri ya Muungano wa Tanzania
        </div>
        <div style="font-size:10px;color:rgba(255,255,255,.6);font-weight:600">
          United Republic of Tanzania
        </div>
      </div>
      <div style="width:1px;height:36px;background:rgba(255,255,255,.2);margin:0 6px"></div>
      <div>
        <div style="font-size:13px;font-weight:800;color:#fff">TSID</div>
        <div style="font-size:9px;color:#a7f3d0;font-weight:600">Official System</div>
      </div>
    </div>

    <!-- Two-column: text left, illustration right -->
    <div style="
      display:grid;grid-template-columns:1fr 1fr;
      gap:0;flex:1;align-items:center;
      max-width:1100px;margin:0 auto;width:100%;
      padding:24px 32px 0;position:relative;z-index:2">

      <!-- LEFT: Text content -->
      <div style="padding:16px 0 32px">
        <div style="
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(255,255,255,.1);
          border:1px solid rgba(255,255,255,.2);border-radius:99px;
          padding:5px 14px;margin-bottom:20px">
          <span style="font-size:16px">🎓</span>
          <span style="font-size:11px;font-weight:700;color:#a7f3d0;letter-spacing:.4px">
            MFUMO WA KITAIFA WA UTAMBULISHO
          </span>
        </div>

        <h1 style="
          font-size:64px;font-weight:900;color:#fff;
          line-height:.95;letter-spacing:-3px;margin-bottom:12px">
          TSID
        </h1>
        <h2 style="
          font-size:20px;font-weight:800;color:#a7f3d0;
          margin-bottom:10px;line-height:1.2">
          Tanzania Student<br>Identification System
        </h2>
        <p style="
          font-size:13.5px;color:rgba(255,255,255,.75);
          line-height:1.7;margin-bottom:28px;max-width:380px">
          Kitambulisho cha kudumu cha mwanafunzi wa Tanzania —
          kwa shule, serikali na wanafunzi wote nchini.
        </p>

        <!-- CTAs -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <a href="#/search" style="
            display:inline-flex;align-items:center;gap:8px;
            background:#fff;color:#003366;
            padding:13px 26px;border-radius:12px;
            font-weight:800;font-size:14px;text-decoration:none;
            box-shadow:0 4px 20px rgba(0,0,0,.25);
            transition:transform .15s">
            🔍 Verify Student / School
          </a>
          <a href="#/login/school" style="
            display:inline-flex;align-items:center;gap:8px;
            background:rgba(255,255,255,.12);color:#fff;
            border:1.5px solid rgba(255,255,255,.3);
            padding:13px 22px;border-radius:12px;
            font-weight:700;font-size:14px;text-decoration:none;
            transition:background .15s">
            Sign In →
          </a>
        </div>

        <!-- Stats row -->
        <div style="
          display:flex;gap:24px;margin-top:28px;flex-wrap:wrap">
          <div>
            <div style="font-size:11px;color:#6ee7b7;font-weight:700">🏫 Schools</div>
            <div style="font-size:10px;color:rgba(255,255,255,.5)">Across Tanzania</div>
          </div>
          <div>
            <div style="font-size:11px;color:#6ee7b7;font-weight:700">🎓 Students</div>
            <div style="font-size:10px;color:rgba(255,255,255,.5)">Registered</div>
          </div>
          <div>
            <div style="font-size:11px;color:#6ee7b7;font-weight:700">🗺️ Regions</div>
            <div style="font-size:10px;color:rgba(255,255,255,.5)">Covered</div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Illustration -->
      <div style="
        display:flex;align-items:flex-end;justify-content:center;
        padding:0 0 0 16px;overflow:hidden">
        <div style="
          width:100%;border-radius:20px 20px 0 0;overflow:hidden;
          box-shadow:0 -8px 32px rgba(0,0,0,.2)">
          ${HERO_ILLUSTRATION}
        </div>
      </div>
    </div>

    <!-- Tanzania flag colour band at hero bottom -->
    <div style="height:5px;display:flex;width:100%;position:relative;z-index:2">
      <div style="flex:4.5;background:#1B8F3A"></div>
      <div style="flex:1;background:#FCD116"></div>
      <div style="flex:1;background:#000"></div>
      <div style="flex:3.5;background:#00A3DD"></div>
    </div>
  </section>

  <!-- ── ROLE CARDS ─────────────────────────────────────────────────────── -->
  <section style="max-width:900px;margin:0 auto;padding:36px 20px 48px">
    <div style="text-align:center;margin-bottom:20px">
      <p style="font-size:12px;color:#94a3b8;font-weight:700;
        text-transform:uppercase;letter-spacing:.6px">
        Ingia kwenye mfumo wako · Sign in to your portal
      </p>
    </div>
    <div class="rg-landing landing-role-grid">
      ${roleCards.map(card => `
        <a href="${card.href}" style="text-decoration:none">
          <div class="landing-role-card" style="
            background:#fff;border:2px solid #e2e8f0;border-radius:18px;
            padding:26px 20px;text-align:center">
            <div style="width:56px;height:56px;border-radius:16px;margin:0 auto 14px;
              background:${card.gradient};
              display:flex;align-items:center;justify-content:center;font-size:26px">${card.icon}</div>
            <div style="font-weight:800;font-size:16px;color:#0f172a;margin-bottom:6px">${card.title}</div>
            <div style="font-size:12.5px;color:#64748b;line-height:1.5;margin-bottom:16px">
              ${card.desc}
            </div>
            <div style="padding:11px;border-radius:10px;
              background:${card.gradient};
              color:#fff;font-size:13px;font-weight:700">Sign In →</div>
          </div>
        </a>
      `).join("")}
    </div>
  </section>

  <style>
    .landing-role-card:hover {
      border-color:#059669 !important;
      transform:translateY(-3px);
      box-shadow:0 10px 28px rgba(0,0,0,.1);
    }
    @media(max-width:768px){
      section > div[style*="grid-template-columns:1fr 1fr"] {
        grid-template-columns:1fr !important;
      }
      section > div[style*="grid-template-columns:1fr 1fr"] > div:last-child {
        display:none !important;
      }
      h1[style*="font-size:64px"] { font-size:52px !important; letter-spacing:-2px !important; }
      h2[style*="font-size:20px"] { font-size:16px !important; }
    }
  </style>

  ${Footer()}
  `;
}
