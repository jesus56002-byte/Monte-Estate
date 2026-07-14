import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: currentPeriodEndSeconds
        ? new Date(currentPeriodEndSeconds * 1000).toISOString()
        : null,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to sync subscription ${subscription.id} to profile ${userId}: ${error.message}`);
  }
}
