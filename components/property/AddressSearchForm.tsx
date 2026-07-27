"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Home, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addressSearchSchema, type AddressSearchInput } from "@/lib/validation/property";

type AddressSuggestion = {
  text: string;
  placeId: string;
};

const SUGGESTION_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

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
    setValue,
    formState: { errors },
  } = useForm<AddressSearchInput>({
    resolver: zodResolver(addressSearchSchema),
  });
  const { onChange: registerOnChange, ref: registerRef, ...registerRest } = register("address");

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const sessionTokenRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function getSessionToken(): string {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = crypto.randomUUID();
    }
    return sessionTokenRef.current;
  }

  function fetchSuggestions(input: string) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch("/api/address-autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, sessionToken: getSessionToken() }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { suggestions: [] }))
      .then((data: { suggestions?: AddressSuggestion[] }) => {
        setSuggestions(data.suggestions ?? []);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setSuggestions([]);
      });
  }

  function handleAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    registerOnChange(event);
    const value = event.target.value;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => fetchSuggestions(trimmed), SUGGESTION_DEBOUNCE_MS);
  }

  function selectSuggestion(suggestion: AddressSuggestion) {
    setValue("address", suggestion.text, { shouldValidate: true });
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    // A selection completes the current billed session — the next keystroke
    // starts a new one.
    sessionTokenRef.current = null;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0) {
        event.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        setShowSuggestions(false);
        onSearch(values.address);
      })}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div ref={containerRef} className="relative flex-1">
        <Label htmlFor="address" className="sr-only">
          Property address
        </Label>
        <div className="relative">
          <Home className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="address"
            placeholder="123 Main St, Austin, TX 78701"
            aria-invalid={Boolean(errors.address)}
            autoComplete="off"
            className="h-14 rounded-full border-2 border-primary/30 bg-background pr-4 pl-11 text-base shadow-soft-lg focus-visible:border-primary"
            onChange={handleAddressChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            ref={registerRef}
            {...registerRest}
          />
        </div>
        {errors.address && (
          <p role="alert" className="mt-1 ml-4 text-sm text-destructive">
            {errors.address.message}
          </p>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 z-10 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.placeId}>
                <button
                  type="button"
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    index === highlightedIndex ? "bg-muted" : "hover:bg-muted"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" size="lg" className="h-14 rounded-full px-8 text-base" disabled={isSearching}>
        {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        {isSearching ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
