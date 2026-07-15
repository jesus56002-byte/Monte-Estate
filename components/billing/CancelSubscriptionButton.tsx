"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function CancelSubscriptionButton({
  cancelAtPeriodEnd,
  periodEndLabel,
}: {
  cancelAtPeriodEnd: boolean;
  /** e.g. "July 15, 2026" — shown in the cancel confirmation and the "cancels on" message. */
  periodEndLabel: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticCancelAtPeriodEnd, setOptimisticCancelAtPeriodEnd] = useState(cancelAtPeriodEnd);

  function handleClick() {
    const action = optimisticCancelAtPeriodEnd ? "reactivate" : "cancel";

    if (action === "cancel") {
      const confirmed = window.confirm(
        periodEndLabel
          ? `Cancel your subscription? You'll keep access until ${periodEndLabel}, then drop to the Free plan.`
          : "Cancel your subscription? You'll drop to the Free plan at the end of the current billing period."
      );
      if (!confirmed) return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body.message ?? "Something went wrong. Try again.");
          return;
        }
        setOptimisticCancelAtPeriodEnd(body.cancelAtPeriodEnd);
      } catch {
        setError("Couldn't reach the server. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {optimisticCancelAtPeriodEnd && periodEndLabel && (
        <p className="text-xs text-muted-foreground">Cancels on {periodEndLabel}.</p>
      )}
      <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? "Working…" : optimisticCancelAtPeriodEnd ? "Reactivate subscription" : "Cancel subscription"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
