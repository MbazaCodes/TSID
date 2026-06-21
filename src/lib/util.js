// ============================================================================
//  TSID shared utilities — real official Tanzania assets + formatting helpers
// ============================================================================

// Real official Tanzania Coat of Arms and Flag — imported from embedded assets
import { TZ_COAT_DATA_URI, TZ_FLAG_DATA_URI } from "../assets/tz-assets.js";

export { TZ_COAT_DATA_URI, TZ_FLAG_DATA_URI };

// Tiny security-pattern SVG used as the card background watermark.
export const SECURITY_PATTERN_URI = (function () {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#FFFFFF"/>
    <g fill="none" stroke="#003366" stroke-width="0.4" opacity="0.18">
      <text x="100" y="105" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#003366" opacity="0.15">TSID</text>
    </g>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
})();

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function fmtMoney(amount, currency) {
  const n = Number(amount) || 0;
  return (currency || "TZS") + " " + n.toLocaleString();
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
