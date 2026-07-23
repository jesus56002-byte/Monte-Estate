import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAuthedUser } from "@/lib/supabase/server";
import { deriveDefaultInputs } from "@/lib/utils/defaults";
import { CustomAnalysisForm } from "@/components/property/CustomAnalysisForm";
import type { PropertyData } from "@/types/property";

/** No real property to derive from — deriveDefaultInputs falls back to its baked-in defaults for the null fields. */
const BLANK_PROPERTY: PropertyData = {
  address: "",
  city: null,
  state: null,
  zipCode: null,
  latitude: null,
  longitude: null,
  propertyType: null,
  bedrooms: null,
  bathrooms: null,
  squareFootage: null,
  yearBuilt: null,
  lotSize: null,
  hoaFeeMonthly: null,
  estimatedValue: null,
  estimatedValueRangeLow: null,
  estimatedValueRangeHigh: null,
  estimatedRent: null,
  estimatedRentRangeLow: null,
  estimatedRentRangeHigh: null,
  source: "custom",
  fetchedAt: new Date(0).toISOString(),
};

export default async function CustomAnalysisPage() {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "default_appreciation_pct, default_vacancy_pct, default_maintenance_pct, default_closing_cost_pct, default_insurance_pct"
    )
    .eq("id", user.id)
    .single();

  const defaultValues = deriveDefaultInputs(BLANK_PROPERTY, {
    appreciationPct: profile?.default_appreciation_pct,
    vacancyPct: profile?.default_vacancy_pct,
    maintenancePct: profile?.default_maintenance_pct,
    closingCostPct: profile?.default_closing_cost_pct,
    insurancePct: profile?.default_insurance_pct,
  });

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to address search
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analyze a custom scenario</h1>
        <p className="max-w-md leading-relaxed text-muted-foreground">
          No address needed — enter your own assumptions and get the same instant results, Monte
          Carlo simulation, and AI interpretation as an address-based analysis.
        </p>
      </div>

      <CustomAnalysisForm defaultValues={defaultValues} />
    </div>
  );
}
