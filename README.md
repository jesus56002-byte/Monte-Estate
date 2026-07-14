# Monte Estate

Property search and investment analysis tool. Enter an address, tune financing
assumptions, and see cash flow, cap rate, cash-on-cash return, IRR, and a
10,000-run Monte Carlo simulation of best/median/worst case outcomes, plus an
AI-generated investment recommendation.

## Features

- **Property search** — enter an address, auto-populate beds/baths/sqft/year
  built/estimated value/estimated rent from RentCast.
- **Investment inputs** — purchase price, down payment, interest rate, loan
  term, closing costs, taxes, insurance, HOA, maintenance/vacancy/management
  %, appreciation, rent growth, holding period, and selling costs, pre-filled
  from the fetched property and editable live.
- **Results** — monthly cash flow, cap rate, cash-on-cash return, IRR, and
  total profit after the selected holding period, recomputed instantly as
  inputs change.
- **Monte Carlo simulation** — 10,000 trials randomizing appreciation, rent
  growth, and vacancy, run in a Web Worker so the UI never blocks, shown as a
  worst/median/best case summary plus a histogram with a fitted normal-curve
  overlay.
- **AI interpretation** — a Claude-generated verdict and a 300-character-max
  interpretation grounded in the actual computed numbers and simulation results.
- **Accounts & saved deals** — email/password auth; save an analyzed property
  and revisit or re-tune it later.
- **Subscription paywall** — everything past login requires an active
  $11.99/month Stripe subscription; a new signup lands on `/subscribe` until
  they pay.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4, hand-built shadcn-style UI components (Radix primitives)
- Supabase (Postgres + Auth) for accounts and saved deals
- RentCast API for property data (beds/baths/sqft/year built/value/rent)
- Anthropic Claude API for AI investment recommendations
- Stripe (Checkout + Billing Portal + webhooks) for the subscription paywall
- Recharts for the Monte Carlo outcome distribution chart
- Vitest for unit tests on the finance/Monte Carlo calculation engines

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the keys below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app boots and builds with no API keys configured — property search, the AI
recommendation, and Supabase-backed features will show a "not configured yet"
state until the corresponding environment variable is set.

## Environment variables

See `.env.example`. You'll need:

- `RENTCAST_API_KEY` — [rentcast.io/api](https://www.rentcast.io/api)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from a [Supabase](https://supabase.com) project
- `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` — see
  [Billing / Stripe setup](#billing--stripe-setup) below

## Billing / Stripe setup

The `(app)` route group (search, analyze, deals) redirects to `/subscribe`
for any signed-in user without an `active` or `trialing` subscription status
on their `profiles` row. Subscription state is written by two paths:

1. **`app/api/stripe/webhook/route.ts`** — the source of truth. Handles
   `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`.
2. **`app/(billing)/subscribe/success/page.tsx`** — a synchronous fallback
   that looks up the just-completed Checkout Session directly, so access
   unlocks immediately instead of waiting on webhook delivery.

Both paths funnel through `lib/stripe/syncSubscription.ts`, which reads the
Supabase user ID out of `subscription.metadata.supabase_user_id` (set at
Checkout Session creation) — not by looking up the Stripe customer ID — so
there's no race between the two paths.

**Local webhook testing** (needed for renewals/cancellations, not for the
first activation — the success-page fallback covers that):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`. In
production, create the webhook endpoint in the
[Stripe dashboard](https://dashboard.stripe.com/webhooks) pointing at
`https://<your-domain>/api/stripe/webhook`, subscribed to the four event
types above, and use its signing secret instead.

This account is in **live mode** — real cards will be charged. Use a
[Stripe test-mode key](https://dashboard.stripe.com/test/apikeys) and
[test card numbers](https://docs.stripe.com/testing) while developing, and
switch to the live key only when you're ready to accept real payments.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — ESLint
- `npm run test` — run unit tests once
- `npm run test:watch` — run unit tests in watch mode

## Database

Supabase schema/migrations live in `supabase/migrations/`. Apply them via the
Supabase CLI or dashboard SQL editor against your project. `types/supabase.ts`
is hand-written to match the migration — regenerate it with
`supabase gen types typescript` once a real project exists, and keep it in
sync with future migrations until then.
