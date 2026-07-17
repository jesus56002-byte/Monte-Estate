import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatFullDate, formatPercent, formatSavedBadge } from "@/lib/utils/format";
import type { Deal } from "@/types/deal";

export function DealCard({ deal }: { deal: Deal }) {
  const result = deal.calculatedResults;

  return (
    <Link href={`/deals/${deal.id}`} className="group block">
      <div className="flex flex-col gap-5 rounded-2xl border bg-card px-6 py-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-soft-lg sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-2 sm:w-64 sm:shrink-0">
          <div className="min-w-0">
            <p className="text-lg font-bold leading-snug">{deal.label}</p>
            <p className="truncate text-sm text-muted-foreground">
              {[deal.city, deal.state].filter(Boolean).join(", ") || deal.address}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <Bookmark className="size-3.5" />
            {formatSavedBadge(deal.createdAt)}
          </span>
        </div>

        {result ? (
          <div className="grid grid-cols-3 gap-4 sm:flex sm:flex-1 sm:justify-center sm:gap-10">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Monthly cash flow</p>
              <p
                className={cn(
                  "truncate text-base font-bold sm:text-lg",
                  result.monthlyCashFlowYear1 >= 0 ? "text-foreground" : "text-destructive"
                )}
              >
                {formatCurrency(result.monthlyCashFlowYear1)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Cap rate</p>
              <p className="truncate text-base font-bold sm:text-lg">{formatPercent(result.capRate)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Cash-on-cash</p>
              <p
                className={cn(
                  "truncate text-base font-bold sm:text-lg",
                  result.cashOnCash >= 0 ? "text-foreground" : "text-destructive"
                )}
              >
                {formatPercent(result.cashOnCash)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No results saved.</p>
        )}

        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-center sm:gap-1.5">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            <ChevronRight className="size-5" />
          </span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">{formatFullDate(deal.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
