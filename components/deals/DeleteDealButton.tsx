"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDeal } from "@/app/(app)/deals/actions";

export function DeleteDealButton({ dealId }: { dealId: string }) {
  return (
    <form
      action={() => deleteDeal(dealId)}
      onSubmit={(e) => {
        if (!confirm("Delete this saved deal? This can't be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        <Trash2 className="size-4" />
        Delete
      </Button>
    </form>
  );
}
