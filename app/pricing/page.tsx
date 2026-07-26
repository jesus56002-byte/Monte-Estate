import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PLAN_ANALYSIS_LIMITS,
  PLAN_LABELS,
  PLAN_MONTHLY_PRICE_USD,
  TOPUP_ANALYSES,
  TOPUP_EXPIRATION_MONTHS,
  PAYG_PRICE_USD,
  type PlanId,
} from "@/lib/plans";

const TITLE = "Pricing";
const DESCRIPTION =
  "Simple, transparent pricing for Monte Estate. Start with 3 free analyses, then pay as you go or subscribe for more.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/pricing" },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const FEATURES = [
  "Address-based property search with auto-populated details",
  "Full investment calculator (cash flow, cap rate, cash-on-cash, IRR)",
  "10,000-trial Monte Carlo simulation with distribution chart",
  "AI-generated deal interpretation",
];

const PAID_PLAN_IDS: PlanId[] = ["starter", "investor"];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need a credit card to start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — every account gets 3 free analyses with signup, no credit card required.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to unused Pay As You Go credits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Pay As You Go credits expire ${TOPUP_EXPIRATION_MONTHS} months after purchase. Subscription plan limits reset every month and don't roll over.`,
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my subscription anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — cancel anytime from Settings. You keep access to your plan until the end of your current billing period.",
      },
    },
  ],
};

function PlanFeatureList() {
  return (
    <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
      {FEATURES.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-success" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                Start free. Pay as you go or subscribe when you need more. Cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{PLAN_LABELS.free}</CardTitle>
                  <CardDescription>{PLAN_ANALYSIS_LIMITS.free} free analyses with signup</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <PlanFeatureList />
                  <Button asChild size="sm">
                    <Link href="/signup">Sign up free</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Pay as you go</CardTitle>
                  <CardDescription>
                    ${PAYG_PRICE_USD} one-time · {TOPUP_ANALYSES} analyses
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <PlanFeatureList />
                  <div className="flex flex-col gap-2">
                    <Button asChild size="sm">
                      <Link href="/signup">Get started</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Expires {TOPUP_EXPIRATION_MONTHS} months after purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {PAID_PLAN_IDS.map((planId) => (
                <Card key={planId} className={cn("flex flex-col", planId === "starter" && "border-primary")}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      {PLAN_LABELS[planId]}
                      {planId === "starter" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Most popular
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      ${PLAN_MONTHLY_PRICE_USD[planId]}/month · {PLAN_ANALYSIS_LIMITS[planId]} analyses/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <PlanFeatureList />
                    <Button asChild size="sm">
                      <Link href="/signup">Sign up to subscribe</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="flex flex-col gap-6">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold">{item.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
