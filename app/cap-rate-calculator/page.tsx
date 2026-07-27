import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { CapRateCalculator } from "@/components/calculators/CapRateCalculator";

const TITLE = "Cap Rate Calculator";
const DESCRIPTION =
  "Free cap rate calculator for rental property. Enter purchase price, rental income, and operating expenses to instantly calculate net operating income and cap rate.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cap-rate-calculator" },
  openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/cap-rate-calculator" },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const FAQS = [
  {
    question: "What is a good cap rate?",
    answer:
      "There's no universal answer — it depends heavily on market and property type. Higher cap rates generally mean higher cash flow but often come with higher risk (rougher areas, older properties); lower cap rates are common in stable, high-demand markets where investors accept less yield for more safety. Compare a deal's cap rate against similar properties in the same market, not a fixed number.",
  },
  {
    question: "Does cap rate include the mortgage payment?",
    answer:
      "No. Cap rate is calculated as if the property were purchased entirely in cash — it deliberately excludes financing costs, so you can compare properties on their own merits regardless of how each buyer finances them.",
  },
  {
    question: "What counts as an operating expense?",
    answer:
      "Property taxes, insurance, maintenance, property management fees, HOA dues, and a vacancy allowance. It does not include mortgage principal or interest, and does not include capital expenditures (like a new roof) — those are usually analyzed separately.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function CapRateCalculatorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Cap Rate Calculator</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Cap rate measures a property&apos;s return as if bought in cash — the fastest way to compare deals
              at a glance, independent of financing.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-16">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
            <CapRateCalculator />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">What is cap rate?</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Capitalization rate (cap rate) is a property&apos;s net operating income divided by its
                  purchase price, expressed as a percentage. It answers one question: if you paid cash for this
                  property today, what annual yield would it produce before financing?
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">The formula</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Cap Rate = Net Operating Income ÷ Purchase Price. Net operating income is rental income minus
                  operating expenses — before any mortgage payment.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Why it matters</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Because it excludes financing, cap rate lets you compare two properties, or a property against
                  its market, on equal footing — no two buyers finance a deal the same way, but cap rate strips
                  that variable out entirely.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="flex flex-col gap-6">
              {FAQS.map((f) => (
                <div key={f.question} className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold">{f.question}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t px-6 py-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border bg-secondary/60 px-8 py-14 text-center shadow-soft">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Want the full picture?</h2>
            <p className="max-w-md text-muted-foreground">
              Cap rate is one metric. Monte Estate adds cash flow, cash-on-cash return, IRR, and a 10,000-trial
              Monte Carlo simulation — free to start, no credit card required.
            </p>
            <Button asChild size="lg">
              <Link href="/search">Run a Full Analysis</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
