import { NextResponse } from "next/server";
import { env, hasStripeConfig } from "@/lib/env";
import { requireApiUser } from "@/lib/api/requireApiUser";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST() {
  if (!hasStripeConfig) {
    return NextResponse.json(
      {
        error: "STRIPE_NOT_CONFIGURED",
        message: "Billing isn't configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable it.",
      },
      { status: 503 }
    );
  }

  const gate = await requireApiUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripe = getStripeClient();

  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    subscription_data: { metadata: { supabase_user_id: user.id } },
    success_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "STRIPE_ERROR", message: "Couldn't start checkout. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
