import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const PHONE_REGEX = /^\+?[0-9()\-.\s]{7,20}$/;

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    // Optional at signup — reduces friction for new accounts. Still
    // available to add later in Settings (lib/validation/settings.ts's
    // profileSchema), same optional treatment there.
    phone: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined)
      .refine((value) => !value || PHONE_REGEX.test(value), { message: "Enter a valid cell phone number." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
