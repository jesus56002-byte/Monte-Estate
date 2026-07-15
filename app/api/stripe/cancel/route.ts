import { NextResponse } from "next/server";
import { hasStripeConfig } from "@/lib/env";
import { requireApiUser } from "@/lib/api/requireApiUser";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { syncSubscriptionToProfile } from "@/lib/stripe/syncSubscription";

export async function POST(request: Request) {
  if (!hasStripeConfig) {
    return NextResponse.json(
      { error: "STRIPE_NOT_CONFIGURED", message: "Billing isn't configured yet." },
      { status: 503 }
    );
  }

  const gate = await requireApiUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (action !== "cancel" && action !== "reactivate") {
    return NextResponse.json(
      { error: "INVALID_ACTION", message: 'action must be "cancel" or "reactivate".' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "NO_SUBSCRIPTION", message: "You don't have an active subscription." },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();
  const updated = await stripe.subscriptions.update(profile.stripe_subscription_id, {
    cancel_at_period_end: action === "cancel",
  });

  // Keep the local mirror (used to render the Settings page without an extra
  // live Stripe call) consistent with what we just told Stripe.
  await syncSubscriptionToProfile(updated);

  return NextResponse.json({ cancelAtPeriodEnd: updated.cancel_at_period_end });
}
