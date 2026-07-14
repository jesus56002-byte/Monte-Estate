import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { Deal } from "@/types/deal";

export function DealCard({ deal }: { deal: Deal }) {
  const result = deal.calculatedResults;

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader>
          <CardTitle className="text-base">{deal.label}</CardTitle>
          <CardDescription>
            {[deal.city, deal.state].filter(Boolean).join(", ") || deal.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-xs text-muted-foreground">Monthly cash flow</dt>
                <dd className="font-medium">{formatCurrency(result.monthlyCashFlowYear1)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cap rate</dt>
                <dd className="font-medium">{formatPercent(result.capRate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cash-on-cash</dt>
                <dd className="font-medium">{formatPercent(result.cashOnCash)}</dd>
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
