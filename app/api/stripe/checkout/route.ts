import { NextResponse } from "next/server";
import { env, hasStripeConfig, publicAccessEnabled } from "@/lib/env";
import { requireApiUser } from "@/lib/api/requireApiUser";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import { TOPUP_ANALYSES } from "@/lib/plans";

const SUBSCRIPTION_ITEMS = { starter: env.STRIPE_PRICE_STARTER, investor: env.STRIPE_PRICE_INVESTOR } as const;

type CheckoutItem = "starter" | "investor" | "topup";

function isCheckoutItem(value: unknown): value is CheckoutItem {
  return value === "starter" || value === "investor" || value === "topup";
}

export async function POST(request: Request) {
  if (!hasStripeConfig) {
    return NextResponse.json(
      {
        error: "STRIPE_NOT_CONFIGURED",
        message: "Billing isn't configured yet. Set STRIPE_SECRET_KEY and the STRIPE_PRICE_* vars to enable it.",
      },
      { status: 503 }
    );
  }

  if (!publicAccessEnabled) {
    return NextResponse.json(
      { error: "SUBSCRIPTIONS_CLOSED", message: "Subscriptions are currently closed." },
      { status: 503 }
    );
  }

  const gate = await requireApiUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const body = await request.json().catch(() => null);
  const item = body?.item;
  if (!isCheckoutItem(item)) {
    return NextResponse.json(
      { error: "INVALID_ITEM", message: "item must be one of: starter, investor, topup." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, plan, subscription_status")
    .eq("id", user.id)
    .single();

  const isCurrentlySubscribed = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";

  // Top-ups are available to any signed-in user, subscribed or not — a free
  // user who wants a few more analyses without committing to a monthly plan
  // shouldn't have to subscribe first just to buy loose credits.

  if ((item === "starter" || item === "investor") && isCurrentlySubscribed) {
    return NextResponse.json(
      {
        error: "ALREADY_SUBSCRIBED",
        message: "You already have an active subscription — use \"Manage billing\" to switch plans.",
      },
      { status: 409 }
    );
  }

  const stripe = getStripeClient();

  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    // stripe_customer_id isn't user-writable via the RLS-scoped client (a
    // user could otherwise point their own row at someone else's Stripe
    // customer and reach their billing portal) — write it with the
    // service-role client instead, same as every other billing field.
    await createAdminClient().from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session =
    item === "topup"
      ? await stripe.checkout.sessions.create({
          mode: "payment",
          customer: customerId,
          client_reference_id: user.id,
          line_items: [{ price: env.STRIPE_PRICE_TOPUP, quantity: 1 }],
          metadata: { item: "topup", supabase_user_id: user.id, topup_analyses: String(TOPUP_ANALYSES) },
          success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
        })
      : await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: customerId,
          client_reference_id: user.id,
          line_items: [{ price: SUBSCRIPTION_ITEMS[item], quantity: 1 }],
          subscription_data: { metadata: { supabase_user_id: user.id } },
          success_url: `${env.NEXT_PUBLIC_APP_URL}/settings/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
        });

  if (!session.url) {
    return NextResponse.json(
      { error: "STRIPE_ERROR", message: "Couldn't start checkout. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
