import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Service-role Supabase client. Bypasses RLS — only call this from trusted
 * server-only code with no user-supplied `id`/`user_id` filters coming from
 * anywhere but a verified source (e.g. a Stripe webhook payload, or a
 * Checkout Session looked up by an ID we minted ourselves). Never expose
 * this client, or the key it wraps, to a request handler that echoes back
 * whatever the caller asks for.
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) must be set to use the admin client."
    );
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
