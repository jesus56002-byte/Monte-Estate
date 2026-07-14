/** Normalized property data, regardless of which upstream data source produced it. */
export interface PropertyData {
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;

  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  yearBuilt: number | null;
  lotSize: number | null;

  estimatedValue: number | null;
  estimatedValueRangeLow: number | null;
  estimatedValueRangeHigh: number | null;

  estimatedRent: number | null;
  estimatedRentRangeLow: number | null;
  estimatedRentRangeHigh: number | null;

  source: "rentcast";
  fetchedAt: string;
}
