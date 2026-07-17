import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { env, hasStripeConfig, publicAccessEnabled } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/subscription";
import { PLAN_ANALYSIS_LIMITS, PLAN_LABELS, PLAN_MONTHLY_PRICE_USD, TOPUP_ANALYSES, TOPUP_PRICE_USD, isPlanId, type PlanId } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";
import { CancelSubscriptionButton } from "@/components/billing/CancelSubscriptionButton";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Address-based property search with auto-populated details",
  "Full investment calculator (cash flow, cap rate, cash-on-cash, IRR)",
  "10,000-trial Monte Carlo simulation with distribution chart",
  "AI-generated deal interpretation",
];

const TIER_ORDER: PlanId[] = ["free", "starter", "investor"];

export default async function SettingsPage() {
  const { supabase, user } = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = isAdminEmail(user.email, env.ADMIN_EMAILS);

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "plan, plan_analyses_used, bonus_analyses_remaining, subscription_status, subscription_current_period_end, cancel_at_period_end"
    )
    .eq("id", user.id)
    .single();

  const currentPlan: PlanId = isPlanId(profile?.plan) ? profile.plan : "free";
  const isSubscribed = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const canBuyTopUp = currentPlan !== "free" && isSubscribed;
  const periodEndLabel = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const billingUnavailable = !publicAccessEnabled || !hasStripeConfig;

  return (
    <main className="flex flex-1 flex-col items-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        {isAdmin ? (
          <p className="text-muted-foreground">
            Admin access — unlimited analyses regardless of plan. The plan below reflects your Stripe
            subscription (if any), not what you&apos;re actually limited to.
          </p>
        ) : (
          <p className="text-muted-foreground">
            You&apos;re on <span className="font-medium text-foreground">{PLAN_LABELS[currentPlan]}</span> —{" "}
            {Math.max(0, PLAN_ANALYSIS_LIMITS[currentPlan] - (profile?.plan_analyses_used ?? 0))} of{" "}
            {PLAN_ANALYSIS_LIMITS[currentPlan]} analyses left
            {(profile?.bonus_analyses_remaining ?? 0) > 0 ? ` (+${profile?.bonus_analyses_remaining} bonus)` : ""}.
          </p>
        )}
      </div>

      {!publicAccessEnabled && (
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Monte Estate isn&apos;t open to new subscribers right now. Check back later.
        </p>
      )}
      {publicAccessEnabled && !hasStripeConfig && (
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Billing isn&apos;t configured yet — Starter and Investor subscriptions aren&apos;t available.
        </p>
      )}

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {TIER_ORDER.map((planId) => {
          const isCurrent = planId === currentPlan;
          return (
            <Card key={planId} className={cn("flex flex-col", isCurrent && "border-primary")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  {PLAN_LABELS[planId]}
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Current plan
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {planId === "free" ? "Free" : `$${PLAN_MONTHLY_PRICE_USD[planId]}/month`} ·{" "}
                  {PLAN_ANALYSIS_LIMITS[planId]} analyses{planId === "free" ? " (lifetime)" : "/month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {planId !== "free" && !isCurrent && !billingUnavailable && !isSubscribed && (
                  <SubscribeButton
                    item={planId}
                    size="sm"
                    label={`Subscribe — $${PLAN_MONTHLY_PRICE_USD[planId]}/mo`}
                  />
                )}
                {planId !== "free" && !isCurrent && !billingUnavailable && isSubscribed && (
                  <p className="text-xs text-muted-foreground">Use &quot;Manage billing&quot; below to switch plans.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {canBuyTopUp && !billingUnavailable && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Need more this month?</CardTitle>
            <CardDescription>
              Buy {TOPUP_ANALYSES} additional analyses for ${TOPUP_PRICE_USD} — stacks on top of your plan and rolls
              over until used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscribeButton item="topup" size="sm" variant="outline" label={`Buy ${TOPUP_ANALYSES} more — $${TOPUP_PRICE_USD}`} />
          </CardContent>
        </Card>
      )}

      {isSubscribed && (
        <div className="flex flex-col items-center gap-3">
          <ManageBillingButton />
          <CancelSubscriptionButton
            cancelAtPeriodEnd={profile?.cancel_at_period_end ?? false}
            periodEndLabel={periodEndLabel}
          />
        </div>
      )}
    </main>
  );
}
