import { router } from "./routes/router.js";

window.addEventListener("hashchange", router);

document.addEventListener(
"DOMContentLoaded",
router
);
