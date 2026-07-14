import { NextResponse } from "next/server";
import { env, hasStripeConfig } from "@/lib/env";
import { requireApiUser } from "@/lib/api/requireApiUser";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST() {
  if (!hasStripeConfig) {
    return NextResponse.json(
      { error: "STRIPE_NOT_CONFIGURED", message: "Billing isn't configured yet." },
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

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "NO_SUBSCRIPTION", message: "You don't have a billing account yet — subscribe first." },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/search`,
  });

  return NextResponse.json({ url: session.url });
}
