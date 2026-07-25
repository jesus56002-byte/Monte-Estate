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
import {
  investmentInputsFormSchema,
  toInvestmentInputs,
  type InvestmentInputsFormValues,
} from "@/lib/validation/investment";
import { runAnalysis } from "@/lib/finance/analysis";
import { generateRecommendation } from "@/lib/anthropic/recommendation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/supabase";
import type { AnalysisResult, InvestmentInputs } from "@/lib/finance/types";
import type { SimulationSummary } from "@/types/deal";
import type { PropertyData } from "@/types/property";
import type { AIRecommendation } from "@/lib/validation/ai";

export type CreateAnalysisResult = { dealId: string } | { error: string; code?: string };

/**
 * createAnalysis calls RentCast's property-record lookup before the quota
 * check (see the comment at that call site — a typo shouldn't cost a user
 * one of their limited analyses), which means that one lookup isn't bounded
 * by plan quota at all: a scripted loop hitting this action repeatedly would
 * generate real, billed RentCast calls with nothing in the quota system to
 * stop it. This cooldown is the actual guard against that — a real user
 * never resubmits a search this fast, so it costs legitimate use nothing
 * while capping a scripted loop to a fraction of its unthrottled rate.
 */
const PROPERTY_LOOKUP_COOLDOWN_MS = 3_000;
const lastPropertyLookupAt = new Map<string, number>();

/**
 * Shared quota gate for both entry points (address search and custom
 * scenario) — admins bypass it entirely, everyone else spends one credit
 * per analysis regardless of which path produced it. Returns null when the
 * caller is clear to proceed.
 */
