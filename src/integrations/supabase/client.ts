import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Missing Supabase configuration. Please check your environment variables.");
}

// Fallback to actual credentials to ensure the APK build always connects
const supabaseUrl = SUPABASE_URL || "https://jdtlnwpirdyklkhdfcgt.supabase.co";
const supabaseKey = SUPABASE_PUBLISHABLE_KEY || "sb_publishable_Zr4bMNP-fJJvPDMisaH-Xg_pZj7tEL_";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});