import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, Dices, Layers, Percent, Sparkles } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";

const TITLE = "How It Works";
const DESCRIPTION =
  "How Monte Estate's Monte Carlo simulation works — plain-language explanation of why it beats a single-point estimate for real estate investment analysis.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/how-it-works" },
  openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/how-it-works" },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const SECTIONS = [
  {
    icon: AlertTriangle,
    title: "Why a single number isn't enough",
    body: "Most rental property calculators give you one cash flow number, one cap rate, one IRR — all built on assumptions you typed in as if they were certain. But rent growth, vacancy, and appreciation are never exactly what you assumed; they drift, sometimes a little, sometimes a lot. A single-point estimate hides that uncertainty instead of showing it to you.",
  },
  {
    icon: Dices,
    title: "What Monte Carlo simulation actually does",
    body: "Instead of running your numbers once, Monte Estate runs the same deal 10,000 times, nudging appreciation, rent growth, and vacancy by a different realistic amount each time. Every trial reuses the exact same cash flow, cap rate, and IRR math as the main analysis — only the inputs vary. The result isn't a single guess; it's a full range of what could plausibly happen.",
  },
  {
    icon: Layers,
    title: "What we randomize, and why",
    body: "Three assumptions get varied per trial: appreciation rate, rent growth, and vacancy rate — the three inputs with the most real-world uncertainty over a multi-year hold. Each one is centered on your own estimate, with most trials landing close to it and a shrinking number landing further out in either direction — the same statistical pattern used in weather forecasting and financial risk modeling. Financing terms, expenses, and your holding period stay fixed at what you entered, since those are typically known in advance, not uncertain.",
  },
  {
    icon: Percent,
    title: "From 10,000 trials to one clear answer",
    body: "All 10,000 outcomes get sorted and summarized into three numbers: a worst case (5th percentile — only 5% of trials came in worse than this), a median (the 50th percentile — a realistic middle outcome), and a best case (95th percentile). We also surface the probability that a deal loses money over your holding period, so you're looking at actual risk, not just an upside case.",
  },
  {
    icon: Sparkles,
    title: "Real data grounds every simulation",
    body: "Every simulation starts from real numbers, not blind guesses — enter an address and Monte Estate pulls actual property details plus estimated value and rent to pre-fill your starting assumptions. Once the simulation runs, an AI-generated recommendation reads the full spread of outcomes and gives you a plain-language take on the deal.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How our Monte Carlo simulation works
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Real estate returns are never as certain as a single spreadsheet number suggests. Here&apos;s how
              Monte Estate turns that uncertainty into a clear, honest range of outcomes.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-14">
            {SECTIONS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                </div>
                <p className="leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border bg-secondary/60 px-8 py-14 text-center shadow-soft">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">See it on your next deal</h2>
            <p className="max-w-md text-muted-foreground">
              Enter a real address or build a custom scenario — 3 free analyses, no credit card required.
            </p>
            <Button asChild size="lg">
              <Link href="/search">Start Analyzing</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
