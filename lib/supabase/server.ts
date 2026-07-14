import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Server Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Only call this when `hasSupabaseConfig` is true — callers
 * are responsible for showing a "not configured" state otherwise.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no way to set cookies —
            // safe to ignore as long as middleware.ts is refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a server client and resolves the current user in one call, so
 * every Server Component/Action/Route Handler goes through the same path
 * instead of each hand-rolling `createClient()` + `auth.getUser()` — the
 * duplication that let one API route ship without an auth check. Callers
 * still decide what to do when `user` is null (redirect, 401, etc.), since
 * that varies by call site.
 */
export async function getAuthedUser(): Promise<{
  supabase: SupabaseClient<Database>;
  user: User | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
