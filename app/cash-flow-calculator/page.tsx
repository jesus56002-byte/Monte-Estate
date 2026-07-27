import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { CashFlowCalculator } from "@/components/calculators/CashFlowCalculator";

const TITLE = "Cash Flow Calculator";
const DESCRIPTION =
  "Free rental property cash flow calculator. Enter your financing terms, rent, and expenses to instantly calculate monthly cash flow after the mortgage payment.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cash-flow-calculator" },
  openGraph: {
    title: `${TITLE} — Monte Estate`,
    description: DESCRIPTION,
    url: "https://monte.estate/cash-flow-calculator",
  },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const FAQS = [
  {
    question: "What counts as an operating expense?",
    answer:
      "Property taxes, insurance, maintenance, property management fees, HOA dues, and a vacancy allowance — everything it costs to keep the property running and rented. It doesn't include the mortgage payment, which this calculator adds in separately.",
  },
  {
    question: "Is cash flow the same as profit?",
    answer:
      "Not quite. Cash flow is what's left in your pocket each month after the mortgage and operating expenses — it doesn't account for the equity you're building through principal paydown, appreciation, or taxes, all of which factor into your total return over time.",
  },
  {
    question: "What's considered good cash flow for a rental property?",
    answer:
      "A common rule of thumb is $100-$200+ per month per unit as a baseline, but the right target depends on your market, financing, and risk tolerance. A property with modest cash flow but strong appreciation potential can still be a good investment overall.",
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

export default function CashFlowCalculatorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Cash Flow Calculator</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              The most immediate return metric in real estate: what&apos;s actually left over each month after
              the mortgage and expenses are paid.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-16">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
            <CashFlowCalculator />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">What is cash flow?</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Monthly cash flow is your rental income minus every recurring cost of owning the property —
                  operating expenses and the mortgage payment. Positive cash flow means the property pays for
                  itself and puts money in your pocket every month; negative cash flow means you&apos;re
                  subsidizing it out of pocket.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">The formula</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Monthly Cash Flow = Monthly Rent − Monthly Operating Expenses − Monthly Mortgage Payment (P&amp;I).
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Why it matters</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Cash flow is what makes a rental property sustainable to hold. Appreciation and equity paydown
                  build wealth over years, but cash flow is what keeps the property funded month to month
                  without dipping into your own savings.
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
              Cash flow is one metric. Monte Estate adds cap rate, cash-on-cash return, IRR, and a 10,000-trial
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
