import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type { PlanId } from "@/lib/plans";

/** Subscription statuses that mean "not actually paying anymore" — revert to the free plan. */
const TERMINAL_STATUSES = new Set(["canceled", "unpaid", "incomplete_expired"]);

function planFromPriceId(priceId: string | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === env.STRIPE_PRICE_INVESTOR) return "investor";
  return null;
}

/**
 * Writes a Stripe subscription's state onto the matching profile row. Called
 * from both the webhook handler (ongoing renewal/cancellation events) and the
 * Checkout success page (a synchronous fallback so access unlocks immediately
 * after payment, without waiting on webhook delivery). Idempotent either way.
 *
 * Relies on `subscription.metadata.supabase_user_id`, set at Checkout Session
 * creation time (`subscription_data.metadata`), rather than looking the
 * profile up by Stripe customer ID — that avoids a race where a subscription
 * webhook could arrive before the profile's `stripe_customer_id` is written.
 */
export async function syncSubscriptionToProfile(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) {
    console.error(`[Stripe] subscription ${subscription.id} has no supabase_user_id metadata; skipping sync.`);
    return;
  }

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const currentPeriodEndSeconds = subscription.items.data[0]?.current_period_end ?? null;
  const resolvedPlan: PlanId = TERMINAL_STATUSES.has(subscription.status)
    ? "free"
    : (planFromPriceId(subscription.items.data[0]?.price.id) ?? "free");

  const admin = createAdminClient();

  const { data: existingProfile } = await admin.from("profiles").select("plan").eq("id", userId).single();
  // A fresh plan (upgrade, downgrade, or reverting to free on cancellation)
  // gets a clean usage count rather than carrying over the old plan's tally.
  const planChanged = existingProfile !== null && existingProfile.plan !== resolvedPlan;

  const { error } = await admin
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: currentPeriodEndSeconds
        ? new Date(currentPeriodEndSeconds * 1000).toISOString()
        : null,
      plan: resolvedPlan,
      cancel_at_period_end: subscription.cancel_at_period_end,
      ...(planChanged ? { plan_analyses_used: 0 } : {}),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to sync subscription ${subscription.id} to profile ${userId}: ${error.message}`);
  }
}

/** Resets the monthly plan quota on a genuine renewal (invoice.paid, billing_reason=subscription_cycle). Bonus (top-up) analyses roll over untouched. */
export async function resetPlanUsageForRenewal(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) {
    console.error(`[Stripe] renewal for subscription ${subscription.id} has no supabase_user_id metadata; skipping reset.`);
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ plan_analyses_used: 0 }).eq("id", userId);
  if (error) {
    throw new Error(`Failed to reset usage on renewal for profile ${userId}: ${error.message}`);
  }
}

/** Credits a top-up purchase (10 analyses) after a one-time Checkout payment completes. */
export async function creditTopUp(userId: string, amount: number): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("credit_bonus_analyses", { p_user_id: userId, p_amount: amount });
  if (error) {
    throw new Error(`Failed to credit ${amount} top-up analyses to profile ${userId}: ${error.message}`);
  }
}
