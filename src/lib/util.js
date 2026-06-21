// ============================================================================
//  TSID shared utilities — assets (inline SVG), PDF, QR, formatting
// ============================================================================

// Tanzanian flag rendered as inline SVG data URI so we don't depend on
// missing /assets/tanzania-flag.png from the original repo.
export const TZ_FLAG_DATA_URI = (function () {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
    <rect width="120" height="80" fill="#1EB53A"/>
    <rect width="120" height="80" fill="#00A3DD" x="0" y="0" style="clip-path:polygon(0 0,120 80,120 0);"/>
    <polygon points="0,0 120,80 120,0" fill="#00A3DD"/>
    <polygon points="0,0 120,80 0,80" fill="#1EB53A"/>
    <polygon points="0,0 120,80 120,0" fill="#00A3DD" opacity="1"/>
    <polygon points="0,0 120,80 0,80" fill="#1EB53A" opacity="1"/>
    <line x1="0" y1="0" x2="120" y2="80" stroke="#000" stroke-width="8"/>
    <line x1="0" y1="0" x2="120" y2="80" stroke="#FCD116" stroke-width="4"/>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
})();

// Simplified Tanzanian coat-of-arms style emblem (inline SVG).
// Not a faithful reproduction of the official coat of arms — just a clean
// national-emblem placeholder that matches the card design language.
export const TZ_COAT_DATA_URI = (function () {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFD700"/>
        <stop offset="1" stop-color="#D4A017"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="56" fill="url(#g)" stroke="#003366" stroke-width="3"/>
    <circle cx="60" cy="60" r="44" fill="none" stroke="#003366" stroke-width="1.5"/>
    <!-- shield -->
    <path d="M40 38 L80 38 L80 60 Q80 80 60 88 Q40 80 40 60 Z" fill="#003366" stroke="#FCD116" stroke-width="2"/>
    <!-- spear -->
    <line x1="60" y1="22" x2="60" y2="98" stroke="#000" stroke-width="2"/>
    <polygon points="60,18 56,28 64,28" fill="#000"/>
    <!-- tusks -->
    <path d="M30 50 Q40 70 50 80" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M90 50 Q80 70 70 80" fill="none" stroke="#fff" stroke-width="2"/>
    <text x="60" y="106" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="800" fill="#003366">TANZANIA</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
})();

// Tiny security-pattern SVG used as the card background watermark.
export const SECURITY_PATTERN_URI = (function () {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#FFFFFF"/>
    <g fill="none" stroke="#003366" stroke-width="0.4" opacity="0.18">
      ${Array.from({ length: 20 })
        .map((_, i) =>
          Array.from({ length: 20 })
            .map((_, j) => `<circle cx="${i * 10 + 5}" cy="${j * 10 + 5}" r="3"/>`)
            .join("")
        )
        .join("")}
      <text x="100" y="105" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="900" fill="#003366" opacity="0.15">TSID</text>
    </g>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
})();

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export function fmtMoney(amount, currency) {
  const n = Number(amount || 0);
  return (
    (currency || "TZS") +
    " " +
    n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  );
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
