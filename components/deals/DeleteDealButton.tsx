"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDeal } from "@/app/(app)/deals/actions";

export function DeleteDealButton({ dealId }: { dealId: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Delete this saved deal? This can't be undone.")) return;

    startTransition(async () => {
      const result = await deleteDeal(dealId);
      // A successful delete redirects server-side and never resolves this
      // promise with a value here — only a failure returns { error }.
      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
        <Trash2 className="size-4" />
        {isPending ? "Deleting…" : "Delete"}
      </Button>
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
