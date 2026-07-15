export type PlanId = "free" | "starter" | "investor";

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "free" || value === "starter" || value === "investor";
}

/** Duplicated in supabase/migrations/0003_plans_and_usage.sql's consume_analysis_credit() — keep both in sync. */
export const PLAN_ANALYSIS_LIMITS: Record<PlanId, number> = {
  free: 3,
  starter: 20,
  investor: 60,
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  investor: "Investor",
};

export const PLAN_MONTHLY_PRICE_USD: Record<PlanId, number> = {
  free: 0,
  starter: 11.99,
  investor: 24.99,
};

export const TOPUP_ANALYSES = 10;
export const TOPUP_PRICE_USD = 4.99;

export function analysesRemaining(
  plan: PlanId,
  planAnalysesUsed: number,
  bonusAnalysesRemaining: number
): number {
  const planRemaining = Math.max(0, PLAN_ANALYSIS_LIMITS[plan] - planAnalysesUsed);
  return planRemaining + Math.max(0, bonusAnalysesRemaining);
}
