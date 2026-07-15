import Link from "next/link";
import { Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { publicAccessEnabled } from "@/lib/env";

const FEATURES = [
  "Auto-populated property data from a real address",
  "Cash flow, cap rate, cash-on-cash return, and IRR",
  "10,000-trial Monte Carlo simulation of best/worst/median outcomes",
  "AI-generated interpretation of every deal",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b bg-card/60 px-6 py-4 backdrop-blur">
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
          className="pointer-events-none absolute -top-32 -right-40 size-[32rem] rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -left-32 size-96 rounded-full bg-accent/25 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col items-start gap-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/25 px-3 py-1 text-xs font-medium text-accent-foreground">
              <TrendingUp className="size-3.5" />
              Your spreadsheet could never
            </span>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Know if a property is a good investment before you make an offer.
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Enter an address, tune your financing assumptions, and see cash flow, cap
              rate, cash-on-cash return, and IRR — plus a 10,000-run Monte Carlo
              simulation of best, worst, and median outcomes.
            </p>

            <ul className="flex flex-col gap-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <Check className="size-3 text-success" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/search">Analyze a property</Link>
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
            <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5">
              <p className="text-sm font-medium text-muted-foreground">Investment Analysis</p>
              <p className="mt-1 text-base font-semibold">Monte Carlo simulation</p>
              <svg viewBox="0 0 240 90" className="mt-4 w-full text-accent" aria-hidden="true">
                <path
                  d="M0 85 C 40 85, 55 20, 120 15 C 185 20, 200 85, 240 85"
                  fill="currentColor"
                  opacity="0.28"
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
                <div className="rounded-lg bg-muted px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Median profit</p>
                  <p className="text-sm font-semibold">$125,000</p>
                </div>
                <div className="rounded-lg bg-muted px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Prob. of profit</p>
                  <p className="text-sm font-semibold text-success">78%</p>
                </div>
                <div className="rounded-lg bg-muted px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">IRR (median)</p>
                  <p className="text-sm font-semibold">12.4%</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-8 -right-6 hidden w-44 rounded-xl border bg-card p-3 shadow-lg shadow-primary/5 sm:block">
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
          </div>
        </div>
      </main>
    </div>
  );
}
