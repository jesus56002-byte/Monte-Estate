"use client";

import { useState } from "react";
import Link from "next/link";
import { AddressSearchForm } from "@/components/property/AddressSearchForm";
import { PropertySummaryCard } from "@/components/property/PropertySummaryCard";
import { Button } from "@/components/ui/button";
import type { PropertyData } from "@/types/property";

type SearchStatus = "idle" | "loading" | "error" | "success";

export default function SearchPage() {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);

  async function handleSearch(address: string) {
    setStatus("loading");
    setErrorMessage(null);
    setProperty(null);

    try {
      const res = await fetch("/api/property-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const body = await res.json();

      if (!res.ok) {
        setErrorMessage(body.message ?? "Couldn't look up that address.");
        setStatus("error");
        return;
      }

      setProperty(body.property);
      setStatus("success");
    } catch {
      setErrorMessage("Couldn't reach the server. Try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Search a property</h1>
        <p className="max-w-md text-muted-foreground">
          Enter a full address to pull beds, baths, square footage, year built,
          and estimated value and rent.
        </p>
      </div>

      <AddressSearchForm onSearch={handleSearch} isSearching={status === "loading"} />

      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {status === "success" && property && (
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          <PropertySummaryCard property={property} />
          <Button asChild size="lg">
            <Link href={`/analyze?address=${encodeURIComponent(property.address)}`}>
              Analyze this property
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
