import { afterEach, describe, expect, it, vi } from "vitest";

const ALL_KEYS = [
  "RENTCAST_API_KEY",
  "GOOGLE_PLACES_API_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_INVESTOR",
  "STRIPE_PRICE_TOPUP",
  "STRIPE_PRICE_PAYG",
  "ADMIN_EMAILS",
  "PUBLIC_ACCESS_ENABLED",
  "NEXT_PUBLIC_APP_URL",
] as const;

// lib/env.ts validates process.env at import time, so each scenario needs a
// fresh module instance. Every key is stubbed explicitly (defaulting to "",
// simulating a blank line in .env.local) so a real .env.local loaded into
// process.env by the test runner can't leak into — or fail — these cases.
async function loadEnvWith(overrides: Partial<Record<(typeof ALL_KEYS)[number], string>>) {
  vi.resetModules();
  for (const key of ALL_KEYS) {
    vi.stubEnv(key, overrides[key] ?? "");
  }
  return import("./env");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("boots with every optional key genuinely unset", async () => {
    const { hasRentCastKey, hasGooglePlacesKey, hasAnthropicKey, hasSupabaseConfig } = await loadEnvWith({});
    expect(hasRentCastKey).toBe(false);
    expect(hasGooglePlacesKey).toBe(false);
    expect(hasAnthropicKey).toBe(false);
    expect(hasSupabaseConfig).toBe(false);
  });

  it("treats a blank .env.local value (empty string) as unset, not invalid", async () => {
    // This is exactly what `ANTHROPIC_API_KEY=` on its own line in .env.local
    // parses to — "", not undefined. Regression test: this used to throw at
    // import time ("Too small: expected string to have >=1 characters").
    const { hasAnthropicKey, hasRentCastKey, env } = await loadEnvWith({});
    expect(hasAnthropicKey).toBe(false);
    expect(hasRentCastKey).toBe(false);
    expect(env.ANTHROPIC_MODEL).toBe("claude-sonnet-5");
  });

  it("reports keys as configured once real values are set", async () => {
    const { hasRentCastKey, hasGooglePlacesKey, hasAnthropicKey, hasSupabaseConfig } = await loadEnvWith({
      RENTCAST_API_KEY: "rc_test_key",
      GOOGLE_PLACES_API_KEY: "gp_test_key",
      ANTHROPIC_API_KEY: "sk-ant-test",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-test-key",
    });
    expect(hasRentCastKey).toBe(true);
    expect(hasGooglePlacesKey).toBe(true);
    expect(hasAnthropicKey).toBe(true);
    expect(hasSupabaseConfig).toBe(true);
  });

  it("requires all four Stripe prices before hasStripeConfig is true", async () => {
    const { hasStripeConfig: withOnlyTwo } = await loadEnvWith({
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_PRICE_STARTER: "price_starter",
      STRIPE_PRICE_INVESTOR: "price_investor",
    });
    expect(withOnlyTwo).toBe(false);

    const { hasStripeConfig: withThree } = await loadEnvWith({
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_PRICE_STARTER: "price_starter",
      STRIPE_PRICE_INVESTOR: "price_investor",
      STRIPE_PRICE_TOPUP: "price_topup",
    });
    expect(withThree).toBe(false);

    const { hasStripeConfig: withAllFour } = await loadEnvWith({
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_PRICE_STARTER: "price_starter",
      STRIPE_PRICE_INVESTOR: "price_investor",
      STRIPE_PRICE_TOPUP: "price_topup",
      STRIPE_PRICE_PAYG: "price_payg",
    });
    expect(withAllFour).toBe(true);
  });

  it("still throws for a genuinely malformed value", async () => {
    await expect(
      loadEnvWith({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })
    ).rejects.toThrow(/Invalid environment variables/);
  });

  it("defaults public access to open when PUBLIC_ACCESS_ENABLED is unset", async () => {
    const { publicAccessEnabled } = await loadEnvWith({});
    expect(publicAccessEnabled).toBe(true);
  });

  it("locks public access when PUBLIC_ACCESS_ENABLED is the string \"false\"", async () => {
    // Regression guard: z.coerce.boolean() would make this true, since
    // Boolean("false") is true in JS. publicAccessEnabled must compare the
    // raw string, not coerce it.
    const { publicAccessEnabled } = await loadEnvWith({ PUBLIC_ACCESS_ENABLED: "false" });
    expect(publicAccessEnabled).toBe(false);
  });
});
