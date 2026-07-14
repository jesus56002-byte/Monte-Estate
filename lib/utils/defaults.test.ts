import { describe, expect, it } from "vitest";
import { deriveDefaultInputs } from "./defaults";
import type { PropertyData } from "@/types/property";

function baseProperty(overrides: Partial<PropertyData> = {}): PropertyData {
  return {
    address: "5500 Grand Lake Dr, San Antonio, TX 78244",
    city: "San Antonio",
    state: "TX",
    zipCode: "78244",
    latitude: null,
    longitude: null,
    propertyType: "Single Family",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1878,
    yearBuilt: 1973,
    lotSize: 8843,
    hoaFeeMonthly: null,
    estimatedValue: 238_000,
    estimatedValueRangeLow: 195_000,
    estimatedValueRangeHigh: 280_000,
    estimatedRent: 1_630,
    estimatedRentRangeLow: 1_530,
    estimatedRentRangeHigh: 1_730,
    source: "rentcast",
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("deriveDefaultInputs", () => {
  it("pre-fills HOA from the property's RentCast HOA fee when present", () => {
    const inputs = deriveDefaultInputs(baseProperty({ hoaFeeMonthly: 175 }));
    expect(inputs.hoaMonthly).toBe(175);
  });

  it("defaults HOA to 0 when RentCast has no HOA data for the property", () => {
    const inputs = deriveDefaultInputs(baseProperty({ hoaFeeMonthly: null }));
    expect(inputs.hoaMonthly).toBe(0);
  });
});
