import "server-only";
import { env, hasSupabaseConfig } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  RentCastApiError,
  type RentCastPropertyRecord,
  type RentCastRentEstimate,
  type RentCastValueEstimate,
} from "@/lib/rentcast/types";

/**
 * Durable log of outbound RentCast calls, for the admin dashboard's
 * "requests this month" stat — the in-memory `requestCount` below resets on
 * every deploy/cold start, so it can't answer that. Fire-and-forget: a
 * logging failure should never break an actual property lookup.
 */
function logRentCastRequest(): void {
  if (!hasSupabaseConfig) return;
  createAdminClient()
    .from("rentcast_request_log")
    .insert({})
    .then(({ error }) => {
      if (error) console.error("[RentCast] failed to log request:", error.message);
    });
}

const BASE_URL = "https://api.rentcast.io/v1";

/**
 * No request cap here — RentCast's own plan handles overage (billed
 * per-call past the plan's included quota, not a hard block), and the real
 * guard against a scripted loop running up calls is the per-user cooldown
 * in createAnalysis (app/(app)/deals/actions.ts), applied before any of
 * these functions are ever called. Every call is still durably logged below
 * for the admin dashboard's actual-usage stat, which is the right place to
 * watch real volume/cost rather than an arbitrary in-process counter.
 */
async function rentcastGet<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  if (!env.RENTCAST_API_KEY) {
    throw new RentCastApiError("RentCast API key is not configured.", 503);
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Api-Key": env.RENTCAST_API_KEY,
    },
    // Property/valuation data doesn't need to be re-fetched on every request;
    // a short cache keeps repeated lookups of the same address cheap.
    next: { revalidate: 3600 },
  });

  logRentCastRequest();

  if (res.status === 404) {
    throw new RentCastApiError("No property found for that address.", 404);
  }
  if (res.status === 429) {
    throw new RentCastApiError("RentCast rate limit exceeded. Try again shortly.", 429);
  }
  if (!res.ok) {
    throw new RentCastApiError(`RentCast request failed (${res.status}).`, 502);
  }

  return res.json() as Promise<T>;
}

/** Property characteristics (beds/baths/sqft/type/year built) for an address. */
export async function getPropertyRecord(address: string): Promise<RentCastPropertyRecord | null> {
  const records = await rentcastGet<RentCastPropertyRecord[]>("/properties", {
    address,
    limit: 1,
  });
  return records?.[0] ?? null;
}

/** Automated valuation model estimate for the property's market value. */
export async function getValueEstimate(
  address: string,
  hints: { propertyType?: string; bedrooms?: number; bathrooms?: number; squareFootage?: number } = {}
): Promise<RentCastValueEstimate | null> {
  try {
    return await rentcastGet<RentCastValueEstimate>("/avm/value", {
      address,
      propertyType: hints.propertyType,
      bedrooms: hints.bedrooms,
      bathrooms: hints.bathrooms,
      squareFootage: hints.squareFootage,
    });
  } catch (error) {
    if (error instanceof RentCastApiError && error.status === 404) return null;
    throw error;
  }
}

/** Automated valuation model estimate for long-term rent. */
export async function getRentEstimate(
  address: string,
  hints: { propertyType?: string; bedrooms?: number; bathrooms?: number; squareFootage?: number } = {}
): Promise<RentCastRentEstimate | null> {
  try {
    return await rentcastGet<RentCastRentEstimate>("/avm/rent/long-term", {
      address,
      propertyType: hints.propertyType,
      bedrooms: hints.bedrooms,
      bathrooms: hints.bathrooms,
      squareFootage: hints.squareFootage,
    });
  } catch (error) {
    if (error instanceof RentCastApiError && error.status === 404) return null;
    throw error;
  }
}
