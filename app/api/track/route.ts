import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  await supabase.from("page_views").insert({
    session_id: parsed.data.sessionId,
    path: parsed.data.path,
  });

  return new NextResponse(null, { status: 204 });
}
