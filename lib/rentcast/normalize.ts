import type { PropertyData } from "@/types/property";
import type {
  RentCastPropertyRecord,
  RentCastRentEstimate,
  RentCastValueEstimate,
} from "@/lib/rentcast/types";

export function normalizeRentCastData(
  requestedAddress: string,
  record: RentCastPropertyRecord | null,
  value: RentCastValueEstimate | null,
  rent: RentCastRentEstimate | null
): PropertyData {
  return {
    address: record?.formattedAddress ?? record?.addressLine1 ?? requestedAddress,
    city: record?.city ?? null,
    state: record?.state ?? null,
    zipCode: record?.zipCode ?? null,
    latitude: record?.latitude ?? value?.latitude ?? rent?.latitude ?? null,
    longitude: record?.longitude ?? value?.longitude ?? rent?.longitude ?? null,

    propertyType: record?.propertyType ?? null,
    bedrooms: record?.bedrooms ?? null,
    bathrooms: record?.bathrooms ?? null,
    squareFootage: record?.squareFootage ?? null,
    yearBuilt: record?.yearBuilt ?? null,
    lotSize: record?.lotSize ?? null,
    hoaFeeMonthly: record?.hoa?.fee ?? null,

    estimatedValue: value?.price ?? null,
    estimatedValueRangeLow: value?.priceRangeLow ?? null,
    estimatedValueRangeHigh: value?.priceRangeHigh ?? null,

    estimatedRent: rent?.rent ?? null,
    estimatedRentRangeLow: rent?.rentRangeLow ?? null,
    estimatedRentRangeHigh: rent?.rentRangeHigh ?? null,

    source: "rentcast",
    fetchedAt: new Date().toISOString(),
  };
}
