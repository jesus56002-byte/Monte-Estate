"use server";

import { cookies, headers } from "next/headers";
import { hasRentCastKey } from "@/lib/env";
import { addressSearchSchema } from "@/lib/validation/property";
import { getPropertyRecord, getRentEstimate, getValueEstimate } from "@/lib/rentcast/client";
import { RentCastApiError } from "@/lib/rentcast/types";
import { normalizeRentCastData } from "@/lib/rentcast/normalize";
import { PENDING_ADDRESS_COOKIE } from "@/lib/pendingAddress";
import type { PropertyData } from "@/types/property";

export type PreviewPropertyResult = { property: PropertyData } | { error: string; code?: string };

/**
 * Long enough to survive a slow signup (reading Terms, fumbling a password,
 * an OAuth redirect round-trip), short enough that it can't resurrect an
 * old address on some unrelated future visit if it's ever left uncleared.
 */
const PENDING_ADDRESS_MAX_AGE_SECONDS = 15 * 60;

/**
 * Cooldown + a rolling daily cap, both keyed by IP — this endpoint is
 * reachable with no account at all, so unlike createAnalysis's per-user
 * cooldown (app/(app)/deals/actions.ts) there's no login wall stopping a
 * script from hitting it in a loop and running up real RentCast billing.
 * Same in-memory-Map caveat as that cooldown: resets on cold start and isn't
 * shared across serverless instances, so treat this as a speed bump, not a
 * hard guarantee.
 */
const PREVIEW_COOLDOWN_MS = 3_000;
const PREVIEW_DAILY_LIMIT = 15;
const DAY_MS = 24 * 60 * 60 * 1000;
const lastPreviewAt = new Map<string, number>();
const previewCountByDay = new Map<string, { count: number; windowStart: number }>();

async function resolveClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

/**
 * Free, no-signup-required property lookup for the anonymous "search first"
 * flow (app/search/page.tsx) — property facts and value/rent estimates
 * only, no financing assumptions, no quota, no saved deal. The full
 * analysis (Monte Carlo + AI + save) still requires an account and still
 * goes through createAnalysis's quota gate.
 */
export async function previewProperty(address: string): Promise<PreviewPropertyResult> {
  if (!hasRentCastKey) {
    return { error: "Property lookup isn't configured yet. Set RENTCAST_API_KEY to enable it." };
  }

  const parsed = addressSearchSchema.safeParse({ address });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }
  const resolvedAddress = parsed.data.address;

  const ip = await resolveClientIp();

  const lastAt = lastPreviewAt.get(ip);
  if (lastAt && Date.now() - lastAt < PREVIEW_COOLDOWN_MS) {
    return { error: "Give it a moment before searching again.", code: "RATE_LIMITED" };
  }

  const dayEntry = previewCountByDay.get(ip);
  const now = Date.now();
  if (dayEntry && now - dayEntry.windowStart < DAY_MS) {
    if (dayEntry.count >= PREVIEW_DAILY_LIMIT) {
      return {
        error: "You've reached the limit for free previews today. Create an account to keep going.",
        code: "RATE_LIMITED",
      };
    }
    dayEntry.count += 1;
  } else {
    previewCountByDay.set(ip, { count: 1, windowStart: now });
  }
  lastPreviewAt.set(ip, now);

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

  return { property: normalizeRentCastData(resolvedAddress, record, value, rent) };
}

/**
 * Stashes the address an anonymous visitor was previewing so it survives
 * the trip through signup (or an OAuth provider round-trip) — read back by
 * app/search/page.tsx once the user is authenticated, to auto-run the real
 * analysis without making them re-enter anything.
 */
export async function stashPendingAddress(address: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_ADDRESS_COOKIE, address, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: PENDING_ADDRESS_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearPendingAddress(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_ADDRESS_COOKIE);
}
