// ── Styles ────────────────────────────────────────────────────────────────

import "./css/style.css";
import "./css/app.css";

// ── Bootstrap ─────────────────────────────────────────────────────────────
import "./js/utilities.js";
import { ensureSeed } from "./store/db.js";
import "./App.js";

ensureSeed(); // no-op with Supabase backend; seed lives in supabase-schema.sql
