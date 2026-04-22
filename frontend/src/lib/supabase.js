// REQUIRES RLS: This file only initializes the Supabase client.
// Table-level RLS policies are enforced in hooks/components that run queries.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
