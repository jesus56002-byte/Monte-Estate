import { z } from "zod";

const envSchema = z.object({
  RENTCAST_API_KEY: z.string().min(1).optional(),
  RENTCAST_MAX_REQUESTS: z.coerce.number().int().positive().default(50),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-5"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_STARTER: z.string().min(1).optional(),
  STRIPE_PRICE_INVESTOR: z.string().min(1).optional(),
  STRIPE_PRICE_TOPUP: z.string().min(1).optional(),
  ADMIN_EMAILS: z.string().min(1).optional(),
  // Deliberately a raw string, not z.coerce.boolean() — Boolean("false") is
  // true in JS, which would make "PUBLIC_ACCESS_ENABLED=false" turn access
  // back ON. Compared explicitly below instead.
  PUBLIC_ACCESS_ENABLED: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

// `.env.local` lines like `ANTHROPIC_API_KEY=` parse to "" (not undefined), and
// zod's `.optional()`/`.default()` only treat `undefined` as "not set" — an
// empty string still fails `.min(1)`. Normalize blanks to undefined here so a
// key left empty in .env.local is treated as unconfigured, not invalid.
function emptyToUndefined(value: string | undefined): string | undefined {
  return value === "" ? undefined : value;
}

const parsed = envSchema.safeParse({
  RENTCAST_API_KEY: emptyToUndefined(process.env.RENTCAST_API_KEY),
  RENTCAST_MAX_REQUESTS: emptyToUndefined(process.env.RENTCAST_MAX_REQUESTS),
  ANTHROPIC_API_KEY: emptyToUndefined(process.env.ANTHROPIC_API_KEY),
  ANTHROPIC_MODEL: emptyToUndefined(process.env.ANTHROPIC_MODEL),
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
  STRIPE_SECRET_KEY: emptyToUndefined(process.env.STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: emptyToUndefined(process.env.STRIPE_WEBHOOK_SECRET),
  STRIPE_PRICE_STARTER: emptyToUndefined(process.env.STRIPE_PRICE_STARTER),
  STRIPE_PRICE_INVESTOR: emptyToUndefined(process.env.STRIPE_PRICE_INVESTOR),
  STRIPE_PRICE_TOPUP: emptyToUndefined(process.env.STRIPE_PRICE_TOPUP),
  ADMIN_EMAILS: emptyToUndefined(process.env.ADMIN_EMAILS),
  PUBLIC_ACCESS_ENABLED: emptyToUndefined(process.env.PUBLIC_ACCESS_ENABLED),
  NEXT_PUBLIC_APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;

export const hasRentCastKey = Boolean(env.RENTCAST_API_KEY);
export const hasAnthropicKey = Boolean(env.ANTHROPIC_API_KEY);
export const hasSupabaseConfig = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export const hasStripeConfig = Boolean(
  env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_STARTER && env.STRIPE_PRICE_INVESTOR && env.STRIPE_PRICE_TOPUP
);
/** Defaults to open; set PUBLIC_ACCESS_ENABLED=false to lock signups/checkout to admins only. */
export const publicAccessEnabled = env.PUBLIC_ACCESS_ENABLED !== "false";
