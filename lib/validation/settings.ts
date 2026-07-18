import { z } from "zod";

const PHONE_REGEX = /^\+?[0-9()\-.\s]{7,20}$/;

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required.").max(120, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid cell phone number.")
    .regex(PHONE_REGEX, "Enter a valid cell phone number."),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** Whole-number/decimal percents, matching how the investment inputs form works. */
export const defaultsSchema = z.object({
  appreciationPct: z.number().min(-20).max(30),
  vacancyPct: z.number().min(0).max(100),
  maintenancePct: z.number().min(0).max(100),
  closingCostPct: z.number().min(0).max(20),
  insurancePct: z.number().min(0).max(10),
});

export type DefaultsInput = z.infer<typeof defaultsSchema>;

export const feedbackSchema = z.object({
  category: z.enum(["bug", "feature", "other"]),
  message: z.string().trim().min(5, "Tell us a bit more.").max(2000, "Keep it under 2000 characters."),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
