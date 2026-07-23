"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { AddressSearchForm } from "@/components/property/AddressSearchForm";
import { PropertyIllustration } from "@/components/marketing/PropertyIllustration";
import { Button } from "@/components/ui/button";
import { createAnalysis } from "@/app/(app)/deals/actions";

export default function SearchPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  function handleSearch(address: string) {
    setErrorMessage(null);
    setErrorCode(null);

    startTransition(async () => {
      const result = await createAnalysis(address);
      if ("error" in result) {
        setErrorMessage(result.error);
        setErrorCode(result.code ?? null);
        return;
      }
      router.push(`/deals/${result.dealId}`);
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-6 py-20">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Sparkles className="size-3.5" />
        Powerful real estate analysis
      </span>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Search a property</h1>
        <p className="max-w-md leading-relaxed text-muted-foreground">
          Enter a full address to pull beds, baths, square footage, year built,
          and estimated value and rent, then get instant results, a Monte
          Carlo simulation, and an AI interpretation.
        </p>
      </div>

      <div className="flex w-full max-w-xl flex-col items-center gap-3">
        <AddressSearchForm onSearch={handleSearch} isSearching={isPending} />
        {isPending && (
          <p className="text-xs text-muted-foreground">
            Looking up property data and running your analysis — this takes a few seconds…
          </p>
        )}
        <Link href="/search/custom" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Or analyze a custom scenario without an address
        </Link>
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
