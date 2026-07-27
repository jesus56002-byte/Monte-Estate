import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { CashOnCashCalculator } from "@/components/calculators/CashOnCashCalculator";

const TITLE = "Cash-on-Cash Return Calculator";
const DESCRIPTION =
  "Free cash-on-cash return calculator for real estate investors. Enter your annual cash flow, down payment, and closing costs to instantly calculate your return on invested cash.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/cash-on-cash-calculator" },
  openGraph: {
    title: `${TITLE} — Monte Estate`,
    description: DESCRIPTION,
    url: "https://monte.estate/cash-on-cash-calculator",
  },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const FAQS = [
  {
    question: "What's a good cash-on-cash return?",
    answer:
      "Many investors target 8-12% as a baseline, but it varies by market, strategy, and risk tolerance. Cash-on-cash return is most useful for comparing financing structures on the same deal, or comparing deals you're evaluating with similar financing.",
  },
  {
    question: "How is cash-on-cash return different from cap rate?",
    answer:
      "Cap rate assumes an all-cash purchase and ignores financing entirely. Cash-on-cash return does the opposite — it measures return specifically on the cash you actually put in (down payment plus closing costs), so it directly reflects the effect of leverage. The same property can have a very different cash-on-cash return depending on how much you put down.",
  },
  {
    question: "Does cash-on-cash return account for appreciation?",
    answer:
      "No — it's a single-year snapshot of cash flow relative to cash invested, and doesn't include equity gained through appreciation or loan paydown. For a return that accounts for the full holding period including a future sale, use an IRR calculation instead.",
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

export default function CashOnCashCalculatorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Cash-on-Cash Return Calculator</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Cap rate ignores financing. Cash-on-cash return measures the one number cap rate can&apos;t: how
              hard your actual invested cash is working for you.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-16">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
            <CashOnCashCalculator />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">What is cash-on-cash return?</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Cash-on-cash return measures your annual pre-tax cash flow against the actual cash you put
                  into the deal — your down payment plus closing costs. Unlike cap rate, it directly reflects
                  the effect of your financing and leverage.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">The formula</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Cash-on-Cash Return = Annual Pre-Tax Cash Flow ÷ Total Cash Invested (down payment + closing
                  costs).
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Why it matters</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Two identical properties can have very different cash-on-cash returns depending on how much
                  you put down — more leverage (a smaller down payment) usually means a higher cash-on-cash
                  return, at the cost of thinner cash flow margins and more risk.
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
              Cash-on-cash return is one metric. Monte Estate adds cap rate, cash flow, IRR, and a 10,000-trial
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
