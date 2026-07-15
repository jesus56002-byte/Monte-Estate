"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Search a property</h1>
        <p className="max-w-md text-muted-foreground">
          Enter a full address to pull beds, baths, square footage, year built,
          and estimated value and rent, then get instant results, a Monte
          Carlo simulation, and an AI interpretation.
        </p>
      </div>

      <AddressSearchForm onSearch={handleSearch} isSearching={isPending} />

      {errorMessage && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
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
