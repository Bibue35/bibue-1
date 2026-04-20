import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Types will be generated from prod Supabase schema in next session.
// For now using untyped client — RLS still enforced at DB level.
type Database = Record<string, unknown>;

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Refreshes auth tokens via cookies() on every read.
 * NEVER pass this to client components — use createBrowserClient from ./client.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies — middleware handles refresh.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — FULL database access, bypasses RLS.
 * ONLY use in:
 *  - Webhook route handlers (after signature verification)
 *  - Inngest job functions
 *  - Admin-scoped API routes with explicit authz check
 *
 * NEVER import this in:
 *  - Client components
 *  - Server components rendering user data
 *  - API routes with user input that affects the DB
 */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY missing — service-role calls unavailable. ' +
        'This is expected in preview/test envs; production webhooks require it.',
    );
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
