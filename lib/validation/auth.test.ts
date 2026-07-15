import { describe, expect, it } from "vitest";
import { signupSchema } from "./auth";

function baseInput(overrides: Partial<Record<string, string>> = {}) {
  return {
    email: "owner@example.com",
    password: "password123",
    confirmPassword: "password123",
    phone: "+1 512-555-0100",
    ...overrides,
  };
}

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(baseInput()).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse(baseInput({ confirmPassword: "somethingElse123" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a missing phone number", () => {
    expect(signupSchema.safeParse(baseInput({ phone: "" })).success).toBe(false);
  });

  it("rejects a phone number with letters", () => {
    expect(signupSchema.safeParse(baseInput({ phone: "call-me-maybe" })).success).toBe(false);
  });

  it("accepts phone numbers in a few common formats", () => {
    for (const phone of ["5125550100", "(512) 555-0100", "512-555-0100", "+15125550100"]) {
      expect(signupSchema.safeParse(baseInput({ phone })).success).toBe(true);
    }
  });

  it("rejects a password under 8 characters", () => {
    expect(signupSchema.safeParse(baseInput({ password: "short", confirmPassword: "short" })).success).toBe(false);
  });
});
