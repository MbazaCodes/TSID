// ── Styles ────────────────────────────────────────────────────────────────
// 1. Tailwind v4 entry point (single @import "tailwindcss" — do not duplicate)
import "./styles/main.css";
// 2. ID card canvas styles (CR80 card dimensions, print rules)
import "./css/style.css";
// 3. TSID role-based UI design system (navbar, shell, tables, badges, buttons, forms)
import "./css/app.css";
// NOTE: css/form.css (legacy v1 form styles) and css/tailwind.css (old v3 syntax)
//       have been retired — all styles are now in css/app.css and css/style.css

// ── Bootstrap ─────────────────────────────────────────────────────────────
import "./js/utilities.js";
import { ensureSeed } from "./store/db.js";
import "./App.js";

ensureSeed();