async function consumeQuotaOrError(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<{ error: string; code?: string } | null> {
  if (isAdminEmail(user.email, env.ADMIN_EMAILS)) {
    return null;
  }

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
  return null;
}

/**
 * Auto-generated once, right when the analysis is created — not on every
 * subsequent page view, since (unlike the client-side Monte Carlo) each call
 * costs real Anthropic API spend. A failure here shouldn't block saving the
 * analysis; the user can retry with "Regenerate" afterward.
 */
async function buildAiRecommendation(
  property: PropertyData,
  investmentInputs: InvestmentInputs,
  calculatedResults: AnalysisResult
): Promise<AIRecommendation | null> {
  if (!hasAnthropicKey) return null;

  try {
    return await generateRecommendation({
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
    console.error("[analysis] AI interpretation generation failed:", error);
    return null;
  }
}

interface NewDealFields {
  label: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  propertySnapshot: PropertyData;
  investmentInputsForm: InvestmentInputsFormValues;
  calculatedResults: AnalysisResult;
  aiRecommendation: AIRecommendation | null;
}

/** Inserts the deal row, bumps the lifetime analyses stat (best-effort), and revalidates the deals list. */
async function saveNewDeal(
  supabase: SupabaseClient<Database>,
  userId: string,
  fields: NewDealFields
): Promise<CreateAnalysisResult> {
  const { data: inserted, error: insertError } = await supabase
    .from("deals")
    .insert({
      user_id: userId,
      label: fields.label,
      address: fields.address,
      city: fields.city,
      state: fields.state,
      zip: fields.zip,
      latitude: fields.latitude,
      longitude: fields.longitude,
      // Domain types don't carry an index signature, so a structural cast
      // through `unknown` is required to store them in a jsonb column — see
      // lib/deals/mapRow.ts for the corresponding read-side cast.
      property_snapshot: fields.propertySnapshot as unknown as Json,
      investment_inputs: fields.investmentInputsForm as unknown as Json,
      calculated_results: fields.calculatedResults as unknown as Json,
      simulation_summary: null,
      ai_recommendation: fields.aiRecommendation as unknown as Json,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: insertError?.message ?? "Couldn't save this analysis." };
  }

  // Decorative lifetime stat shown on Settings > About — best-effort, never
  // blocks saving the analysis itself.
  const { error: incrementError } = await supabase.rpc("increment_lifetime_analyses_count", {
    p_user_id: userId,
  });
  if (incrementError) {
    console.error("[analysis] failed to increment lifetime_analyses_count:", incrementError.message);
  }

  revalidatePath("/deals");
  return { dealId: inserted.id };
}

/**
 * The address-search entry point for "performing an analysis": looks up the
 * address, checks/consumes the caller's quota, runs the deterministic
 * calculation, generates an AI interpretation, and saves all of it as a deal
 * row immediately. There's no separate "preview" step and no unsaved-in-memory
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

  const lastLookupAt = lastPropertyLookupAt.get(user.id);
  if (lastLookupAt && Date.now() - lastLookupAt < PROPERTY_LOOKUP_COOLDOWN_MS) {
    return { error: "Give it a moment before searching again.", code: "RATE_LIMITED" };
  }
  lastPropertyLookupAt.set(user.id, Date.now());

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
  // shouldn't cost the user one of their limited analyses.
  const quotaError = await consumeQuotaOrError(supabase, user);
  if (quotaError) return quotaError;

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

  const { data: defaultsProfile } = await supabase
    .from("profiles")
    .select(
      "default_appreciation_pct, default_vacancy_pct, default_maintenance_pct, default_closing_cost_pct, default_insurance_pct"
    )
    .eq("id", user.id)
    .single();

  const property = normalizeRentCastData(resolvedAddress, record, value, rent);
  const investmentInputsForm = deriveDefaultInputs(property, {
    appreciationPct: defaultsProfile?.default_appreciation_pct,
    vacancyPct: defaultsProfile?.default_vacancy_pct,
    maintenancePct: defaultsProfile?.default_maintenance_pct,
    closingCostPct: defaultsProfile?.default_closing_cost_pct,
    insurancePct: defaultsProfile?.default_insurance_pct,
  });
  const investmentInputs = toInvestmentInputs(investmentInputsForm);
  const calculatedResults = runAnalysis(investmentInputs);
  const aiRecommendation = await buildAiRecommendation(property, investmentInputs, calculatedResults);

  return saveNewDeal(supabase, user.id, {
    label: property.address,
    address: property.address,
    city: property.city,
    state: property.state,
    zip: property.zipCode,
    latitude: property.latitude,
    longitude: property.longitude,
    propertySnapshot: property,
    investmentInputsForm,
    calculatedResults,
    aiRecommendation,
  });
}

/**
 * The custom-scenario entry point: no address, no RentCast lookup — every
 * investment assumption comes straight from the user. Otherwise identical
 * to createAnalysis (same quota, same AI interpretation, same save path),
 * so a custom scenario behaves exactly like any other saved deal. Deals
 * left unnamed get "Custom Deal N", numbered per-user via an atomic
 * counter on the profile so concurrent creates can't collide.
 */
export async function createCustomAnalysis(
  formValues: InvestmentInputsFormValues,
  name: string | undefined
): Promise<CreateAnalysisResult> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { error: "You must be signed in to run an analysis." };
  }

  const parsed = investmentInputsFormSchema.safeParse(formValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const quotaError = await consumeQuotaOrError(supabase, user);
  if (quotaError) return quotaError;

  let dealName = name?.trim();
  if (!dealName) {
    const { data: nextNumber, error: counterError } = await supabase.rpc("increment_custom_deal_counter", {
      p_user_id: user.id,
    });
    if (counterError || nextNumber == null) {
      return { error: "Couldn't generate a name for this deal. Try again." };
    }
    dealName = `Custom Deal ${nextNumber}`;
  }

  const investmentInputsForm = parsed.data;
  const investmentInputs = toInvestmentInputs(investmentInputsForm);
  const calculatedResults = runAnalysis(investmentInputs);

  const property: PropertyData = {
    address: dealName,
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
    hoaFeeMonthly: investmentInputsForm.hoaMonthly,
    estimatedValue: investmentInputsForm.purchasePrice,
    estimatedValueRangeLow: null,
    estimatedValueRangeHigh: null,
    estimatedRent: investmentInputsForm.monthlyRent,
    estimatedRentRangeLow: null,
    estimatedRentRangeHigh: null,
    source: "custom",
    fetchedAt: new Date().toISOString(),
  };

  const aiRecommendation = await buildAiRecommendation(property, investmentInputs, calculatedResults);

  return saveNewDeal(supabase, user.id, {
    label: dealName,
    address: "Custom scenario",
    city: null,
    state: null,
    zip: null,
    latitude: null,
    longitude: null,
    propertySnapshot: property,
    investmentInputsForm,
    calculatedResults,
    aiRecommendation,
  });
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
