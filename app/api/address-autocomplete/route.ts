import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { hasGooglePlacesKey, hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { addressAutocompleteRequestSchema } from "@/lib/validation/property";
import { getAddressSuggestions, GooglePlacesApiError } from "@/lib/google-places/client";

/** Falls back to IP for the anonymous "search first" flow — see resolveRateLimitKey below. */
async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

/**
 * Reachable by anonymous visitors now too (the "search first, sign up
 * second" flow — app/search/page.tsx), so the rate-limit key falls back to
 * IP when there's no signed-in user rather than requiring auth outright.
 */
async function resolveRateLimitKey(): Promise<string> {
  if (hasSupabaseConfig) {
    const { user } = await getAuthedUser();
    if (user) return user.id;
  }
  return getClientIp();
}

/**
 * Two independent in-memory guards, both best-effort (reset on cold start,
 * same tradeoff as the RentCast/AI-recommendation limiters elsewhere):
 *  - a floor between individual keystroke requests, since Google bills
 *    per-session but a flood of requests within one session still costs
 *    real server time and could mask a client that skipped debouncing;
 *  - a cap on *new* sessions per user, since a new session token is what
 *    actually starts a new billed unit on Google's side — this is the one
 *    that matters for cost, not the per-keystroke floor above it.
 */
const MIN_REQUEST_INTERVAL_MS = 120;
const MAX_NEW_SESSIONS_PER_WINDOW = 20;
const SESSION_WINDOW_MS = 60_000;

const lastRequestAt = new Map<string, number>();
const sessionWindowByUser = new Map<string, { seen: Set<string>; windowStart: number }>();

function isNewSessionAllowed(rateLimitKey: string, sessionToken: string): boolean {
  const now = Date.now();
  const entry = sessionWindowByUser.get(rateLimitKey);

  if (!entry || now - entry.windowStart > SESSION_WINDOW_MS) {
    sessionWindowByUser.set(rateLimitKey, { seen: new Set([sessionToken]), windowStart: now });
    return true;
  }
  if (entry.seen.has(sessionToken)) return true;
  if (entry.seen.size >= MAX_NEW_SESSIONS_PER_WINDOW) return false;
  entry.seen.add(sessionToken);
  return true;
}

export async function POST(request: Request) {
  if (!hasGooglePlacesKey) {
    return NextResponse.json(
      {
        error: "GOOGLE_PLACES_NOT_CONFIGURED",
        message: "Address suggestions aren't configured yet. Set GOOGLE_PLACES_API_KEY to enable them.",
      },
      { status: 503 }
    );
  }

  const rateLimitKey = await resolveRateLimitKey();

  const body = await request.json().catch(() => null);
  const parsed = addressAutocompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }
  const { input, sessionToken } = parsed.data;

  const lastAt = lastRequestAt.get(rateLimitKey);
  if (lastAt && Date.now() - lastAt < MIN_REQUEST_INTERVAL_MS) {
    return NextResponse.json({ suggestions: [] });
  }
  lastRequestAt.set(rateLimitKey, Date.now());

  if (!isNewSessionAllowed(rateLimitKey, sessionToken)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many searches right now. Try again in a moment." },
      { status: 429 }
    );
  }

  try {
    const suggestions = await getAddressSuggestions(input, sessionToken);
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof GooglePlacesApiError) {
      return NextResponse.json({ error: "PLACES_ERROR", message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", message: "Something went wrong fetching suggestions." },
      { status: 502 }
    );
  }
}
