import { describe, expect, it } from "vitest";
import { hasActiveAccess, isAdminEmail } from "./subscription";

describe("hasActiveAccess", () => {
  it("grants access for an active subscription", () => {
    expect(hasActiveAccess("active")).toBe(true);
  });

  it("grants access during a trial", () => {
    expect(hasActiveAccess("trialing")).toBe(true);
  });

  it.each(["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused"])(
    "denies access for status %s",
    (status) => {
      expect(hasActiveAccess(status)).toBe(false);
    }
  );

  it("denies access when there's no subscription at all", () => {
    expect(hasActiveAccess(null)).toBe(false);
  });
});

describe("isAdminEmail", () => {
  it("matches an email in the comma-separated list", () => {
    expect(isAdminEmail("owner@example.com", "owner@example.com,other@example.com")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAdminEmail("Owner@Example.com", "owner@example.com")).toBe(true);
  });

  it("ignores whitespace around list entries", () => {
    expect(isAdminEmail("owner@example.com", " owner@example.com , other@example.com ")).toBe(true);
  });

  it("denies an email not in the list", () => {
    expect(isAdminEmail("stranger@example.com", "owner@example.com")).toBe(false);
  });

  it("denies when there's no email", () => {
    expect(isAdminEmail(null, "owner@example.com")).toBe(false);
  });

  it("denies when ADMIN_EMAILS isn't configured", () => {
    expect(isAdminEmail("owner@example.com", undefined)).toBe(false);
  });
});
