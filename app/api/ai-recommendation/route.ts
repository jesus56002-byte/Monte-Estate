import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { hasAnthropicKey } from "@/lib/env";
import { requireApiUser } from "@/lib/api/requireApiUser";
import { createClient } from "@/lib/supabase/server";
import { regenerateRecommendationRequestSchema } from "@/lib/validation/ai";
import { generateRecommendation } from "@/lib/anthropic/recommendation";

/**
 * Best-effort in-memory cooldown, keyed by user id — resets on cold start,
 * same tradeoff as the RentCast request counter. This isn't primarily about
 * a human clicking "Regenerate" twice; it's a floor against a scripted loop
 * hitting this route directly and running up Anthropic spend with no cap.
 */
const COOLDOWN_MS = 5_000;
const lastRequestAt = new Map<string, number>();

export async function POST(request: Request) {
  if (!hasAnthropicKey) {
    return NextResponse.json(
      {
        error: "ANTHROPIC_API_KEY_MISSING",
        message: "AI recommendations aren't configured yet. Set ANTHROPIC_API_KEY to enable them.",
      },
      { status: 503 }
    );
  }

  const gate = await requireApiUser();
  if (gate.response) return gate.response;
  const { user } = gate;

  const lastAt = lastRequestAt.get(user.id);
  if (lastAt && Date.now() - lastAt < COOLDOWN_MS) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Give it a moment before regenerating again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = regenerateRecommendationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }
  const { dealId, ...recommendationInput } = parsed.data;

  // Require a real, owned deal rather than trusting whatever numbers the
  // client sends — otherwise this endpoint is just "call Claude with
  // arbitrary data," unbounded by anything the rest of the app enforces.
  const supabase = await createClient();
  const { data: deal } = await supabase.from("deals").select("id").eq("id", dealId).eq("user_id", user.id).single();
  if (!deal) {
    return NextResponse.json(
      { error: "DEAL_NOT_FOUND", message: "That deal doesn't exist or you don't have access to it." },
      { status: 404 }
    );
  }

  lastRequestAt.set(user.id, Date.now());

  try {
    const recommendation = await generateRecommendation(recommendationInput);
    return NextResponse.json({ recommendation });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "Too many requests right now. Try again shortly." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "ANTHROPIC_ERROR", message: "The AI recommendation service returned an error." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", message: "Something went wrong generating a recommendation." },
      { status: 502 }
    );
  }
}
