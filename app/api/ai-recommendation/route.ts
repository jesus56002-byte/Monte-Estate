import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { hasAnthropicKey, hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { aiRecommendationRequestSchema } from "@/lib/validation/ai";
import { generateRecommendation } from "@/lib/anthropic/recommendation";

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

  if (!hasSupabaseConfig) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Sign in to request a recommendation." }, { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Sign in to request a recommendation." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = aiRecommendationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const recommendation = await generateRecommendation(parsed.data);
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
