import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Browser Supabase client. Only call this when `hasSupabaseConfig` is true —
 * callers are responsible for showing a "not configured" state otherwise.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
