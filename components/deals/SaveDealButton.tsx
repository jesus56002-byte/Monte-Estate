"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDeal, type SaveDealInput } from "@/app/(app)/deals/actions";

export function SaveDealButton({ input }: { input: SaveDealInput }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSave() {
    startTransition(async () => {
      const result = await saveDeal(input);
      if (result.error) {
        setErrorMessage(result.error);
        setStatus("error");
        return;
      }
      setStatus("saved");
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button variant="outline" onClick={handleSave} disabled={isPending || status === "saved"}>
        {status === "saved" ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        {isPending ? "Saving…" : status === "saved" ? "Saved" : "Save this deal"}
      </Button>
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
