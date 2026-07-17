"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { AddressSearchForm } from "@/components/property/AddressSearchForm";
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
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Search a property</h1>
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
    </div>
  );
}
