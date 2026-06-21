import { currentSession, logout } from "../store/db.js";

const ROLE_META = {
  school: { label: "School", color: "green" },
  gov: { label: "Government", color: "yellow" },
  student: { label: "Student/Parent", color: "blue" },
};

const LINKS = {
  school: [
    { href: "#/school/dashboard", label: "Dashboard", icon: "▣" },
    { href: "#/school/create-student", label: "Create Student", icon: "✚" },
    { href: "#/school/students", label: "Student Database", icon: "☰" },
    { href: "#/school/applications", label: "Applications", icon: "✓" },
    { href: "#/school/payments", label: "Payments", icon: "₵" },
    { href: "#/school/settings", label: "School Settings", icon: "⚙" },
  ],
  gov: [
    { href: "#/gov/dashboard", label: "Dashboard", icon: "▣" },
    { href: "#/gov/students", label: "Students Database", icon: "☰" },
    { href: "#/gov/schools", label: "Create School", icon: "✚" },
    { href: "#/gov/logs", label: "Logs", icon: "⌷" },
  ],
  student: [
    { href: "#/student/dashboard", label: "Dashboard", icon: "▣" },
    { href: "#/student/id", label: "My ID", icon: "▤" },
    { href: "#/student/certificates", label: "Certificates", icon: "★" },
    { href: "#/student/request-letter", label: "Request Utambulisho", icon: "✉" },
    { href: "#/student/payments", label: "Payments", icon: "₵" },
  ],
};

export function Navbar(activeHref) {
  const session = currentSession();
  const role = session ? session.role : null;
  const links = role ? LINKS[role] || [] : [];
  const meta = role ? ROLE_META[role] : null;

  const initial = session ? (session.name || "U").charAt(0).toUpperCase() : "?";

  const linksHtml = links
    .map(
      (l) => `<a href="${l.href}" class="${activeHref === l.href ? "active" : ""}">
        <span style="opacity:.7;margin-right:6px">${l.icon}</span>${l.label}
      </a>`
    )
    .join("");

  const publicLinks = `
    <a href="#/" class="${activeHref === "#/" ? "active" : ""}">Home</a>
    <a href="#/search" class="${activeHref === "#/search" ? "active" : ""}">Public Search</a>
  `;

  const sessionChip = session
    ? `<div class="session-chip">
         <div class="avatar">${initial}</div>
         <div>
           <div style="font-weight:800;font-size:12px">${escapeHtml(session.name)}</div>
           <div style="font-size:10px;opacity:.85">${meta ? meta.label : role} · ${escapeHtml(session.ref || "")}</div>
         </div>
         <a href="#/logout" style="margin-left:8px;color:#fca5a5;font-size:12px;font-weight:700;text-decoration:none">Logout</a>
       </div>`
    : `<a href="#/" class="btn btn-green btn-sm">Sign In</a>`;

  return `
  <nav class="tsid-navbar">
    <div class="inner">
      <a href="#/" class="brand" style="text-decoration:none;color:inherit">
        <span>TSID</span>
        ${meta ? `<span class="badge">${meta.label}</span>` : ""}
      </a>
      <div class="nav-links">
        ${publicLinks}
        ${linksHtml}
      </div>
      ${sessionChip}
    </div>
  </nav>`;
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function handleLogout() {
  logout();
  window.location.hash = "#/";
}

// Make accessible to inline onclick if needed
window.__tsidLogout = handleLogout;
