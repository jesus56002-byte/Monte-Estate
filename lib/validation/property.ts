import { z } from "zod";

export const addressSearchSchema = z.object({
  address: z
    .string()
    .trim()
    .min(5, "Enter a full street address, e.g. 123 Main St, Austin, TX 78701."),
});

export type AddressSearchInput = z.infer<typeof addressSearchSchema>;
