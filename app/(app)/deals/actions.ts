"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/supabase/server";
import { env, hasRentCastKey, hasAnthropicKey } from "@/lib/env";
import { isAdminEmail } from "@/lib/subscription";
import { addressSearchSchema } from "@/lib/validation/property";
import { getPropertyRecord, getRentEstimate, getValueEstimate } from "@/lib/rentcast/client";
import { RentCastApiError } from "@/lib/rentcast/types";
import { normalizeRentCastData } from "@/lib/rentcast/normalize";
import { deriveDefaultInputs } from "@/lib/utils/defaults";
import { toInvestmentInputs, type InvestmentInputsFormValues } from "@/lib/validation/investment";
import { runAnalysis } from "@/lib/finance/analysis";
import { generateRecommendation } from "@/lib/anthropic/recommendation";
import type { Database, Json } from "@/types/supabase";
import type { AnalysisResult } from "@/lib/finance/types";
import type { SimulationSummary } from "@/types/deal";
import type { AIRecommendation } from "@/lib/validation/ai";

export type CreateAnalysisResult = { dealId: string } | { error: string; code?: string };

/**
 * The single entry point for "performing an analysis": looks up the address,
 * checks/consumes the caller's quota, runs the deterministic calculation,
 * generates an AI interpretation, and saves all of it as a deal row
 * immediately. There's no separate "preview" step and no unsaved-in-memory
 * analysis state — every analysis a user runs is a saved deal from the
 * moment it's created, which is what makes it survive a refresh or back
 * navigation without re-spending RentCast calls or plan quota.
 */
export async function createAnalysis(address: string): Promise<CreateAnalysisResult> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { error: "You must be signed in to run an analysis." };
  }

  if (!hasRentCastKey) {
    return { error: "Property lookup isn't configured yet. Set RENTCAST_API_KEY to enable it." };
  }

  const parsedAddress = addressSearchSchema.safeParse({ address });
  if (!parsedAddress.success) {
    return { error: parsedAddress.error.issues[0]?.message ?? "Invalid address." };
  }
  const resolvedAddress = parsedAddress.data.address;

  let record;
  try {
    record = await getPropertyRecord(resolvedAddress);
  } catch (error) {
    if (error instanceof RentCastApiError) {
      return { error: error.message, code: error.status === 429 ? "RATE_LIMITED" : "RENTCAST_ERROR" };
    }
    return { error: "Something went wrong looking up that property." };
  }
  if (!record) {
    return { error: "No property found for that address." };
  }

  // Quota is only spent once we know the address actually resolved — a typo
  // shouldn't cost the user one of their limited analyses. Admins bypass the
  // quota entirely, same as they bypass the subscription paywall.
  if (!isAdminEmail(user.email, env.ADMIN_EMAILS)) {
    const { data: creditRows, error: creditError } = await supabase.rpc("consume_analysis_credit", {
      p_user_id: user.id,
    });
    const credit = creditRows?.[0];
    if (creditError || !credit) {
      return { error: "Couldn't verify your analysis quota. Try again." };
    }
    if (!credit.allowed) {
      return {
        error:
          credit.plan === "free"
            ? "You've used all 3 free analyses. Upgrade to Starter or Investor for more."
            : "You've used all your analyses for this billing period. Buy 10 more, or upgrade your plan.",
        code: "QUOTA_EXCEEDED",
      };
    }
  }

  const hints = {
    propertyType: record.propertyType,
    bedrooms: record.bedrooms,
    bathrooms: record.bathrooms,
    squareFootage: record.squareFootage,
  };
  const [value, rent] = await Promise.all([
    getValueEstimate(resolvedAddress, hints).catch(() => null),
    getRentEstimate(resolvedAddress, hints).catch(() => null),
  ]);

  const property = normalizeRentCastData(resolvedAddress, record, value, rent);
  const investmentInputsForm = deriveDefaultInputs(property);
  const investmentInputs = toInvestmentInputs(investmentInputsForm);
  const calculatedResults = runAnalysis(investmentInputs);

  // Auto-generated once, right when the analysis is created — not on every
  // subsequent page view, since (unlike the client-side Monte Carlo) each
  // call costs real Anthropic API spend. A failure here shouldn't block
  // saving the analysis; the user can retry with "Regenerate" afterward.
  let aiRecommendation: AIRecommendation | null = null;
  if (hasAnthropicKey) {
    try {
      aiRecommendation = await generateRecommendation({
        property: {
          address: property.address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFootage: property.squareFootage,
          yearBuilt: property.yearBuilt,
        },
        investmentInputs: {
          purchasePrice: investmentInputs.purchasePrice,
          downPaymentPct: investmentInputs.downPaymentPct,
          interestRatePct: investmentInputs.interestRatePct,
          loanTermYears: investmentInputs.loanTermYears,
          monthlyRent: investmentInputs.monthlyRent,
          holdingPeriodYears: investmentInputs.holdingPeriodYears,
          appreciationPct: investmentInputs.appreciationPct,
          rentGrowthPct: investmentInputs.rentGrowthPct,
          vacancyPct: investmentInputs.vacancyPct,
        },
        analysisResult: {
          monthlyCashFlowYear1: calculatedResults.monthlyCashFlowYear1,
          capRate: calculatedResults.capRate,
          cashOnCash: calculatedResults.cashOnCash,
          irr: calculatedResults.irr,
          totalProfit: calculatedResults.totalProfit,
        },
      });
    } catch (error) {
      console.error("[createAnalysis] AI interpretation generation failed:", error);
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      label: property.address,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zipCode,
      latitude: property.latitude,
      longitude: property.longitude,
      // Domain types don't carry an index signature, so a structural cast
      // through `unknown` is required to store them in a jsonb column — see
      // lib/deals/mapRow.ts for the corresponding read-side cast.
      property_snapshot: property as unknown as Json,
      investment_inputs: investmentInputsForm as unknown as Json,
      calculated_results: calculatedResults as unknown as Json,
      simulation_summary: null,
      ai_recommendation: aiRecommendation as unknown as Json,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: insertError?.message ?? "Couldn't save this analysis." };
  }

  revalidatePath("/deals");
  return { dealId: inserted.id };
}

