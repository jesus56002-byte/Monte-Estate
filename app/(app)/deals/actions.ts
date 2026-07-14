"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/supabase/server";
import type { Json } from "@/types/supabase";
import type { PropertyData } from "@/types/property";
import type { AnalysisResult } from "@/lib/finance/types";
import type { InvestmentInputsFormValues } from "@/lib/validation/investment";
import type { SimulationSummary } from "@/types/deal";

export type SaveDealInput = {
  property: PropertyData;
  investmentInputs: InvestmentInputsFormValues;
  calculatedResults: AnalysisResult;
  simulationSummary?: SimulationSummary | null;
};

export type SaveDealState = { error: string | null };

export async function saveDeal(input: SaveDealInput): Promise<SaveDealState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { error: "You must be signed in to save a deal." };
  }

  const { error } = await supabase.from("deals").insert({
    user_id: user.id,
    label: input.property.address,
    address: input.property.address,
    city: input.property.city,
    state: input.property.state,
    zip: input.property.zipCode,
    latitude: input.property.latitude,
    longitude: input.property.longitude,
    // Domain types don't carry an index signature, so a structural cast through
    // `unknown` is required to store them in a jsonb column — see lib/deals/mapRow.ts
    // for the corresponding read-side cast.
    property_snapshot: input.property as unknown as Json,
    investment_inputs: input.investmentInputs as unknown as Json,
    calculated_results: input.calculatedResults as unknown as Json,
    simulation_summary: (input.simulationSummary ?? null) as unknown as Json,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/deals");
  return { error: null };
}

export type DeleteDealState = { error: string | null };

export async function deleteDeal(dealId: string): Promise<DeleteDealState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    redirect("/login");
  }

  const { error, count } = await supabase
    .from("deals")
    .delete({ count: "exact" })
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }
  if (!count) {
    return { error: "That deal doesn't exist or you don't have access to it." };
  }

  revalidatePath("/deals");
  redirect("/deals");
}
