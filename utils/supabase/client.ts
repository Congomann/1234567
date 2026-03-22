import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * CLIENT-SIDE SUPABASE HELPER
 * Optimized for React + Vite environment.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing in .env");
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
};

// Singleton instance for general use
export const supabase = createClient();
