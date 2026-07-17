import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { Deal } from "@/types/deal";

export function DealCard({ deal }: { deal: Deal }) {
  const result = deal.calculatedResults;

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-soft-lg">
        <CardHeader>
          <CardTitle className="text-base">{deal.label}</CardTitle>
          <CardDescription>
            {[deal.city, deal.state].filter(Boolean).join(", ") || deal.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <dl className="grid grid-cols-3 gap-4">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Monthly cash flow</dt>
                <dd className="truncate font-medium">{formatCurrency(result.monthlyCashFlowYear1)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Cap rate</dt>
                <dd className="truncate font-medium">{formatPercent(result.capRate)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Cash-on-cash</dt>
                <dd className="truncate font-medium">{formatPercent(result.cashOnCash)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No results saved.</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
