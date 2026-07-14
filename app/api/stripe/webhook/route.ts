import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env, hasStripeConfig } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { syncSubscriptionToProfile } from "@/lib/stripe/syncSubscription";

const SUBSCRIPTION_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
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

  if (!SUBSCRIPTION_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    const subscription = await resolveSubscription(stripe, event);
    if (subscription) {
      await syncSubscriptionToProfile(subscription);
    }
  } catch (error) {
    console.error(`[Stripe webhook] failed to process ${event.type} (${event.id}):`, error);
    return NextResponse.json({ error: "SYNC_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function resolveSubscription(stripe: Stripe, event: Stripe.Event): Promise<Stripe.Subscription | null> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription" || !session.subscription) return null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    return stripe.subscriptions.retrieve(subscriptionId);
  }
  return event.data.object as Stripe.Subscription;
}
