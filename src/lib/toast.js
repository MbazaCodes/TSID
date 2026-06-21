// Shared toast helper
export function toast(message, kind) {
  const existing = document.querySelector(".tsid-toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "tsid-toast " + (kind || "");
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 2400);
}
