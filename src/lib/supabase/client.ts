import { createBrowserClient } from '@supabase/ssr';
// Types to be generated from prod schema; untyped for now (RLS enforces at DB).
type Database = Record<string, unknown>;

/**
 * Supabase client for Client Components ("use client").
 * Uses the anon key — all reads/writes are RLS-enforced.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
