export type PlanId = "free" | "starter" | "investor";

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === "free" || value === "starter" || value === "investor";
}

/** Duplicated in supabase/migrations/0011_bonus_credit_expiration.sql's consume_analysis_credit() — keep both in sync. */
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
/** In-plan top-up — only available to existing Starter/Investor subscribers. */
export const TOPUP_PRICE_USD = 4.99;
/** Pay As You Go — the standalone option for anyone without a subscription. Same 10 analyses, no plan required. */
export const PAYG_PRICE_USD = 9.99;
export const TOPUP_EXPIRATION_MONTHS = 12;

export function analysesRemaining(
  plan: PlanId,
  planAnalysesUsed: number,
  bonusAnalysesRemaining: number
): number {
  const planRemaining = Math.max(0, PLAN_ANALYSIS_LIMITS[plan] - planAnalysesUsed);
  return planRemaining + Math.max(0, bonusAnalysesRemaining);
}

/**
 * Bonus (top-up) credits expire 12 months after purchase (see
 * supabase/migrations/0011_bonus_credit_expiration.sql). The stored
 * `bonus_analyses_remaining` isn't zeroed out the instant it expires — it's
 * left for the next purchase or consume_analysis_credit call to deal with —
 * so every UI display of that number needs to check the expiration itself
 * rather than trusting the raw column value.
 */
export function effectiveBonusAnalyses(
  bonusAnalysesRemaining: number,
  bonusAnalysesExpiresAt: string | null
): number {
  if (!bonusAnalysesExpiresAt) return 0;
  if (new Date(bonusAnalysesExpiresAt).getTime() <= Date.now()) return 0;
  return Math.max(0, bonusAnalysesRemaining);
}
