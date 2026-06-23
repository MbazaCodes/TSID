import { router } from "./routes/router.js";

// Remove duplicate listeners on HMR
if (typeof window.__tsidRouterInit === "undefined") {
  window.__tsidRouterInit = true;
  window.addEventListener("hashchange", () => router());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => router());
} else {
  router();
}