export type UpdateDealPatch = {
  investmentInputs?: InvestmentInputsFormValues;
  calculatedResults?: AnalysisResult;
  simulationSummary?: SimulationSummary | null;
  aiRecommendation?: AIRecommendation | null;
};

export type UpdateDealState = { error: string | null };

/**
 * Persists changes to an existing deal — used for (a) an explicit "Save
 * changes" after the user tweaks inputs, (b) silently auto-saving a fresh
 * Monte Carlo summary the moment a run completes, and (c) persisting a
 * "Regenerate" AI interpretation. All three are the same operation: write
 * whatever fields are provided, leave the rest untouched.
 */
export async function updateDeal(dealId: string, patch: UpdateDealPatch): Promise<UpdateDealState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  const update: Database["public"]["Tables"]["deals"]["Update"] = {};
  if (patch.investmentInputs !== undefined) update.investment_inputs = patch.investmentInputs as unknown as Json;
  if (patch.calculatedResults !== undefined) update.calculated_results = patch.calculatedResults as unknown as Json;
  if (patch.simulationSummary !== undefined) update.simulation_summary = patch.simulationSummary as unknown as Json;
  if (patch.aiRecommendation !== undefined) update.ai_recommendation = patch.aiRecommendation as unknown as Json;

  if (Object.keys(update).length === 0) {
    return { error: null };
  }

  const { error, count } = await supabase
    .from("deals")
    .update(update, { count: "exact" })
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }
  if (!count) {
    return { error: "That deal doesn't exist or you don't have access to it." };
  }

  revalidatePath(`/deals/${dealId}`);
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
