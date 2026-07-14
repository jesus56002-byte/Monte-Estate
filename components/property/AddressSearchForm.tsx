"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
        <Input
          id="address"
          placeholder="123 Main St, Austin, TX 78701"
          aria-invalid={Boolean(errors.address)}
          {...register("address")}
        />
        {errors.address && (
          <p role="alert" className="mt-1 text-sm text-destructive">
            {errors.address.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSearching}>
        {isSearching ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
