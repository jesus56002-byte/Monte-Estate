"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Home, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addressSearchSchema, type AddressSearchInput } from "@/lib/validation/property";

export function AddressSearchForm({
  onSearch,
  isSearching,
}: {
  onSearch: (address: string) => void;
  isSearching: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressSearchInput>({
    resolver: zodResolver(addressSearchSchema),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => onSearch(values.address))}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <Label htmlFor="address" className="sr-only">
          Property address
        </Label>
        <div className="relative">
          <Home className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="address"
            placeholder="123 Main St, Austin, TX 78701"
            aria-invalid={Boolean(errors.address)}
            className="h-14 rounded-full border-none bg-card pr-4 pl-11 text-base shadow-soft-lg"
            {...register("address")}
          />
        </div>
        {errors.address && (
          <p role="alert" className="mt-1 ml-4 text-sm text-destructive">
            {errors.address.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="h-14 rounded-full px-8 text-base" disabled={isSearching}>
        {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        {isSearching ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
