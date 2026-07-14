"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
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
      <Button size="lg" onClick={handleClick} disabled={loading}>
        {loading ? "Redirecting…" : "Subscribe — $11.99/month"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
