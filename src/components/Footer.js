// ============================================================================
//  Footer — Tanzania education bodies + TSID links
// ============================================================================

const EDU_BODIES = [
  {
    category: "Serikali / Government",
    color: "#003860",
    bg: "#dce8f5",
    icon: "🏛️",
    links: [
      { name: "Wizara ya Elimu, Sayansi na Teknolojia", short: "MoEST", url: "https://www.moe.go.tz" },
      { name: "Ofisi ya Rais — TAMISEMI", short: "TAMISEMI", url: "https://www.tamisemi.go.tz" },
    ],
  },
  {
    category: "Mitihani / Examinations",
    color: "#065f46",
    bg: "#ecfdf5",
    icon: "📋",
    links: [
      { name: "National Examinations Council of Tanzania", short: "NECTA", url: "https://www.necta.go.tz" },
      { name: "National Council for Technical Education", short: "NACTE", url: "https://www.nacte.go.tz" },
    ],
  },
  {
    category: "Elimu ya Juu / Higher Education",
    color: "#5b21b6",
    bg: "#f5f3ff",
    icon: "🎓",
    links: [
      { name: "Tanzania Commission for Universities", short: "TCU", url: "https://www.tcu.go.tz" },
      { name: "University of Dar es Salaam", short: "UDSM", url: "https://www.udsm.ac.tz" },
    ],
  },
  {
    category: "Mafunzo ya Ufundi / Vocational",
    color: "#92400e",
    bg: "#fffbeb",
    icon: "🔧",
    links: [
      { name: "Vocational Education Training Authority", short: "VETA", url: "https://www.veta.go.tz" },
    ],
  },
  {
    category: "Mifumo ya Kitaifa / National Systems",
    color: "#374151",
    bg: "#f8fafc",
    icon: "🖥️",
    links: [
      { name: "National Identification Authority", short: "NIDA", url: "https://www.nida.go.tz" },
      { name: "e-Government Authority Tanzania", short: "eGA", url: "https://www.ega.go.tz" },
    ],
  },
];

export function Footer() {
  const bodyLinks = EDU_BODIES.map(group => `
    <div style="margin-bottom:0">
      <div style="
        display:flex;align-items:center;gap:8px;
        font-size:11px;font-weight:800;text-transform:uppercase;
        letter-spacing:.5px;color:#94a3b8;margin-bottom:10px">
        <span>${group.icon}</span>
        <span>${group.category}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${group.links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener noreferrer" style="
            display:flex;align-items:center;gap:8px;
            text-decoration:none;group:true">
            <span style="
              background:${group.bg};color:${group.color};
              font-size:9.5px;font-weight:800;padding:2px 7px;
              border-radius:5px;white-space:nowrap;flex-shrink:0;
              border:1px solid ${group.color}22">
              ${l.short}
            </span>
            <span style="
              font-size:12px;color:#94a3b8;line-height:1.4;
              transition:color .15s"
              class="footer-link-text">
              ${l.name}
            </span>
            <span style="color:#64748b;font-size:10px;margin-left:auto;flex-shrink:0">↗</span>
          </a>`).join("")}
      </div>
    </div>`).join("");

  return `
  <footer style="background:#f8fafc;padding:0;margin-top:40px">

    <!-- Partners header -->
    <div style="
      border-bottom:1px solid #e2e8f0;
      padding:24px 24px 0">
      <div style="max-width:1100px;margin:0 auto">
        <div style="
          display:flex;align-items:center;gap:10px;margin-bottom:20px">
          <div style="
            width:2px;height:20px;
            background:linear-gradient(180deg,#004f8a,#003860);
            border-radius:99px"></div>
          <div style="font-size:12px;font-weight:800;color:#1e293b;
            text-transform:uppercase;letter-spacing:.6px">
            Taasisi za Elimu Tanzania
          </div>
          <div style="height:1px;flex:1;background:#e2e8f0"></div>
          <div style="font-size:11px;color:#94a3b8">Tanzania Education Bodies</div>
        </div>

        <!-- Links grid -->
        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
          gap:24px 32px;
          padding-bottom:28px">
          ${bodyLinks}
        </div>
      </div>
    </div>

    <!-- Quick links bar -->
    <div style="
      border-bottom:1px solid #e2e8f0;
      padding:14px 24px">
      <div style="
        max-width:1100px;margin:0 auto;
        display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <span style="font-size:11px;font-weight:700;color:#64748b;
          text-transform:uppercase;letter-spacing:.4px">TSID</span>
        ${[
          ["#/",             "Home"],
          ["#/search",       "Verify Student"],
          ["#/login/school", "School Login"],
          ["#/login/gov",    "Gov Login"],
          ["#/login/student","Student Login"],
        ].map(([href, label]) => `
          <a href="${href}" style="
            font-size:12px;color:#64748b;text-decoration:none;
            transition:color .15s;font-weight:500"
            onmouseover="this.style.color='#1B8F3A'"
            onmouseout="this.style.color='#64748b'">
            ${label}
          </a>`).join(`<span style="color:#1e293b">·</span>`)}
      </div>
    </div>

    <!-- Bottom bar -->
    <div style="padding:16px 24px">
      <div style="
        max-width:1100px;margin:0 auto;
        display:flex;align-items:center;justify-content:space-between;
        flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:12.5px;font-weight:700;color:#1e293b;margin-bottom:2px">
            Tanzania Student Identification System
          </div>
          <div style="font-size:11px;color:#94a3b8">
            © 2026 Jamhuri ya Muungano wa Tanzania · For official use only
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <a href="https://www.moe.go.tz" target="_blank" rel="noopener" style="
            font-size:11px;color:#64748b;text-decoration:none">
            🌐 verify.tsid.go.tz
          </a>
          <span style="
            background:rgba(5,150,105,.15);color:#34d399;
            font-size:10px;font-weight:800;padding:3px 10px;border-radius:99px;
            border:1px solid rgba(5,150,105,.3)">
            ✓ OFFICIAL SYSTEM
          </span>
        </div>
      </div>
    </div>

  </footer>

  <style>
    footer a:hover .footer-link-text { color:#1e293b !important; }
  </style>
  `;
}
