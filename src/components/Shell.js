import { Navbar, initNavbar } from "./Navbar.js";
import { Footer } from "./Footer.js";

export function Shell(role, activeHref, sidebarLinks, contentHtml, opts) {
  opts = opts || {};

  const linksHtml = sidebarLinks.map(l => `
    <a href="${l.href}" class="${activeHref === l.href ? "active" : ""}">
      <span class="ic">${l.icon}</span>${l.label}
    </a>`).join("");

  // Bottom nav (mobile) — show max 5 items
  const bottomLinks = sidebarLinks.slice(0, 5).map(l => `
    <a href="${l.href}" class="${activeHref === l.href ? "active" : ""}">
      <span class="nav-icon">${l.icon}</span>
      <span>${l.label.split(" ")[0]}</span>
    </a>`).join("");

  // Wire navbar after content is in DOM
  setTimeout(initNavbar, 0);

  return `
  ${Navbar(activeHref)}

  <div class="tsid-shell">
    <aside class="tsid-sidebar">
      <h4>${role} Panel</h4>
      ${linksHtml}
    </aside>
    <main class="tsid-content">
      ${contentHtml}
    </main>
  </div>

  <!-- Mobile bottom navigation -->
  <nav class="tsid-bottom-nav">
    ${bottomLinks}
  </nav>

  ${opts.noFooter ? "" : Footer()}
  `;
}
