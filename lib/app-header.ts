import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { env } from "@/lib/env";
import { isAdminEmail } from "@/lib/subscription";
import { PLAN_ANALYSIS_LIMITS, effectiveBonusAnalyses, isPlanId, type PlanId } from "@/lib/plans";

export type AppHeaderData = {
  isAdmin: boolean;
  plan: PlanId;
  used: number;
  limit: number;
  bonus: number;
};

/**
 * Shared between app/(app)/layout.tsx (always logged in) and MarketingHeader
 * (logged in or not) so both render the exact same nav for a signed-in
 * user, rather than two independently-maintained header states drifting
 * apart. One profile fetch per header render either way.
 */
export async function getAppHeaderData(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<AppHeaderData> {
  const isAdmin = isAdminEmail(user.email, env.ADMIN_EMAILS);

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_analyses_used, bonus_analyses_remaining, bonus_analyses_expires_at")
    .eq("id", user.id)
    .single();

  const plan = isPlanId(profile?.plan) ? profile.plan : "free";
  const used = profile?.plan_analyses_used ?? 0;
  const bonus = effectiveBonusAnalyses(
    profile?.bonus_analyses_remaining ?? 0,
    profile?.bonus_analyses_expires_at ?? null
  );
  const limit = PLAN_ANALYSIS_LIMITS[plan];

  return { isAdmin, plan, used, limit, bonus };
}
