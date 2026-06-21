import { currentSession } from "../store/db.js";
import { escapeHtml } from "../lib/util.js";

const ROLE_META = {
  school:  { label: "School",       color: "green"  },
  gov:     { label: "Government",   color: "yellow" },
  student: { label: "Student",      color: "blue"   },
};

const LINKS = {
  school: [
    { href: "#/school/dashboard",      label: "Dashboard",       icon: "▣" },
    { href: "#/school/create-student", label: "Create Student",  icon: "✚" },
    { href: "#/school/students",       label: "Student Database",icon: "☰" },
    { href: "#/school/applications",   label: "Applications",    icon: "✓" },
    { href: "#/school/payments",       label: "Payments",        icon: "₵" },
    { href: "#/school/settings",       label: "Settings",        icon: "⚙" },
  ],
  gov: [
    { href: "#/gov/dashboard", label: "Dashboard",     icon: "▣" },
    { href: "#/gov/students",  label: "Students",      icon: "🎓" },
    { href: "#/gov/schools",   label: "Schools",       icon: "🏫" },
    { href: "#/gov/logs",      label: "Activity Logs", icon: "📋" },
  ],
  student: [
    { href: "#/student/dashboard",      label: "Dashboard",           icon: "▣" },
    { href: "#/student/id",             label: "My ID",               icon: "▤" },
    { href: "#/student/certificates",   label: "Certificates",        icon: "★" },
    { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
    { href: "#/student/payments",       label: "Payments",            icon: "₵" },
  ],
};

export function Navbar(activeHref) {
  const session = currentSession();
  const role    = session?.role || null;
  const links   = role ? (LINKS[role] || []) : [];
  const meta    = role ? ROLE_META[role] : null;
  const initial = session ? (session.name || "U").charAt(0).toUpperCase() : null;

  // Desktop nav links
  const desktopLinks = links.map(l => `
    <a href="${l.href}" class="${activeHref === l.href ? "active" : ""}">
      <span style="opacity:.7;margin-right:5px">${l.icon}</span>${l.label}
    </a>`).join("");

  const publicLinks = `
    <a href="#/" class="${activeHref === "#/" ? "active" : ""}">Home</a>
    <a href="#/search" class="${activeHref === "#/search" ? "active" : ""}">Verify</a>`;

  // Session chip (desktop)
  const sessionChip = session
    ? `<div class="session-chip">
         <div class="avatar">${initial}</div>
         <div style="display:flex;flex-direction:column;line-height:1.2">
           <span style="font-weight:800;font-size:12px">${escapeHtml(session.name)}</span>
           <span style="font-size:10px;opacity:.8">${meta ? meta.label : role}</span>
         </div>
         <a href="#/logout" style="margin-left:6px;color:#fca5a5;font-size:12px;font-weight:700;text-decoration:none">Out</a>
       </div>`
    : `<a href="#/" class="btn btn-green btn-sm">Sign In</a>`;

  // Mobile drawer links
  const drawerLinks = [
    { href: "#/",      label: "Home",           icon: "🏠" },
    { href: "#/search",label: "Verify Student", icon: "🔍" },
    ...(role === "school" ? [
      { href:"#/school/dashboard",       label:"Dashboard",       icon:"▣" },
      { href:"#/school/create-student",  label:"Create Student",  icon:"✚" },
      { href:"#/school/students",        label:"Student Database",icon:"☰" },
      { href:"#/school/applications",    label:"Applications",    icon:"✓" },
      { href:"#/school/payments",        label:"Payments",        icon:"₵" },
      { href:"#/school/settings",        label:"Settings",        icon:"⚙" },
    ] : role === "gov" ? [
      { href:"#/gov/dashboard", label:"Dashboard",     icon:"▣" },
      { href:"#/gov/students",  label:"Students",      icon:"🎓" },
      { href:"#/gov/schools",   label:"Schools",       icon:"🏫" },
      { href:"#/gov/logs",      label:"Activity Logs", icon:"📋" },
    ] : role === "student" ? [
      { href:"#/student/dashboard",       label:"Dashboard",           icon:"▣" },
      { href:"#/student/id",              label:"My ID Card",          icon:"▤" },
      { href:"#/student/certificates",    label:"Certificates",        icon:"★" },
      { href:"#/student/request-letter",  label:"Request Letter",      icon:"✉" },
      { href:"#/student/payments",        label:"Payments",            icon:"₵" },
    ] : []),
    ...(session ? [{ href:"#/logout", label:"Sign Out", icon:"🚪" }] : []),
  ].map(l => `
    <a href="${l.href}" class="${activeHref === l.href ? "active" : ""}">
      <span class="ic">${l.icon}</span>${escapeHtml(l.label)}
    </a>`).join("");

  return `
  <nav class="tsid-navbar">
    <div class="inner">
      <a href="#/" class="brand" style="text-decoration:none;color:inherit;flex-shrink:0;display:flex;align-items:center;gap:8px">
        <img src="/assets/tanzania-coat.png" alt="Tanzania Coat of Arms" style="width:32px;height:32px;border-radius:4px">
        <span>TSID</span>
        ${meta ? `<span class="badge">${meta.label}</span>` : ""}
      </a>
      <div class="nav-links">
        ${publicLinks}
        ${desktopLinks}
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${sessionChip}
        <button class="tsid-hamburger" id="tsidHamburger" aria-label="Menu">☰</button>
      </div>
    </div>
  </nav>

  <!-- Mobile nav overlay + drawer -->
  <div class="tsid-mobile-nav" id="tsidMobileNav">
    <div class="tsid-mobile-nav-panel">
      <div class="tsid-mobile-nav-header">
        <span class="brand-text" style="display:flex;align-items:center;gap:8px">
          <img src="/assets/tanzania-coat.png" alt="Tanzania Coat of Arms" style="width:32px;height:32px;border-radius:4px">
          TSID
        </span>
        ${session ? `<div style="font-size:12px;color:#a7f3d0;font-weight:600">${escapeHtml(session.name)}</div>` : ""}
        <button class="tsid-mobile-nav-close" id="tsidNavClose">✕</button>
      </div>
      ${role ? `<div class="tsid-mobile-nav-section">${meta?.label || role} Panel</div>` : ""}
      ${drawerLinks}
    </div>
  </div>`;
}

// Wire hamburger — called once after each render
export function initNavbar() {
  const ham   = document.getElementById("tsidHamburger");
  const nav   = document.getElementById("tsidMobileNav");
  const close = document.getElementById("tsidNavClose");
  if (!ham || !nav) return;

  ham.addEventListener("click", () => nav.classList.add("open"));
  close?.addEventListener("click", () => nav.classList.remove("open"));
  nav.addEventListener("click", (e) => {
    if (e.target === nav) nav.classList.remove("open");
    // Close when a link is tapped
    if (e.target.tagName === "A") nav.classList.remove("open");
  });
}

export function handleLogout() { window.location.hash = "#/logout"; }
