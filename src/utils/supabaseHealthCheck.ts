import { supabase } from "@/integrations/supabase/client";

/**
 * Health check utilities for Supabase connection
 */

/**
 * Check if Supabase is accessible
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Simple test query to check connection
    const { data, error } = await supabase.auth.getSession();
    
    // Even if there's no session, if we can connect without network errors, it's healthy
    return !error || !error.message.includes('fetch');
  } catch (error: any) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!url) {
    errors.push('VITE_SUPABASE_URL environment variable is not set');
  } else if (!url.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }
  
  if (!key) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY environment variable is not set');
  } else if (key.length < 100) {
    errors.push('VITE_SUPABASE_PUBLISHABLE_KEY appears to be invalid (too short)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}