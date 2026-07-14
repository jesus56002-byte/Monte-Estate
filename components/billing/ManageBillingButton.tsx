"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await res.json();

      if (res.ok && body.url) {
        window.location.href = body.url;
        return;
      }
    } catch {
      // fall through to re-enable the button below
    }

    setLoading(false);
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "Loading…" : "Billing"}
    </Button>
  );
}
