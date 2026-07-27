import Link from "next/link";
import type { Metadata } from "next";
import { Calculator, TrendingUp, Percent, LineChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";

const TITLE = "Real Estate Investment Calculators";
const DESCRIPTION =
  "Free real estate investment calculators: cap rate, cash flow, cash-on-cash return, and IRR. Instant results, no signup required.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/calculators" },
  openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/calculators" },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

const CALCULATORS: { icon: LucideIcon; title: string; description: string; href: string }[] = [
  {
    icon: Percent,
    title: "Cap Rate Calculator",
    description: "Net operating income divided by purchase price — the fastest way to compare deals in cash terms.",
    href: "/cap-rate-calculator",
  },
  {
    icon: TrendingUp,
    title: "Cash Flow Calculator",
    description: "What's left over each month after the mortgage payment and operating expenses.",
    href: "/cash-flow-calculator",
  },
  {
    icon: Calculator,
    title: "Cash-on-Cash Return Calculator",
    description: "Annual cash flow measured against the actual cash you put into the deal.",
    href: "/cash-on-cash-calculator",
  },
  {
    icon: LineChart,
    title: "IRR Calculator",
    description: "The full holding period's return, accounting for every cash flow and the eventual sale.",
    href: "/irr-calculator",
  },
];

export default function CalculatorsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Investment Calculators</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Four free calculators for the core real estate return metrics. Instant results, no signup
              required.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-20">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
            {CALCULATORS.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </div>
                <h2 className="mt-4 text-base font-semibold">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
