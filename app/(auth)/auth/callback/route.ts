import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/env";
import { TERMS_VERSION } from "@/lib/terms";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/search";

  if (code && hasSupabaseConfig) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Email/password signup records this directly; an OAuth sign-in
      // (Google/Facebook/Apple) never hits that action, so record it here
      // instead — the sign-in page shows the same Terms/Privacy notice
      // right above the provider buttons.
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION })
          .eq("id", data.user.id)
          .is("terms_accepted_at", null);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
