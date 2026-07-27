import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { MortgageCalculator } from "@/components/calculators/MortgageCalculator";

const TITLE = "Mortgage Payment Calculator";
const DESCRIPTION =
  "Free mortgage payment calculator. Enter home price, down payment, interest rate, and loan term to instantly calculate your monthly payment, total interest paid, and total of all payments.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/mortgage-calculator" },
  openGraph: {
    title: `${TITLE} — Monte Estate`,
    description: DESCRIPTION,
    url: "https://monte.estate/mortgage-calculator",
  },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const FAQS = [
  {
    question: "What is PITI?",
    answer:
      "PITI stands for Principal, Interest, Taxes, and Insurance — the four components most lenders include in a full monthly mortgage payment. This calculator shows both figures: principal & interest alone, and the total monthly payment including property tax, homeowners insurance, and HOA dues if applicable.",
  },
  {
    question: "Why is total interest paid so much higher than the loan amount?",
    answer:
      "Over a 30-year loan, interest compounds on the remaining balance every month. Early payments are mostly interest with very little principal, which is why the total interest paid over the full term is often comparable to — or larger than — the amount borrowed, especially at higher interest rates.",
  },
  {
    question: "How does a larger down payment affect my payment?",
    answer:
      "A larger down payment reduces the loan amount, which directly lowers your monthly principal & interest payment and the total interest paid over the life of the loan. It can also help you avoid private mortgage insurance (PMI) on a conventional loan, though this calculator doesn't model PMI directly.",
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

export default function MortgageCalculatorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Mortgage Payment Calculator</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Your full monthly payment — principal, interest, taxes, and insurance — plus the total interest
              you&apos;ll pay over the life of the loan.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-16">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
            <MortgageCalculator />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">What this calculator shows</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Enter your home price, down payment, interest rate, and loan term to get your monthly
                  principal &amp; interest payment. Add property tax, insurance, and HOA dues for your full
                  monthly payment (PITI) — plus the total interest you&apos;ll pay and the total of every
                  payment over the entire loan term.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">The formula</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Monthly Principal &amp; Interest = Loan Amount × Monthly Rate × (1 + Monthly Rate)ᴺ ÷
                  [(1 + Monthly Rate)ᴺ − 1], where N is the total number of monthly payments. It&apos;s the
                  standard amortization formula used by lenders.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Why it matters for investors</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Your mortgage payment is the largest fixed cost in almost every rental property analysis —
                  it drives cash flow, cash-on-cash return, and how much cushion you have if rent dips or a
                  vacancy hits. Getting it right before running the rest of the numbers matters.
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
              A mortgage payment is one piece of the puzzle. Monte Estate adds cap rate, cash flow,
              cash-on-cash return, IRR, and a 10,000-trial Monte Carlo simulation — free to start, no credit
              card required.
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
