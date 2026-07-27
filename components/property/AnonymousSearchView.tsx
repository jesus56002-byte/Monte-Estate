"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BedDouble, Home, LineChart, ShieldCheck, Sparkles } from "lucide-react";
import { AddressSearchForm } from "@/components/property/AddressSearchForm";
import { PropertyIllustration } from "@/components/marketing/PropertyIllustration";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { previewProperty, stashPendingAddress } from "@/app/search/actions";
import type { PropertyData } from "@/types/property";

/**
 * "Search first, sign up second" — an anonymous visitor gets a free
 * property preview (facts + value/rent estimates, no financing assumptions,
 * no quota spent) before hitting any account wall. Only clicking "Generate
 * Monte Carlo Analysis" sends them to signup, with the address stashed
 * (app/search/actions.ts's stashPendingAddress) so AuthedSearchView can
 * auto-run the real analysis the moment they're back, signed in.
 */
export function AnonymousSearchView() {
  const router = useRouter();
  const [isPreviewing, startPreviewTransition] = useTransition();
  const [isContinuing, startContinueTransition] = useTransition();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSearch(address: string) {
    setErrorMessage(null);
    setProperty(null);

    startPreviewTransition(async () => {
      const result = await previewProperty(address);
      if ("error" in result) {
        setErrorMessage(result.error);
        return;
      }
      setProperty(result.property);
    });
  }

  function handleGenerateAnalysis() {
    if (!property) return;
    startContinueTransition(async () => {
      await stashPendingAddress(property.address);
      router.push("/signup");
    });
  }

  if (property) {
    return (
      <div className="flex flex-1 flex-col items-center gap-8 px-6 py-20">
        <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border bg-card p-6 text-center shadow-soft">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Free preview</p>
            <h1 className="text-xl font-semibold">{property.address}</h1>
            {(property.city || property.state) && (
              <p className="text-sm text-muted-foreground">
                {[property.city, property.state, property.zipCode].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1">
              <BedDouble className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">
                {property.bedrooms ?? "—"} bd / {property.bathrooms ?? "—"} ba
              </p>
              <p className="text-xs text-muted-foreground">
                {property.squareFootage ? `${property.squareFootage.toLocaleString()} sqft` : "Layout"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Home className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatCurrency(property.estimatedValue)}</p>
              <p className="text-xs text-muted-foreground">Estimated value</p>
            </div>
            <div className="col-span-2 flex flex-col items-center gap-1 sm:col-span-2">
              <LineChart className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatCurrency(property.estimatedRent)}/mo</p>
              <p className="text-xs text-muted-foreground">Estimated rent</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              That&apos;s the free preview. Create a free account to run a full 10,000-trial Monte Carlo
              simulation with an AI recommendation — 3 analyses included, no credit card required.
            </p>
            <Button size="lg" className="w-full" onClick={handleGenerateAnalysis} disabled={isContinuing}>
              {isContinuing ? "One moment…" : "Generate Monte Carlo Analysis"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setProperty(null)}>
              Search a different address
            </Button>
          </div>
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">See any property, free</h1>
        <p className="max-w-lg leading-relaxed text-muted-foreground">
          Search a real address and see estimated value and rent instantly — no account required.
          Create a free account only when you&apos;re ready for the full Monte Carlo simulation.
        </p>
      </div>

      <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-soft">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Home className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Search by address</h2>
          <p className="text-sm text-muted-foreground">
            Instant beds, baths, square footage, and estimated value and rent.
          </p>
        </div>
        <AddressSearchForm onSearch={handleSearch} isSearching={isPreviewing} />
        {isPreviewing && <p className="text-xs text-muted-foreground">Looking up property data…</p>}
      </div>

      {errorMessage && (
        <div className="flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p role="alert" className="text-sm font-medium">
              {errorMessage}
            </p>
          </div>
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
