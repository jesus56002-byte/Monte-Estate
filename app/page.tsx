import { redirect } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { HomeContent } from "@/components/marketing/HomeContent";
import { hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { PLAN_LABELS, PLAN_MONTHLY_PRICE_USD, PAYG_PRICE_USD, type PlanId } from "@/lib/plans";

const PLAN_IDS: PlanId[] = ["free", "starter", "investor"];

// SoftwareApplication schema for the homepage — no aggregateRating included
// since there are no real reviews yet; fabricating one would violate
// Google's structured-data guidelines.
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Monte Estate",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "https://monte.estate",
  description:
    "Real estate investment analysis tool with cash flow, cap rate, cash-on-cash, and IRR calculations, plus a 10,000-trial Monte Carlo simulation and an AI-generated investment recommendation.",
  offers: [
    ...PLAN_IDS.map((id) => ({
      "@type": "Offer",
      name: PLAN_LABELS[id],
      price: String(PLAN_MONTHLY_PRICE_USD[id]),
      priceCurrency: "USD",
    })),
    {
      "@type": "Offer",
      name: "Pay as you go",
      price: String(PAYG_PRICE_USD),
      priceCurrency: "USD",
    },
  ],
};

export default async function Home() {
  // A signed-in visitor landing on the bare marketing URL would otherwise see
  // this page's logged-out nav (Log in/Sign up) with no way to tell they're
  // still signed in — it reads as having been logged out even though the
  // session is untouched. Send them to the identical-looking page inside the
  // app shell instead, with the real nav (Search/Saved deals/Settings/etc).
  if (hasSupabaseConfig) {
    const { user } = await getAuthedUser();
    if (user) {
      redirect("/home");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <HomeContent />
      </main>
    </div>
  );
}
