// ============================================================================
//  Supabase client — single instance shared across the app
// ============================================================================
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || "";

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn("[TSID] VITE_SUPABASE_URL and VITE_SUPABASE_ANON must be set in .env — see .env.example");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
