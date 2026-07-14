import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Shared auth gate for API routes. Usage:
 *   const gate = await requireApiUser();
 *   if (gate.response) return gate.response;
 *   // gate.user is a signed-in User from here on.
 *
 * Centralizing this is what makes "add a new API route" fail loudly instead
 * of silently shipping without an auth check, the way /api/property-lookup
 * originally did.
 */
export async function requireApiUser(): Promise<
  { user: User; response: null } | { user: null; response: NextResponse }
> {
  const unauthorized = () =>
    NextResponse.json({ error: "UNAUTHORIZED", message: "Sign in to continue." }, { status: 401 });

  if (!hasSupabaseConfig) {
    return { user: null, response: unauthorized() };
  }

  const { user } = await getAuthedUser();
  if (!user) {
    return { user: null, response: unauthorized() };
  }

  return { user, response: null };
}
