import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env, hasStripeConfig } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { syncSubscriptionToProfile, resetPlanUsageForRenewal, creditTopUp } from "@/lib/stripe/syncSubscription";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
]);

export async function POST(request: Request) {
  if (!hasStripeConfig || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: "INVALID_SIGNATURE", message }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    await handleEvent(stripe, event);
  } catch (error) {
    console.error(`[Stripe webhook] failed to process ${event.type} (${event.id}):`, error);
    return NextResponse.json({ error: "SYNC_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(stripe: Stripe, event: Stripe.Event): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "payment") {
      // The one-time top-up purchase — not a subscription event at all.
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
      const amount = Number(session.metadata?.topup_analyses ?? 0);
      if (session.payment_status === "paid" && userId && amount > 0) {
        await creditTopUp(userId, amount);
      } else {
        console.error(`[Stripe webhook] payment session ${session.id} missing user/amount metadata or unpaid; skipping credit.`);
      }
      return;
    }

    if (session.mode === "subscription" && session.subscription) {
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionToProfile(subscription);
    }
    return;
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.parent?.subscription_details?.subscription;
    // Only a genuine renewal resets usage — the first invoice at signup
    // (billing_reason "subscription_create") must not zero out a count that
    // hasn't been touched yet, but is otherwise harmless either way.
    if (invoice.billing_reason === "subscription_cycle" && subscriptionId) {
      const id = typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;
      const subscription = await stripe.subscriptions.retrieve(id);
      await resetPlanUsageForRenewal(subscription);
    }
    return;
  }

  // customer.subscription.{created,updated,deleted}
  await syncSubscriptionToProfile(event.data.object as Stripe.Subscription);
}
