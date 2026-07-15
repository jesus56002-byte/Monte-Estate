"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeButton({
  item,
  label,
  size = "lg",
  variant = "default",
}: {
  item: "starter" | "investor" | "topup";
  label: string;
  size?: "sm" | "lg";
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const body = await res.json();

      if (!res.ok || !body.url) {
        setError(body.message ?? "Couldn't start checkout. Try again.");
        setLoading(false);
        return;
      }

      window.location.href = body.url;
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button size={size} variant={variant} onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting…" : label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
