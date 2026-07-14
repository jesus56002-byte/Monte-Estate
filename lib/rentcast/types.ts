/**
 * Raw RentCast API (https://www.rentcast.io/api) response shapes, as
 * documented. Fields are optional/nullable defensively since RentCast omits
 * fields it has no data for rather than returning explicit nulls.
 */

export interface RentCastPropertyRecord {
  id?: string;
  formattedAddress?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
}

export interface RentCastValueEstimate {
  price?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  latitude?: number;
  longitude?: number;
}

export interface RentCastRentEstimate {
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  latitude?: number;
  longitude?: number;
}

export class RentCastApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "RentCastApiError";
  }
}
