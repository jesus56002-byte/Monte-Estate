import { describe, expect, it } from "vitest";
import { hasActiveAccess } from "./subscription";

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
