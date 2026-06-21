import { Navbar } from "./Navbar.js";
import { Footer } from "./Footer.js";

// Wrap any dashboard view in the standard navbar + sidebar layout.
export function Shell(role, activeHref, sidebarLinks, contentHtml, opts) {
  opts = opts || {};
  const linksHtml = sidebarLinks
    .map(
      (l) => `<a href="${l.href}" class="${activeHref === l.href ? "active" : ""}">
        <span class="ic">${l.icon}</span>${l.label}
      </a>`
    )
    .join("");

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
  ${opts.noFooter ? "" : Footer()}
  `;
}
