import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { IrrCalculator } from "@/components/calculators/IrrCalculator";

const TITLE = "IRR Calculator";
const DESCRIPTION =
  "Free IRR calculator for real estate investing. Enter your initial investment, annual cash flow, holding period, and sale proceeds to instantly calculate internal rate of return.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/irr-calculator" },
  openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/irr-calculator" },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const FAQS = [
  {
    question: "What's a good IRR for real estate?",
    answer:
      "Many investors target somewhere in the 12-20% range for value-add or higher-risk deals, and lower (8-12%) for stable, lower-risk properties — but the right target depends heavily on your strategy, market, and how you weigh risk against return. IRR is most useful for comparing deals against each other, not against a single universal benchmark.",
  },
  {
    question: "How is IRR different from cash-on-cash return?",
    answer:
      "Cash-on-cash return is a single-year snapshot. IRR accounts for every cash flow over the entire holding period — including the lump sum from selling the property — and factors in the time value of money, so a dollar today is worth more than a dollar five years from now. It's a more complete picture of a deal's return, but requires more assumptions (holding period, exit value) to calculate.",
  },
  {
    question: "Why does this calculator assume a constant annual cash flow?",
    answer:
      "It's a simplification to make a standalone IRR estimate possible with just a few inputs. In reality, cash flow typically grows over time as rent increases. Monte Estate's full analysis models rent growth, expense growth, and appreciation year by year, then runs a 10,000-trial Monte Carlo simulation on top of that instead of a single static estimate.",
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

export default function IrrCalculatorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">IRR Calculator</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Internal rate of return accounts for every dollar in and out of a deal — including the sale — and
              when it happens, not just a single year&apos;s snapshot.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-16">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
            <IrrCalculator />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">What is IRR?</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Internal rate of return (IRR) is the annualized return that makes the present value of every
                  cash flow in a deal — your initial investment, each year&apos;s cash flow, and the proceeds
                  from selling — net out to zero. It&apos;s the most complete single number for comparing an
                  investment&apos;s return over its full holding period.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">The formula</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  IRR is the discount rate r that solves: 0 = −Initial Investment + Σ (Cash Flow in year t) ÷
                  (1 + r)ᵗ, including the sale proceeds in the final year. There&apos;s no algebraic shortcut —
                  it&apos;s solved by testing rates until the equation balances, which is exactly what this calculator
                  does behind the scenes.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Why it matters</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Cap rate and cash-on-cash return are single-year snapshots. IRR is the only common metric
                  that accounts for the entire holding period at once — including the timing of cash flows and
                  the size of the eventual sale — which is why it&apos;s the standard for comparing deals with
                  different holding periods or exit strategies.
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
              This calculator assumes flat cash flow. Monte Estate models rent growth, expense growth, and
              appreciation year by year, then runs a 10,000-trial Monte Carlo simulation around your IRR — free
              to start, no credit card required.
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
