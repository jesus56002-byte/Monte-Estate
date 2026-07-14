import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

/** Only call this when `hasStripeConfig` is true — callers show a "not configured" state otherwise. */
export function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}
