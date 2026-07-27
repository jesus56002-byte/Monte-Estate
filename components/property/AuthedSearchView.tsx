"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Home, Loader2, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { AddressSearchForm } from "@/components/property/AddressSearchForm";
import { PropertyIllustration } from "@/components/marketing/PropertyIllustration";
import { Button } from "@/components/ui/button";
import { createAnalysis } from "@/app/(app)/deals/actions";
import { clearPendingAddress } from "@/app/search/actions";

function OrDivider() {
  return (
    <div className="flex w-full items-center gap-3 lg:w-auto lg:flex-col lg:self-stretch">
      <div className="h-px flex-1 bg-border lg:h-auto lg:w-px lg:flex-1" />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        or
      </span>
      <div className="h-px flex-1 bg-border lg:h-auto lg:w-px lg:flex-1" />
    </div>
  );
}

/**
 * The signed-in search experience: one step, address to saved deal. Also
 * handles the handoff from the anonymous flow (AnonymousSearchView) — a
 * visitor who previewed an address and hit the signup wall lands back here
 * already authenticated, and `pendingAddress` (from the cookie stashed
 * before signup, read server-side in app/search/page.tsx) auto-runs the
 * analysis they were actually here for instead of making them search again.
 */
export function AuthedSearchView({ pendingAddress }: { pendingAddress?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  // Separate from `isPending` on purpose: if the auto-run fails and the user
  // retries manually, `pendingAddress` is still a truthy prop (it's fixed at
  // mount), so gating the loading screen on `isPending` alone would show
  // "Finishing your analysis for {stale address}" for an unrelated manual
  // search. This flips to false the moment the auto-run attempt settles,
  // whichever way, and never turns back on.
  const [isAutoRunning, setIsAutoRunning] = useState(Boolean(pendingAddress));
  const hasAutoRun = useRef(false);

  function handleSearch(address: string) {
    setErrorMessage(null);
    setErrorCode(null);

    startTransition(async () => {
      const result = await createAnalysis(address);
      if ("error" in result) {
        setErrorMessage(result.error);
        setErrorCode(result.code ?? null);
        setIsAutoRunning(false);
        return;
      }
      router.push(`/deals/${result.dealId}`);
    });
  }

  useEffect(() => {
    if (!pendingAddress || hasAutoRun.current) return;
    hasAutoRun.current = true;
    clearPendingAddress();
    handleSearch(pendingAddress);
    // handleSearch is stable enough for this one-time, mount-only auto-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAddress]);

  if (isAutoRunning) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">Finishing your analysis for {pendingAddress}…</p>
          <p className="text-sm text-muted-foreground">This takes a few seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-6 py-20">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Sparkles className="size-3.5" />
        Powerful real estate analysis
      </span>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Start an analysis</h1>
        <p className="max-w-lg leading-relaxed text-muted-foreground">
          Search a real address or build your own scenario — either way, get instant results, a
          Monte Carlo simulation, and an AI interpretation.
        </p>
      </div>

      <div className="flex w-full max-w-4xl flex-col items-stretch gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-soft">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Home className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Search by address</h2>
            <p className="text-sm text-muted-foreground">
              Auto-fill beds, baths, square footage, and estimated value and rent.
            </p>
          </div>
          <AddressSearchForm onSearch={handleSearch} isSearching={isPending} />
          {isPending && (
            <p className="text-xs text-muted-foreground">
              Looking up property data and running your analysis — this takes a few seconds…
            </p>
          )}
        </div>

        <OrDivider />

        <div className="flex flex-1 flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-soft">
          <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <SlidersHorizontal className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Custom scenario</h2>
            <p className="text-sm text-muted-foreground">
              No address needed — enter your own purchase price, financing, and assumptions.
            </p>
          </div>
          <Button asChild size="lg" variant="outline" className="w-full max-w-xs">
            <Link href="/search/custom">Analyze a custom scenario</Link>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p role="alert" className="text-sm font-medium">
              {errorMessage}
            </p>
          </div>
          {errorCode === "QUOTA_EXCEEDED" && (
            <Button asChild size="sm">
              <Link href="/settings">View plans</Link>
            </Button>
          )}
        </div>
      )}

      <div className="relative w-full max-w-2xl pb-10">
        <PropertyIllustration />
        <div className="relative z-10 mx-auto -mt-6 flex w-full max-w-lg items-start gap-4 rounded-2xl border bg-card px-6 py-5 shadow-soft-lg">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">This is not financial advice.</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Monte Estate provides educational investment analysis tools.
              Always do your own research and consult a professional advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
