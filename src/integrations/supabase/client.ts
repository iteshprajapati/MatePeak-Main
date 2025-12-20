import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Supabase Client
 *
 * Environment variables are validated at startup.
 * If you see an error, make sure you have:
 * 1. Created a .env file (copy from .env.example)
 * 2. Added your VITE_SUPABASE_URL
 * 3. Added your VITE_SUPABASE_ANON_KEY
 *
 * Import the supabase client like this:
 * import { supabase } from "@/integrations/supabase/client";
 */
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
