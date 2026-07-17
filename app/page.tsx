import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Check, TrendingUp, Search, Calculator, Activity, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/marketing/Footer";
import { publicAccessEnabled } from "@/lib/env";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: "Property search",
    description: "Enter a real address and auto-populate beds, baths, square footage, and estimated value and rent.",
  },
  {
    icon: Calculator,
    title: "Investment calculator",
    description: "Cash flow, cap rate, cash-on-cash return, and IRR, recomputed instantly as you tune your assumptions.",
  },
  {
    icon: Activity,
    title: "Monte Carlo simulation",
    description: "10,000 trials show the realistic range of outcomes — worst, median, and best case — not just one guess.",
  },
  {
    icon: Sparkles,
    title: "AI interpretation",
    description: "A plain-language read on every deal, grounded in the actual numbers, generated the moment you search.",
  },
];

const STEPS = [
  {
    title: "Enter an address",
    description: "We pull property details and estimated value and rent automatically — no manual data entry.",
  },
  {
    title: "Tune your assumptions",
    description: "Adjust financing, expenses, and growth rates to match your actual deal.",
  },
  {
    title: "Get your answer",
    description: "Instant results, a Monte Carlo simulation, and an AI interpretation — all in one place, saved for later.",
  },
];

function FeatureCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/70 px-6 py-4 backdrop-blur">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          {publicAccessEnabled && (
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-40 size-[32rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -left-32 size-96 rounded-full bg-lavender/15 blur-3xl"
        />

        {/* Hero */}
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col items-start gap-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <TrendingUp className="size-3.5" />
              Your spreadsheet could never
            </span>
            <h1 className="max-w-xl text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
              Analyze real estate investments with confidence.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Monte Estate combines Monte Carlo simulation, property data, and AI-powered insights to help
              investors evaluate opportunities before committing capital.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/search">Start Analyzing</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            <p className="max-w-md text-xs text-muted-foreground">
              Educational tool only — not financial, investment, legal, or tax advice.{" "}
              <Link href="/terms" className="underline underline-offset-4">
                Terms & Conditions
              </Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border bg-card p-6 shadow-soft-lg">
              <p className="text-sm font-medium text-muted-foreground">Investment Analysis</p>
              <p className="mt-1 text-base font-semibold">Monte Carlo simulation</p>
              <svg viewBox="0 0 240 90" className="mt-4 w-full text-lavender" aria-hidden="true">
                <path
                  d="M0 85 C 40 85, 55 20, 120 15 C 185 20, 200 85, 240 85"
                  fill="currentColor"
                  opacity="0.22"
                />
                <path
                  d="M0 85 C 40 85, 55 20, 120 15 C 185 20, 200 85, 240 85"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line x1="120" y1="8" x2="120" y2="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              </svg>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="min-w-0 rounded-xl bg-muted px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Median profit</p>
                  <p className="truncate text-sm font-semibold">$125,000</p>
                </div>
                <div className="min-w-0 rounded-xl bg-muted px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Prob. of profit</p>
                  <p className="truncate text-sm font-semibold text-success">78%</p>
                </div>
                <div className="min-w-0 rounded-xl bg-muted px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">IRR (median)</p>
                  <p className="truncate text-sm font-semibold">12.4%</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-8 -right-6 hidden w-44 rounded-xl border bg-card p-3 shadow-soft-lg sm:block">
              <p className="text-xs font-medium text-muted-foreground">Compare deals</p>
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span>123 Main St</span>
                  <Check className="size-3.5 text-success" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>456 Oak Ave</span>
                  <Check className="size-3.5 text-success" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-soft-lg sm:flex">
              <span className="flex size-6 items-center justify-center rounded-full bg-success/15">
                <Sparkles className="size-3.5 text-success" />
              </span>
              <span className="text-xs font-medium">AI: Strong buy</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-t bg-card/40 px-6 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
              <p className="max-w-lg text-muted-foreground">
                From address to answer in one search — no spreadsheets, no manual data entry.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex flex-col items-start gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="px-6 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything in one place</h2>
              <p className="max-w-lg text-muted-foreground">
                The tools you&apos;d otherwise stitch together across a spreadsheet, a listing site, and a calculator.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t px-6 py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border bg-secondary/60 px-8 py-14 text-center shadow-soft">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-card shadow-soft">
              <Sun className="size-6 text-primary" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to analyze your next deal?</h2>
            <p className="max-w-md text-muted-foreground">
              Free to start — 3 analyses, no credit card required.
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
