import { Navbar, initNavbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";

// ── SVG Hero Illustration — Happy Tanzania students ────────────────────────
const HERO_SVG = `<svg viewBox="0 0 860 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
  <defs>
    <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#87CEEB" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#d1fae5" stop-opacity=".3"/>
    </linearGradient>
    <linearGradient id="hground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="hpath" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="hwall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
  </defs>

  <!-- Background sky -->
  <rect width="860" height="340" fill="url(#hsky)"/>

  <!-- Sun + rays -->
  <circle cx="780" cy="60" r="42" fill="#fde68a" opacity=".8"/>
  <circle cx="780" cy="60" r="30" fill="#fcd34d"/>
  <g stroke="#fde68a" stroke-width="3.5" stroke-linecap="round" opacity=".6">
    <line x1="780" y1="8" x2="780" y2="18"/>
    <line x1="820" y1="20" x2="812" y2="28"/>
    <line x1="832" y1="60" x2="822" y2="60"/>
    <line x1="820" y1="100" x2="812" y2="92"/>
    <line x1="780" y1="112" x2="780" y2="102"/>
    <line x1="740" y1="100" x2="748" y2="92"/>
    <line x1="728" y1="60" x2="738" y2="60"/>
    <line x1="740" y1="20" x2="748" y2="28"/>
  </g>

  <!-- Clouds -->
  <g fill="white" opacity=".7">
    <ellipse cx="120" cy="55" rx="52" ry="18"/>
    <ellipse cx="90" cy="62" rx="34" ry="16"/>
    <ellipse cx="152" cy="62" rx="34" ry="15"/>
    <ellipse cx="440" cy="42" rx="46" ry="17"/>
    <ellipse cx="414" cy="50" rx="32" ry="14"/>
    <ellipse cx="468" cy="50" rx="30" ry="13"/>
  </g>

  <!-- Mountains background -->
  <g fill="#059669" opacity=".25">
    <polygon points="0,220 120,120 240,220"/>
    <polygon points="60,220 200,100 340,220"/>
    <polygon points="500,220 620,130 740,220"/>
  </g>

  <!-- School building -->
  <rect x="600" y="110" width="220" height="180" fill="url(#hwall)" rx="3"/>
  <polygon points="588,110 832,110 770,65 650,65" fill="#b91c1c" opacity=".9"/>
  <!-- Flag pole + TZ flag -->
  <line x1="708" y1="22" x2="708" y2="65" stroke="#78350f" stroke-width="3"/>
  <rect x="708" y="22" width="30" height="7" fill="#1B8F3A"/>
  <rect x="708" y="29" width="30" height="7" fill="#FCD116"/>
  <rect x="708" y="36" width="30" height="8" fill="#000"/>
  <rect x="708" y="44" width="30" height="7" fill="#00A3DD"/>
  <!-- Windows -->
  <g fill="#bae6fd" stroke="#7dd3fc" stroke-width="1.5">
    <rect x="620" y="130" width="42" height="38" rx="4"/>
    <rect x="678" y="130" width="42" height="38" rx="4"/>
    <rect x="736" y="130" width="42" height="38" rx="4"/>
    <rect x="620" y="185" width="42" height="38" rx="4"/>
    <rect x="736" y="185" width="42" height="38" rx="4"/>
  </g>
  <g stroke="#7dd3fc" stroke-width="1.5">
    <line x1="641" y1="130" x2="641" y2="168"/> <line x1="620" y1="149" x2="662" y2="149"/>
    <line x1="699" y1="130" x2="699" y2="168"/> <line x1="678" y1="149" x2="720" y2="149"/>
    <line x1="757" y1="130" x2="757" y2="168"/> <line x1="736" y1="149" x2="778" y2="149"/>
    <line x1="641" y1="185" x2="641" y2="223"/> <line x1="620" y1="204" x2="662" y2="204"/>
    <line x1="757" y1="185" x2="757" y2="223"/> <line x1="736" y1="204" x2="778" y2="204"/>
  </g>
  <!-- Door -->
  <rect x="672" y="200" width="46" height="90" fill="#92400e" rx="4"/>
  <circle cx="713" cy="248" r="3.5" fill="#fcd34d"/>
  <!-- Sign -->
  <rect x="622" y="112" width="136" height="16" fill="#003366" rx="3"/>
  <text x="690" y="124" text-anchor="middle" fill="white" font-size="8.5" font-weight="700" font-family="Arial,sans-serif">SHULE YA MSINGI TSID</text>

  <!-- Ground -->
  <rect x="0" y="272" width="860" height="68" fill="url(#hground)"/>
  <!-- Walking path -->
  <path d="M0,285 Q180,272 430,275 Q620,278 860,273 L860,295 Q620,290 430,287 Q180,284 0,297Z" fill="url(#hpath)" opacity=".8"/>
  <!-- Path markings -->
  <g stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-dasharray="18,12">
    <line x1="0" y1="290" x2="860" y2="284"/>
  </g>

  <!-- Trees -->
  <rect x="52" y="205" width="9" height="67" fill="#78350f"/>
  <ellipse cx="57" cy="190" rx="30" ry="34" fill="#15803d"/>
  <ellipse cx="44" cy="204" rx="21" ry="25" fill="#16a34a"/>
  <ellipse cx="70" cy="202" rx="19" ry="23" fill="#166534"/>

  <rect x="558" y="212" width="8" height="60" fill="#78350f"/>
  <ellipse cx="562" cy="198" rx="26" ry="30" fill="#15803d"/>
  <ellipse cx="549" cy="210" rx="18" ry="22" fill="#16a34a"/>

  <rect x="592" y="216" width="7" height="56" fill="#92400e"/>
  <ellipse cx="596" cy="204" rx="22" ry="26" fill="#166534"/>

  <!-- ════ STUDENT 1 — Boy, waving, school uniform, backpack ════ -->
  <g transform="translate(142,92)">
    <ellipse cx="26" cy="182" rx="24" ry="7" fill="rgba(0,0,0,.15)"/>
    <!-- Shoes -->
    <ellipse cx="15" cy="181" rx="11" ry="6" fill="#1c1917" transform="rotate(-7,15,181)"/>
    <ellipse cx="33" cy="183" rx="11" ry="6" fill="#1c1917" transform="rotate(9,33,183)"/>
    <!-- Trousers -->
    <rect x="13" y="132" width="13" height="52" rx="6" fill="#1e3a8a" transform="rotate(-7,19,132)"/>
    <rect x="24" y="132" width="13" height="52" rx="6" fill="#1e3a8a" transform="rotate(9,30,132)"/>
    <!-- Shirt (white) -->
    <rect x="9" y="80" width="36" height="56" rx="9" fill="#f8fafc"/>
    <!-- Tie -->
    <polygon points="24,80 28,80 26,96" fill="#dc2626"/>
    <!-- Backpack -->
    <rect x="39" y="82" width="20" height="36" rx="6" fill="#2563eb"/>
    <rect x="41" y="87" width="16" height="10" rx="3" fill="#1d4ed8"/>
    <line x1="41" y1="84" x2="41" y2="118" stroke="#1e40af" stroke-width="2.5"/>
    <!-- Arms: left waving UP -->
    <path d="M9,90 Q-14,66 -18,44" stroke="#b45309" stroke-width="12" stroke-linecap="round" fill="none"/>
    <!-- Hand waving -->
    <circle cx="-18" cy="40" r="9" fill="#d97706"/>
    <!-- Right arm down holding strap -->
    <path d="M45,90 Q54,110 52,124" stroke="#b45309" stroke-width="12" stroke-linecap="round" fill="none"/>
    <!-- Neck -->
    <rect x="19" y="63" width="15" height="20" rx="7" fill="#d97706"/>
    <!-- Head -->
    <circle cx="27" cy="50" r="26" fill="#d97706"/>
    <!-- Hair -->
    <ellipse cx="27" cy="28" rx="24" ry="12" fill="#1c1917"/>
    <ellipse cx="9" cy="42" rx="7" ry="12" fill="#1c1917"/>
    <ellipse cx="45" cy="42" rx="7" ry="12" fill="#1c1917"/>
    <!-- School cap -->
    <rect x="2" y="26" width="50" height="10" rx="4" fill="#003366"/>
    <ellipse cx="27" cy="26" rx="27" ry="9" fill="#003366"/>
    <ellipse cx="45" cy="31" rx="10" ry="5" fill="#1e40af"/>
    <!-- Eyes -->
    <circle cx="20" cy="49" r="4" fill="white"/>
    <circle cx="34" cy="49" r="4" fill="white"/>
    <circle cx="21" cy="50" r="2.2" fill="#1c1917"/>
    <circle cx="35" cy="50" r="2.2" fill="#1c1917"/>
    <circle cx="21" cy="48.5" r=".9" fill="white"/>
    <circle cx="35" cy="48.5" r=".9" fill="white"/>
    <!-- Big smile -->
    <path d="M17,62 Q27,74 37,62" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M19,63 Q27,72 35,63" fill="white" opacity=".9"/>
  </g>

  <!-- ════ STUDENT 2 — Girl, book, purple dress, braids ════ -->
  <g transform="translate(260,106)">
    <ellipse cx="23" cy="168" rx="22" ry="6" fill="rgba(0,0,0,.13)"/>
    <!-- Legs + shoes -->
    <rect x="10" y="162" width="11" height="40" rx="5.5" fill="#6d28d9" transform="rotate(-5,15,162)"/>
    <rect x="22" y="162" width="11" height="40" rx="5.5" fill="#5b21b6" transform="rotate(6,27,162)"/>
    <ellipse cx="12" cy="201" rx="10" ry="5.5" fill="#1c1917"/>
    <ellipse cx="29" cy="202" rx="10" ry="5.5" fill="#1c1917"/>
    <!-- Skirt -->
    <path d="M7,122 Q4,162 0,168 L46,168 Q42,162 39,122Z" fill="#7c3aed"/>
    <!-- Blouse -->
    <rect x="8" y="78" width="32" height="48" rx="9" fill="white"/>
    <rect x="7" y="122" width="32" height="7" rx="3" fill="#5b21b6"/>
    <!-- Book held left -->
    <rect x="-18" y="93" width="24" height="32" rx="3" fill="#dc2626" transform="rotate(-18,-6,109)"/>
    <line x1="-17" y1="96" x2="-15" y2="124" stroke="white" stroke-width="1.5" transform="rotate(-18,-6,109)"/>
    <line x1="-11" y1="95" x2="-9" y2="123" stroke="white" stroke-width="1" transform="rotate(-18,-6,109)"/>
    <!-- Arms -->
    <path d="M8,92 Q-6,104 -10,120" stroke="#b07850" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M40,92 Q54,108 52,126" stroke="#b07850" stroke-width="11" stroke-linecap="round" fill="none"/>
    <!-- Neck -->
    <rect x="17" y="63" width="13" height="18" rx="6" fill="#c68642"/>
    <!-- Head -->
    <circle cx="24" cy="52" r="23" fill="#c68642"/>
    <!-- Hair + braids -->
    <ellipse cx="24" cy="33" rx="21" ry="13" fill="#1c1917"/>
    <ellipse cx="6" cy="46" rx="6" ry="15" fill="#1c1917"/>
    <ellipse cx="42" cy="46" rx="6" ry="15" fill="#1c1917"/>
    <path d="M7,55 Q5,68 9,76" stroke="#1c1917" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M41,55 Q43,68 39,76" stroke="#1c1917" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- Hair bow -->
    <ellipse cx="24" cy="28" rx="15" ry="7" fill="#f43f5e"/>
    <circle cx="24" cy="28" r="4.5" fill="white"/>
    <!-- Eyes + expression -->
    <circle cx="18" cy="50" r="3.5" fill="white"/>
    <circle cx="30" cy="50" r="3.5" fill="white"/>
    <circle cx="18.8" cy="51" r="2" fill="#1c1917"/>
    <circle cx="30.8" cy="51" r="2" fill="#1c1917"/>
    <circle cx="18.8" cy="49.5" r=".8" fill="white"/>
    <path d="M14,62 Q24,73 34,62" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M16,63 Q24,71 32,63" fill="white" opacity=".85"/>
    <ellipse cx="11" cy="58" rx="5.5" ry="3" fill="#fb7185" opacity=".45"/>
    <ellipse cx="37" cy="58" rx="5.5" ry="3" fill="#fb7185" opacity=".45"/>
  </g>

  <!-- ════ STUDENT 3 — Boy, football, jersey #10 ════ -->
  <g transform="translate(376,84)">
    <ellipse cx="25" cy="190" rx="24" ry="7" fill="rgba(0,0,0,.13)"/>
    <!-- Standing leg -->
    <rect x="13" y="144" width="13" height="48" rx="6.5" fill="#1e3a8a" transform="rotate(-9,19,144)"/>
    <!-- Kicking leg -->
    <rect x="26" y="140" width="13" height="44" rx="6.5" fill="#1e3a8a" transform="rotate(38,32,140)"/>
    <ellipse cx="51" cy="176" rx="11" ry="5.5" fill="#1c1917" transform="rotate(38,51,176)"/>
    <ellipse cx="15" cy="190" rx="11" ry="6" fill="#1c1917" transform="rotate(-9,15,190)"/>
    <!-- Football -->
    <circle cx="64" cy="168" r="16" fill="white" stroke="#1c1917" stroke-width="2"/>
    <g fill="#1c1917">
      <polygon points="64,152 60,160 68,160"/>
      <polygon points="64,184 60,176 68,176"/>
      <polygon points="48,168 56,164 56,172"/>
      <polygon points="80,168 72,164 72,172"/>
    </g>
    <!-- Jersey -->
    <rect x="9" y="88" width="34" height="58" rx="9" fill="#16a34a"/>
    <text x="26" y="122" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial,sans-serif">10</text>
    <!-- Collar -->
    <rect x="15" y="88" width="22" height="10" rx="5" fill="#15803d"/>
    <!-- Arms -->
    <path d="M9,96 Q-8,114 -6,130" stroke="#7c3404" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M43,96 Q58,112 56,128" stroke="#7c3404" stroke-width="12" stroke-linecap="round" fill="none"/>
    <!-- Neck -->
    <rect x="19" y="72" width="14" height="20" rx="7" fill="#92400e"/>
    <!-- Head -->
    <circle cx="26" cy="58" r="26" fill="#92400e"/>
    <!-- Hair -->
    <ellipse cx="26" cy="36" rx="24" ry="13" fill="#1c1917"/>
    <ellipse cx="8" cy="50" rx="7" ry="13" fill="#1c1917"/>
    <ellipse cx="44" cy="50" rx="7" ry="13" fill="#1c1917"/>
    <!-- Eyes -->
    <circle cx="19" cy="57" r="4" fill="white"/>
    <circle cx="33" cy="57" r="4" fill="white"/>
    <circle cx="19.8" cy="58" r="2.3" fill="#1c1917"/>
    <circle cx="33.8" cy="58" r="2.3" fill="#1c1917"/>
    <circle cx="19.8" cy="56.5" r=".9" fill="white"/>
    <circle cx="33.8" cy="56.5" r=".9" fill="white"/>
    <!-- Excited smile -->
    <path d="M15,70 Q26,83 37,70" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M17,71 Q26,81 35,71" fill="white" opacity=".9"/>
  </g>

  <!-- ════ STUDENT 4 — Girl, tablet/TSID, headband ════ -->
  <g transform="translate(490,100)">
    <ellipse cx="23" cy="174" rx="21" ry="6" fill="rgba(0,0,0,.12)"/>
    <!-- Legs + shoes -->
    <rect x="12" y="138" width="11" height="38" rx="5.5" fill="#0f172a" transform="rotate(-5,17,138)"/>
    <rect x="22" y="138" width="11" height="38" rx="5.5" fill="#0f172a" transform="rotate(5,27,138)"/>
    <ellipse cx="14" cy="175" rx="10" ry="5.5" fill="#1e293b"/>
    <ellipse cx="29" cy="176" rx="10" ry="5.5" fill="#1e293b"/>
    <!-- Skirt -->
    <path d="M9,122 Q6,140 2,146 L44,146 Q40,140 37,122Z" fill="#0f172a"/>
    <!-- Blouse -->
    <rect x="8" y="76" width="32" height="50" rx="9" fill="#e0f2fe"/>
    <!-- Tablet held up left -->
    <rect x="-20" y="70" width="28" height="38" rx="4.5" fill="#1e293b" transform="rotate(-12,-6,89)"/>
    <rect x="-18" y="72" width="24" height="32" rx="3.5" fill="#0ea5e9" transform="rotate(-12,-6,89)"/>
    <text x="-6" y="91" text-anchor="middle" fill="white" font-size="8" font-weight="900" font-family="Arial,sans-serif" transform="rotate(-12,-6,89)">TSID</text>
    <text x="-6" y="100" text-anchor="middle" fill="rgba(255,255,255,.7)" font-size="5.5" font-family="Arial,sans-serif" transform="rotate(-12,-6,89)">✓ Verified</text>
    <!-- Arms -->
    <path d="M8,90 Q-6,90 -14,93" stroke="#a07850" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M40,92 Q52,108 50,124" stroke="#a07850" stroke-width="11" stroke-linecap="round" fill="none"/>
    <!-- Neck -->
    <rect x="18" y="63" width="12" height="16" rx="6" fill="#c68642"/>
    <!-- Head -->
    <circle cx="24" cy="52" r="22" fill="#c68642"/>
    <!-- Natural hair -->
    <ellipse cx="24" cy="33" rx="22" ry="14" fill="#1c1917"/>
    <ellipse cx="5" cy="47" rx="6.5" ry="13" fill="#1c1917"/>
    <ellipse cx="43" cy="47" rx="6.5" ry="13" fill="#1c1917"/>
    <!-- Headband -->
    <rect x="3" y="36" width="42" height="8" rx="4" fill="#f97316"/>
    <!-- Eyes -->
    <circle cx="18" cy="51" r="3.5" fill="white"/>
    <circle cx="30" cy="51" r="3.5" fill="white"/>
    <circle cx="18.8" cy="52" r="2" fill="#1c1917"/>
    <circle cx="30.8" cy="52" r="2" fill="#1c1917"/>
    <circle cx="18.8" cy="50.5" r=".8" fill="white"/>
    <!-- Excited face -->
    <path d="M14,62 Q24,75 34,62" stroke="#1c1917" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M16,63 Q24,73 32,63" fill="white" opacity=".85"/>
    <ellipse cx="11" cy="58" rx="5" ry="3" fill="#fb923c" opacity=".45"/>
    <ellipse cx="37" cy="58" rx="5" ry="3" fill="#fb923c" opacity=".45"/>
  </g>

  <!-- Floating books -->
  <g opacity=".7">
    <rect x="330" y="50" width="20" height="27" rx="3" fill="white" transform="rotate(18,340,63)"/>
    <line x1="333" y1="58" x2="348" y2="55" stroke="#cbd5e1" stroke-width="1.5" transform="rotate(18,340,63)"/>
    <line x1="333" y1="64" x2="348" y2="61" stroke="#cbd5e1" stroke-width="1.5" transform="rotate(18,340,63)"/>
    <rect x="455" y="38" width="18" height="24" rx="3" fill="white" transform="rotate(-14,464,50)"/>
    <line x1="458" y1="45" x2="471" y2="43" stroke="#cbd5e1" stroke-width="1.5" transform="rotate(-14,464,50)"/>
  </g>

  <!-- Floating TSID card -->
  <g transform="rotate(-9,110,142)">
    <rect x="80" y="128" width="46" height="30" rx="5" fill="#003366" opacity=".9"/>
    <rect x="82" y="130" width="42" height="26" rx="4" fill="#1e40af" opacity=".8"/>
    <text x="103" y="146" text-anchor="middle" fill="white" font-size="8" font-weight="900" font-family="Arial,sans-serif">TSID</text>
    <text x="103" y="154" text-anchor="middle" fill="#a7f3d0" font-size="5.5" font-family="Arial,sans-serif">STUDENT ID</text>
  </g>

  <!-- Stars/sparkles -->
  <g fill="#fde68a" opacity=".75">
    <polygon points="98,40 100,47 107,47 101,51 103,58 98,54 93,58 95,51 89,47 96,47" transform="scale(.55) translate(60,0)"/>
    <polygon points="360,18 362,25 369,25 363,29 365,36 360,32 355,36 357,29 351,25 358,25" transform="scale(.5)"/>
    <polygon points="490,28 492,34 498,34 494,38 495,44 490,40 485,44 486,38 482,34 488,34" transform="scale(.58)"/>
  </g>

  <!-- Bottom caption ribbon -->
  <rect x="0" y="302" width="860" height="38" fill="rgba(0,40,80,.75)"/>
  <text x="430" y="326" text-anchor="middle" fill="white" font-size="12" font-weight="800" font-family="Arial,sans-serif" letter-spacing="2.5">
    WATOTO WA TANZANIA — MUSTAKABALI WA TAIFA 🇹🇿
  </text>
</svg>`;

// ── Partners list ───────────────────────────────────────────────────────────
const PARTNERS = [
  { short:"MoEST",    name:"Wizara ya Elimu",                        url:"https://www.moe.go.tz",      icon:"🏛️" },
  { short:"NECTA",    name:"National Examinations Council",          url:"https://www.necta.go.tz",    icon:"📋" },
  { short:"NACTE",    name:"Natl Council Tech Education",            url:"https://www.nacte.go.tz",    icon:"📜" },
  { short:"TCU",      name:"Tanzania Commission for Universities",   url:"https://www.tcu.go.tz",      icon:"🎓" },
  { short:"VETA",     name:"Vocational Education Training Auth",     url:"https://www.veta.go.tz",     icon:"🔧" },
  { short:"NIDA",     name:"National Identification Authority",      url:"https://www.nida.go.tz",     icon:"🪪" },
  { short:"COSTECH",  name:"Commission for Science & Technology",    url:"https://www.costech.or.tz",  icon:"🔬" },
  { short:"eGA",      name:"e-Government Authority",                 url:"https://www.ega.go.tz",      icon:"🖥️" },
  { short:"TAMISEMI", name:"Ofisi ya Rais — TAMISEMI",               url:"https://www.tamisemi.go.tz", icon:"🏢" },
  { short:"UDSM",     name:"University of Dar es Salaam",            url:"https://www.udsm.ac.tz",     icon:"🏫" },
  { short:"OUT",      name:"Open University of Tanzania",            url:"https://www.out.ac.tz",      icon:"📡" },
  { short:"TLSB",     name:"Tanzania Library Services Board",        url:"https://www.tlsb.or.tz",     icon:"📚" },
];

export function LandingView() {
  setTimeout(initNavbar, 0);

  return `
  ${Navbar()}

  <!-- ══════════════════════════════════════════════════════════════════════
       HERO SECTION
  ══════════════════════════════════════════════════════════════════════════ -->
  <section class="landing-hero-wrap" style="
    background:linear-gradient(150deg,#002855 0%,#0a4d30 55%,#059669 100%);
    overflow:hidden;position:relative">

    <!-- ── Government header bar ── -->
    <div class="landing-gov-bar" style="
      display:flex;align-items:center;justify-content:center;
      gap:16px;padding:18px 28px 0;position:relative;z-index:3">

      <!-- Coat of arms -->
      <img src="/assets/coat-of-arms.png" alt="Coat of Arms of Tanzania"
        style="width:72px;height:72px;object-fit:contain;flex-shrink:0;
          filter:drop-shadow(0 3px 10px rgba(0,0,0,.4));
          transition:transform .2s"
        class="landing-coat">

      <!-- Divider -->
      <div style="width:1.5px;height:52px;background:rgba(255,255,255,.2);flex-shrink:0"></div>

      <!-- Title text block -->
      <div>
        <div style="font-size:13px;font-weight:900;color:#fff;
          letter-spacing:.6px;text-transform:uppercase;line-height:1.2">
          Jamhuri ya Muungano wa Tanzania
        </div>
        <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.55);
          margin-top:2px">
          United Republic of Tanzania · Wizara ya Elimu
        </div>
      </div>

      <!-- TSID badge -->
      <div style="
        margin-left:8px;
        background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);
        border-radius:10px;padding:6px 14px;flex-shrink:0">
        <div style="font-size:16px;font-weight:900;color:#fff;line-height:1">TSID</div>
        <div style="font-size:9px;font-weight:700;color:#6ee7b7;
          text-transform:uppercase;letter-spacing:.5px">Official</div>
      </div>
    </div>

    <!-- ── Main hero body: text LEFT + illustration RIGHT ── -->
    <div class="landing-hero-body" style="
      display:grid;grid-template-columns:1fr 1fr;
      max-width:1100px;margin:0 auto;width:100%;
      padding:28px 32px 0;gap:0;align-items:flex-end;position:relative;z-index:2">

      <!-- LEFT: copy -->
      <div class="landing-hero-text" style="padding-bottom:36px">

        <!-- Badge -->
        <div style="
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);
          border-radius:99px;padding:6px 16px;margin-bottom:22px">
          <span style="font-size:14px">🎓</span>
          <span style="font-size:11px;font-weight:700;color:#a7f3d0;letter-spacing:.5px">
            MFUMO WA KITAIFA · NATIONAL SYSTEM
          </span>
        </div>

        <!-- Main title -->
        <h1 style="font-size:76px;font-weight:900;color:#fff;
          line-height:.9;letter-spacing:-4px;margin-bottom:16px;
          text-shadow:0 4px 20px rgba(0,0,0,.3)">
          TSID
        </h1>

        <!-- Subtitle -->
        <h2 style="font-size:22px;font-weight:800;color:#a7f3d0;
          line-height:1.25;margin-bottom:14px;letter-spacing:-.3px">
          Tanzania Student<br>Identification System
        </h2>

        <!-- Body copy -->
        <p style="font-size:14px;color:rgba(255,255,255,.72);
          line-height:1.75;margin-bottom:30px;max-width:400px">
          Kitambulisho cha kudumu cha mwanafunzi wa Tanzania —
          kwa <strong style="color:#a7f3d0">shule</strong>,
          <strong style="color:#a7f3d0">serikali</strong> na
          <strong style="color:#a7f3d0">wanafunzi</strong> wote nchini.
        </p>

        <!-- CTA buttons -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px">
          <a href="#/search" style="
            display:inline-flex;align-items:center;gap:8px;
            background:#fff;color:#002855;
            padding:14px 28px;border-radius:12px;
            font-weight:800;font-size:14px;text-decoration:none;
            box-shadow:0 6px 24px rgba(0,0,0,.3);
            transition:all .18s;white-space:nowrap">
            🔍 Verify Student / School
          </a>
          <a href="#/login/school" style="
            display:inline-flex;align-items:center;gap:8px;
            background:rgba(255,255,255,.13);color:#fff;
            border:1.5px solid rgba(255,255,255,.3);
            padding:14px 24px;border-radius:12px;
            font-weight:700;font-size:14px;text-decoration:none;
            transition:all .18s;white-space:nowrap">
            Ingia Mfumoni →
          </a>
        </div>

        <!-- Quick stats -->
        <div style="display:flex;gap:28px;flex-wrap:wrap">
          ${[["🏫","Shule","Schools Nationwide"],["🎓","Wanafunzi","Students Registered"],["🗺️","Mikoa","Regions Covered"]].map(([icon,sw,en])=>`
            <div>
              <div style="font-size:12px;font-weight:800;color:#6ee7b7">${icon} ${sw}</div>
              <div style="font-size:10px;color:rgba(255,255,255,.45);margin-top:1px">${en}</div>
            </div>`).join("")}
        </div>
      </div>

      <!-- RIGHT: illustration -->
      <div class="landing-hero-art" style="
        align-self:flex-end;overflow:hidden;
        border-radius:20px 20px 0 0;
        box-shadow:-8px -8px 40px rgba(0,0,0,.25)">
        ${HERO_SVG}
      </div>
    </div>

    <!-- Flag colour band -->
    <div style="height:6px;display:flex;width:100%;position:relative;z-index:2">
      <div style="flex:4.5;background:#1B8F3A"></div>
      <div style="flex:1;background:#FCD116"></div>
      <div style="flex:1;background:#000"></div>
      <div style="flex:3.5;background:#00A3DD"></div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════════════
       SIGN IN PORTALS
  ══════════════════════════════════════════════════════════════════════════ -->
  <section style="background:#f8fafc;padding:44px 20px">
    <div style="max-width:860px;margin:0 auto">
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-size:11.5px;font-weight:800;color:#94a3b8;
          text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px">
          Ingia kwenye mfumo wako
        </div>
        <div style="font-size:24px;font-weight:900;color:#0f172a">
          Sign in to your portal
        </div>
      </div>

      <div class="rg-landing" style="gap:18px">
        ${[
          { href:"#/login/school",  icon:"🏫", grad:"135deg,#059669,#047857", title:"Shule",       en:"School",    desc:"Register students, manage applications & payments" },
          { href:"#/login/gov",     icon:"🏛️", grad:"135deg,#002855,#1e40af", title:"Serikali",    en:"Government",desc:"National oversight of all schools and students" },
          { href:"#/login/student", icon:"🎓", grad:"135deg,#7c3aed,#5b21b6", title:"Mwanafunzi",  en:"Student",   desc:"View your ID card, certificates and letters" },
        ].map(c=>`
          <a href="${c.href}" style="text-decoration:none">
            <div class="landing-role-card" style="
              background:#fff;border:2px solid #e2e8f0;border-radius:20px;
              padding:28px 22px;text-align:center;height:100%;
              transition:all .2s;box-sizing:border-box">
              <div style="
                width:62px;height:62px;border-radius:18px;margin:0 auto 16px;
                background:linear-gradient(${c.grad});
                display:flex;align-items:center;justify-content:center;font-size:28px;
                box-shadow:0 6px 18px rgba(0,0,0,.15)">
                ${c.icon}
              </div>
              <div style="font-size:20px;font-weight:900;color:#0f172a;margin-bottom:2px">
                ${c.title}
              </div>
              <div style="font-size:12px;font-weight:700;color:#94a3b8;
                margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
                ${c.en}
              </div>
              <div style="font-size:13px;color:#64748b;line-height:1.55;margin-bottom:20px">
                ${c.desc}
              </div>
              <div style="
                padding:12px;border-radius:12px;
                background:linear-gradient(${c.grad});
                color:#fff;font-size:13.5px;font-weight:800;
                box-shadow:0 4px 12px rgba(0,0,0,.15)">
                Ingia / Sign In →
              </div>
            </div>
          </a>`).join("")}
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════════════════
       PARTNER EDUCATION BODIES
  ══════════════════════════════════════════════════════════════════════════ -->
  <section style="background:#fff;padding:44px 20px 52px">
    <div style="max-width:980px;margin:0 auto">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px">
        <div style="font-size:11.5px;font-weight:800;color:#94a3b8;
          text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px">
          Wadau wa Elimu Tanzania
        </div>
        <div style="font-size:24px;font-weight:900;color:#0f172a;margin-bottom:8px">
          Tanzania Education Bodies
        </div>
        <div style="font-size:13px;color:#64748b">
          Official partner institutions connected to the TSID national registry
        </div>
      </div>

      <!-- Chips grid -->
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
        ${PARTNERS.map(p=>`
          <a href="${p.url}" target="_blank" rel="noopener noreferrer"
            class="partner-chip"
            style="display:inline-flex;align-items:center;gap:9px;
              background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;
              padding:10px 16px;text-decoration:none;transition:all .18s">
            <span style="font-size:18px">${p.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:800;color:#0f172a">${p.short}</div>
              <div style="font-size:10.5px;color:#64748b">${p.name}</div>
            </div>
          </a>`).join("")}
      </div>

      <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px">
        All links open official government websites in a new tab.
      </p>
    </div>
  </section>

  <style>
    .landing-coat:hover { transform:scale(1.05); }

    .landing-role-card:hover {
      border-color:#059669 !important;
      transform:translateY(-4px);
      box-shadow:0 14px 36px rgba(0,0,0,.12);
    }
    .partner-chip:hover {
      border-color:#059669 !important;
      background:#f0fdf4 !important;
      transform:translateY(-2px);
      box-shadow:0 4px 14px rgba(5,150,105,.12);
    }

    /* ── Mobile ── */
    @media (max-width:768px) {
      .landing-hero-body {
        grid-template-columns:1fr !important;
        padding:20px 18px 0 !important;
      }
      .landing-hero-art { display:none !important; }
      .landing-hero-text { padding-bottom:20px !important; }
      h1[style*="font-size:76px"] { font-size:56px !important; letter-spacing:-2px !important; }
      h2[style*="font-size:22px"] { font-size:18px !important; }
      .landing-gov-bar { gap:10px !important; padding:14px 16px 0 !important; }
      .landing-gov-bar img { width:54px !important; height:54px !important; }
    }
    @media (max-width:480px) {
      .partner-chip > div > div:last-child { display:none; }
    }
  </style>

  ${Footer()}
  `;
}
