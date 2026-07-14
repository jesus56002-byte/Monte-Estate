import { NextResponse } from "next/server";
import { hasRentCastKey } from "@/lib/env";
import { requireApiUser } from "@/lib/api/requireApiUser";
import { addressSearchSchema } from "@/lib/validation/property";
import { getPropertyRecord, getRentEstimate, getValueEstimate } from "@/lib/rentcast/client";
import { RentCastApiError } from "@/lib/rentcast/types";
import { normalizeRentCastData } from "@/lib/rentcast/normalize";

export async function POST(request: Request) {
  if (!hasRentCastKey) {
    return NextResponse.json(
      {
        error: "RENTCAST_API_KEY_MISSING",
        message: "Property lookup isn't configured yet. Set RENTCAST_API_KEY to enable it.",
      },
      { status: 503 }
    );
  }

  const gate = await requireApiUser();
  if (gate.response) return gate.response;

  const body = await request.json().catch(() => null);
  const parsed = addressSearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_ADDRESS", message: parsed.error.issues[0]?.message ?? "Invalid address." },
      { status: 400 }
    );
  }

  const { address } = parsed.data;

  try {
    const record = await getPropertyRecord(address);
    if (!record) {
      return NextResponse.json(
        { error: "PROPERTY_NOT_FOUND", message: "No property found for that address." },
        { status: 404 }
      );
    }

    const hints = {
      propertyType: record.propertyType,
      bedrooms: record.bedrooms,
      bathrooms: record.bathrooms,
      squareFootage: record.squareFootage,
    };

    const [value, rent] = await Promise.all([
      getValueEstimate(address, hints),
      getRentEstimate(address, hints),
    ]);

    const property = normalizeRentCastData(address, record, value, rent);
    return NextResponse.json({ property });
  } catch (error) {
    if (error instanceof RentCastApiError) {
      return NextResponse.json(
        { error: "RENTCAST_ERROR", message: error.message },
        { status: error.status === 404 ? 404 : error.status === 429 ? 429 : 502 }
      );
    }
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", message: "Something went wrong looking up that property." },
      { status: 502 }
    );
  }
}
