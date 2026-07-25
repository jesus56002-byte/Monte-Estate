import { z } from "zod";

export const addressSearchSchema = z.object({
  address: z
    .string()
    .trim()
    .min(5, "Enter a full street address, e.g. 123 Main St, Austin, TX 78701."),
});

export type AddressSearchInput = z.infer<typeof addressSearchSchema>;

export const addressAutocompleteRequestSchema = z.object({
  input: z.string().trim().min(3).max(200),
  sessionToken: z.string().uuid(),
});

export type AddressAutocompleteRequest = z.infer<typeof addressAutocompleteRequestSchema>;
