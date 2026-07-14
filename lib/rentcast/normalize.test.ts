import { describe, expect, it } from "vitest";
import { normalizeRentCastData } from "./normalize";

describe("normalizeRentCastData", () => {
  it("maps the HOA fee from the property record to hoaFeeMonthly", () => {
    const property = normalizeRentCastData(
      "5500 Grand Lake Dr, San Antonio, TX 78244",
      { formattedAddress: "5500 Grand Lake Dr, San Antonio, TX 78244", hoa: { fee: 175 } },
      null,
      null
    );
    expect(property.hoaFeeMonthly).toBe(175);
  });

  it("is null when the record has no HOA data", () => {
    const property = normalizeRentCastData("123 Main St", { formattedAddress: "123 Main St" }, null, null);
    expect(property.hoaFeeMonthly).toBeNull();
  });

  it("is null when there is no property record at all", () => {
    const property = normalizeRentCastData("123 Main St", null, null, null);
    expect(property.hoaFeeMonthly).toBeNull();
  });
});
