import { redirect } from "next/navigation";
import { hasStripeConfig } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { syncSubscriptionToProfile } from "@/lib/stripe/syncSubscription";

/**
 * Synchronous fallback so access unlocks the moment Checkout completes,
 * instead of waiting on webhook delivery. The webhook (app/api/stripe/webhook)
 * remains the source of truth for renewals/cancellations after this point —
 * this page only handles the very first activation.
 */
export default async function SubscribeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!hasStripeConfig || !sessionId) {
    redirect("/subscribe");
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.subscription && typeof session.subscription !== "string") {
    await syncSubscriptionToProfile(session.subscription);
  }

  redirect("/search");
}
