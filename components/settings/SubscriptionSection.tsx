import { Check } from "lucide-react";
import {
  PLAN_ANALYSIS_LIMITS,
  PLAN_LABELS,
  PLAN_MONTHLY_PRICE_USD,
  TOPUP_ANALYSES,
  TOPUP_PRICE_USD,
  type PlanId,
} from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";
import { CancelSubscriptionButton } from "@/components/billing/CancelSubscriptionButton";
import { cn } from "@/lib/utils";
import type { SettingsData } from "@/components/settings/types";

const FEATURES = [
  "Address-based property search with auto-populated details",
  "Full investment calculator (cash flow, cap rate, cash-on-cash, IRR)",
  "10,000-trial Monte Carlo simulation with distribution chart",
  "AI-generated deal interpretation",
];

const TIER_ORDER: PlanId[] = ["free", "starter", "investor"];

export function SubscriptionSection({ data }: { data: SettingsData }) {
  const {
    isAdmin,
    currentPlan,
    planAnalysesUsed,
    bonusAnalysesRemaining,
    isSubscribed,
    periodEndLabel,
    cancelAtPeriodEnd,
    billingUnavailable,
  } = data;

  const limit = PLAN_ANALYSIS_LIMITS[currentPlan];
  const usagePct = limit > 0 ? Math.min(100, Math.round((planAnalysesUsed / limit) * 100)) : 0;
  const canBuyTopUp = currentPlan !== "free" && isSubscribed;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your plan, usage, and billing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isAdmin ? (
            <p className="text-sm text-muted-foreground">
              Admin access — unlimited analyses regardless of plan. The plan below reflects your Stripe
              subscription (if any), not what you&apos;re actually limited to.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Monthly analyses</span>
                <span className="text-muted-foreground">
                  {Math.min(planAnalysesUsed, limit)} / {limit} used
                  {bonusAnalysesRemaining > 0 ? ` (+${bonusAnalysesRemaining} bonus)` : ""}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
          )}

          {!billingUnavailable && (
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                Current plan: <span className="font-medium text-foreground">{PLAN_LABELS[currentPlan]}</span>
              </p>
              <p>
                Billing cycle:{" "}
                <span className="font-medium text-foreground">
                  {isSubscribed && periodEndLabel
                    ? cancelAtPeriodEnd
                      ? `Cancels ${periodEndLabel}`
                      : `Renews ${periodEndLabel}`
                    : "Monthly"}
                </span>
              </p>
            </div>
          )}

          {!data.isAdmin && billingUnavailable && (
            <p className="text-sm text-muted-foreground">
              Billing isn&apos;t configured right now, so plan changes aren&apos;t available.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <Card>
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
        <div className="flex items-center gap-3">
          <ManageBillingButton />
          <CancelSubscriptionButton cancelAtPeriodEnd={cancelAtPeriodEnd} periodEndLabel={periodEndLabel} />
        </div>
      )}
    </div>
  );
}
