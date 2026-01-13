import { createClient } from '@supabase/supabase-js';

// This admin client should ONLY be used in secure server-side code (Edge Function).
export const createAdminClient = (serviceRoleKey: string) => {
  return createClient(import.meta.env.VITE_SUPABASE_URL as string, serviceRoleKey, {
    auth: { persistSession: false }
  });
};
