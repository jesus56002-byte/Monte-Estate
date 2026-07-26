import { Bath, Bed, Calendar, Ruler } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { PropertyData } from "@/types/property";

export function PropertySummaryCard({
  property,
  totalMonthlyPayment,
}: {
  property: PropertyData;
  /** Year-1 PITI (principal, interest, tax, insurance, HOA) from the current financing inputs. */
  totalMonthlyPayment?: number;
}) {
  const isCustom = property.source === "custom";

  const facts = [
    { icon: Bed, label: "Beds", value: property.bedrooms ?? "—" },
    { icon: Bath, label: "Baths", value: property.bathrooms ?? "—" },
    { icon: Ruler, label: "Sq ft", value: formatNumber(property.squareFootage) },
    { icon: Calendar, label: "Year built", value: property.yearBuilt ?? "—" },
  ];

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-lg">{property.address}</CardTitle>
        <CardDescription>
          {isCustom
            ? "Custom scenario — no property lookup"
            : [property.city, property.state, property.zipCode].filter(Boolean).join(", ") ||
              "Location details unavailable"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {!isCustom && (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3.5" />
                  {label}
                </dt>
                <dd className="text-lg font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div
          className={cn(
            "grid grid-cols-2 gap-4",
            totalMonthlyPayment !== undefined && "sm:grid-cols-3",
            !isCustom && "border-t pt-4"
          )}
        >
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{isCustom ? "Purchase price" : "Estimated value"}</dt>
            <dd className="text-xl font-semibold">{formatCurrency(property.estimatedValue)}</dd>
          </div>
          {totalMonthlyPayment !== undefined && (
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Total monthly payment</dt>
              <dd className="text-xl font-semibold">{formatCurrency(totalMonthlyPayment)}</dd>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{isCustom ? "Monthly rent" : "Estimated rent / mo"}</dt>
            <dd className="text-xl font-semibold">{formatCurrency(property.estimatedRent)}</dd>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
