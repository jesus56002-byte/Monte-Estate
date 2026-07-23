import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseConfig } from "@/lib/env";

const trackSchema = z.object({
  path: z.string().trim().min(1).max(300),
  sessionId: z.string().uuid(),
});

/**
 * First-party pageview beacon for the admin dashboard's traffic stats — see
 * components/analytics/PageViewTracker.tsx. Fire-and-forget from the client,
 * so this always responds 204 regardless of outcome; a dropped pageview
 * shouldn't surface as an error to a visitor.
 *
 * Uses the service-role client rather than relying on an anon insert RLS
 * policy: the browser only ever talks to this route, never to Supabase
 * directly, so there's no need for the anon role to have table access at
 * all — same pattern as the RentCast request log.
 */
export async function POST(request: Request) {
  if (!hasSupabaseConfig) {
    return new NextResponse(null, { status: 204 });
  }

  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(null, { status: 204 });
  }

  const { error } = await createAdminClient()
    .from("page_views")
    .insert({ session_id: parsed.data.sessionId, path: parsed.data.path });
  if (error) {
    console.error("[track] failed to log pageview:", error.message);
  }

  return new NextResponse(null, { status: 204 });
}
