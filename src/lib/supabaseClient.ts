import { createClient } from '@supabase/supabase-js';

// Do NOT hardcode your keys here. Set these in your environment (.env) as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function mask(value?: string) {
  if (!value) return '<missing>';
  if (value.length <= 8) return value;
  return value.slice(0, 6) + '...' + value.slice(-4);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Provide an actionable error with masked values to help troubleshooting
  const msg = [
    'Supabase environment variables are not set or not loaded.',
    `VITE_SUPABASE_URL=${mask(SUPABASE_URL)}`,
    `VITE_SUPABASE_ANON_KEY=${mask(SUPABASE_ANON_KEY)}`,
    'Ensure .env is present at project root, contains these keys, and restart the dev server (npm run dev).',
  ].join('\n');
  // eslint-disable-next-line no-console
  console.error(msg);
  throw new Error(msg);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
