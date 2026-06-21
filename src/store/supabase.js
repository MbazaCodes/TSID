// ============================================================================
//  Supabase client — single instance shared across the app
// ============================================================================
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://twzganbkizkfdxodfhtc.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3emdhbmJraXprZmR4b2RmaHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzY5OTMsImV4cCI6MjA5NzYxMjk5M30.cAIL_Uw4vO0aks9dqV14QwjI6zRRfXvgzyOPnuFv7sE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
