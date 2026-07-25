import "server-only";
import { env } from "@/lib/env";

export class GooglePlacesApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "GooglePlacesApiError";
  }
}

export type AddressSuggestion = {
  /** Full formatted prediction text — used directly as the address value, no Place Details lookup needed. */
  text: string;
  placeId: string;
};

type AutocompleteApiResponse = {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text?: { text?: string };
    };
  }[];
};

/**
 * Address suggestions for the search bar's typeahead, via the (New) Places
 * API's autocomplete endpoint. Deliberately stops here — no Place Details
 * call, since the prediction's own formatted text is all this app needs
 * (RentCast resolves the final address the same way a manually-typed one
 * would). That keeps this to one billed request per session instead of two.
 */
export async function getAddressSuggestions(
  input: string,
  sessionToken: string
): Promise<AddressSuggestion[]> {
  if (!env.GOOGLE_PLACES_API_KEY) {
    throw new GooglePlacesApiError("Google Places API key is not configured.", 503);
  }

  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["us"],
      includedPrimaryTypes: ["street_address", "premise", "subpremise"],
    }),
  });

  if (res.status === 429) {
    throw new GooglePlacesApiError("Google Places rate limit exceeded. Try again shortly.", 429);
  }
  if (!res.ok) {
    throw new GooglePlacesApiError(`Google Places request failed (${res.status}).`, 502);
  }

  const data = (await res.json()) as AutocompleteApiResponse;

  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.text?.text))
    .map((p) => ({ text: p.text!.text!, placeId: p.placeId }));
}
