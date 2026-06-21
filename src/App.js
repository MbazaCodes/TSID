import { router } from "./routes/router.js";

// Remove old listeners on HMR to prevent duplicates
if (typeof window.__tsidRouterInit === "undefined") {
  window.__tsidRouterInit = true;
  window.addEventListener("hashchange", router);
}

// Always run router on load (covers both initial load and HMR)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", router);
} else {
  router();
}
