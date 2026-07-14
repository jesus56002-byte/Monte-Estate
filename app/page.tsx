import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { publicAccessEnabled } from "@/lib/env";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-semibold tracking-tight">Monte Estate</span>
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
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Know if a property is a good investment before you make an offer.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Enter an address, tune your financing assumptions, and see cash flow, cap
          rate, cash-on-cash return, and IRR — plus a 10,000-run Monte Carlo
          simulation of best, worst, and median outcomes.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/search">Analyze a property</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
