import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { env, hasStripeConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { hasActiveAccess, isAdminEmail } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubscribeButton } from "@/components/billing/SubscribeButton";

const FEATURES = [
  "Address-based property search with auto-populated details",
  "Full investment calculator (cash flow, cap rate, cash-on-cash, IRR)",
  "10,000-trial Monte Carlo simulation with distribution chart",
  "AI-generated deal interpretation",
  "Unlimited saved deals",
];

export default async function SubscribePage() {
  const { supabase, user } = await getAuthedUser();

  if (user) {
    if (isAdminEmail(user.email, env.ADMIN_EMAILS)) {
      redirect("/search");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (hasActiveAccess(profile?.subscription_status ?? null)) {
      redirect("/search");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Subscribe to Monte Estate</CardTitle>
          <CardDescription>
            A Monte Estate subscription is required to use the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ul className="flex flex-col gap-2 text-sm">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {hasStripeConfig ? (
            <SubscribeButton />
          ) : (
            <p className="text-sm text-muted-foreground">
              Billing isn&apos;t configured yet. Set <code className="rounded bg-muted px-1 py-0.5">STRIPE_SECRET_KEY</code>{" "}
              and <code className="rounded bg-muted px-1 py-0.5">STRIPE_PRICE_ID</code> to enable subscriptions.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
