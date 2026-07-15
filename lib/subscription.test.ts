import { describe, expect, it } from "vitest";
import { isAdminEmail } from "./subscription";

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
