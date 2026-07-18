import { Suspense } from "react";
import { redirect } from "next/navigation";
import { env, hasStripeConfig, publicAccessEnabled } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/subscription";
import { isPlanId, type PlanId } from "@/lib/plans";
import { SettingsShell } from "@/components/settings/SettingsShell";

export default async function SettingsPage() {
  const { supabase, user } = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = isAdminEmail(user.email, env.ADMIN_EMAILS);

  const [{ data: profile }, { count: savedDealsCount }, { count: simulatedDealsCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, phone, plan, plan_analyses_used, bonus_analyses_remaining, subscription_status, subscription_current_period_end, cancel_at_period_end, default_appreciation_pct, default_vacancy_pct, default_maintenance_pct, default_closing_cost_pct, default_insurance_pct, lifetime_analyses_count, created_at"
      )
      .eq("id", user.id)
      .single(),
    supabase.from("deals").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_archived", false),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .not("simulation_summary", "is", null),
  ]);

  const currentPlan: PlanId = isPlanId(profile?.plan) ? profile.plan : "free";
  const isSubscribed = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const periodEndLabel = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const billingUnavailable = !publicAccessEnabled || !hasStripeConfig;

  return (
    <Suspense>
      <SettingsShell
        isAdmin={isAdmin}
        email={user.email ?? ""}
        displayName={profile?.display_name ?? ""}
        phone={profile?.phone ?? ""}
        memberSince={profile?.created_at ?? user.created_at}
        currentPlan={currentPlan}
        planAnalysesUsed={profile?.plan_analyses_used ?? 0}
        bonusAnalysesRemaining={profile?.bonus_analyses_remaining ?? 0}
        isSubscribed={isSubscribed}
        periodEndLabel={periodEndLabel}
        cancelAtPeriodEnd={profile?.cancel_at_period_end ?? false}
        billingUnavailable={billingUnavailable}
        defaults={{
          appreciationPct: profile?.default_appreciation_pct ?? 3,
          vacancyPct: profile?.default_vacancy_pct ?? 5,
          maintenancePct: profile?.default_maintenance_pct ?? 5,
          closingCostPct: profile?.default_closing_cost_pct ?? 2,
          insurancePct: profile?.default_insurance_pct ?? 0.35,
        }}
        stats={{
          propertiesAnalyzed: profile?.lifetime_analyses_count ?? 0,
          savedDeals: savedDealsCount ?? 0,
          totalSimulations: (simulatedDealsCount ?? 0) * 10_000,
        }}
      />
    </Suspense>
  );
}
