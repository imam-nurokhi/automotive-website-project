import { createClient, SupabaseClient } from '@supabase/supabase-js';

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!publicUrl || !publicAnonKey) {
  // Intentionally warn instead of throwing so builds don't break when envs
  // are not yet configured in CI/locally.
  // Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production.
  // Server-only key: `SUPABASE_SERVICE_ROLE_KEY` (never expose to client).
  // eslint-disable-next-line no-console
  console.warn('Supabase client not fully configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(publicUrl ?? '', publicAnonKey ?? '');

// Helper to create an admin (server-only) client.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server admin client');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
