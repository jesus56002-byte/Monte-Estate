# Monte Estate

Property search and investment analysis tool. Enter an address, get instant
results (cash flow, cap rate, cash-on-cash return, IRR), a 10,000-run Monte
Carlo simulation of best/median/worst case outcomes, and an AI interpretation
— all generated automatically the moment the analysis is created, and saved
so they're still there on refresh or when you come back later.

## Features

- **Property search → instant analysis** — enter an address once; property
  details, deterministic results, a Monte Carlo simulation, and an AI
  interpretation are all generated in one shot and saved as a deal
  immediately (`createAnalysis` in `app/(app)/deals/actions.ts`). No separate
  "preview" step, no unsaved state that disappears on refresh or back
  navigation.
- **Investment inputs** — purchase price, down payment, interest rate, loan
  term, closing costs, taxes, insurance, HOA, maintenance/vacancy/management
  %, appreciation, rent growth, holding period, and selling costs, pre-filled
  from the fetched property and editable live, with an explicit "Save
  changes" to persist edits back onto the deal.
- **Monte Carlo simulation** — 10,000 trials randomizing appreciation, rent
  growth, and vacancy, run in a Web Worker so the UI never blocks. Runs
  automatically on load (cheap, client-side, no API cost) and silently
  persists its summary onto the deal after every run.
- **AI interpretation** — a Claude-generated verdict and a 300-character-max
  interpretation, generated once automatically when the analysis is created
  (real API cost, so not re-run on every page view) and saved with the deal.
  A "Regenerate" button re-runs it on demand.
- **Accounts & saved deals** — email/password auth; every analysis is a saved
  deal from the moment it's created.
- **Tiered usage plans** — Free (3 lifetime analyses, no payment), Starter
  ($11.99/mo, 20 analyses), Investor ($24.99/mo, 60 analyses); Starter/Investor
  subscribers can buy 10 additional analyses for $4.99. See
  [Plans & usage metering](#plans--usage-metering) below.
- **Terms & Conditions** — required checkbox at signup; acceptance timestamp
  and version recorded on the user's profile. See `app/terms/page.tsx`.
  **This is boilerplate, not legal advice — have an actual lawyer review it
  before relying on it, especially since this app charges real money.**

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4, hand-built shadcn-style UI components (Radix primitives)
- Supabase (Postgres + Auth) for accounts and saved deals
- RentCast API for property data (beds/baths/sqft/year built/value/rent)
- Anthropic Claude API for AI investment interpretations
- Stripe (Checkout + Billing Portal + webhooks) for subscriptions and top-ups
- Recharts for the Monte Carlo outcome distribution chart
- Vitest for unit tests on the finance/Monte Carlo/plan calculation logic

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the keys below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app boots and builds with no API keys configured — property search, the
AI interpretation, and Supabase-backed features will show a "not configured
yet" state until the corresponding environment variable is set. The free
plan works with just Supabase + RentCast configured; Stripe is only needed
for Starter/Investor/top-up purchases.

## Environment variables

See `.env.example`. You'll need:

- `RENTCAST_API_KEY` — [rentcast.io/api](https://www.rentcast.io/api)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from a [Supabase](https://supabase.com) project
- `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`,
  `STRIPE_PRICE_INVESTOR`, `STRIPE_PRICE_TOPUP` — see
  [Billing / Stripe setup](#billing--stripe-setup) below

## Plans & usage metering

Three plans, defined in `lib/plans.ts`:

| Plan     | Price       | Analyses           |
|----------|-------------|---------------------|
| Free     | —           | 3, lifetime         |
| Starter  | $11.99/mo   | 20/month            |
| Investor | $24.99/mo   | 60/month            |

Starter and Investor subscribers can also buy a **$4.99 / 10-analysis
top-up** at any time; top-up credits roll over across renewals (only the
plan's monthly allowance resets).

"An analysis" = one `createAnalysis` call, i.e. one property search. Quota is
checked and atomically consumed by the `consume_analysis_credit` Postgres
function (`supabase/migrations/0003_plans_and_usage.sql`) — a single
round-trip so concurrent requests can't double-spend. Everything past login
is otherwise open to the free plan; there's no subscription-gated redirect
anymore, just a per-analysis quota check. `ADMIN_EMAILS` accounts bypass the
quota entirely (see `lib/subscription.ts`).

Renewal resets (`plan_analyses_used` back to 0) are driven by the webhook's
`invoice.paid` handler, filtered to `billing_reason: "subscription_cycle"` so
the very first invoice at signup doesn't zero out a fresh count.

## Billing / Stripe setup

Unlike the old all-or-nothing paywall, Stripe is now only involved for
Starter/Investor subscriptions and top-up purchases — the free plan needs no
Stripe config at all. Subscription/usage state is written by two paths:

1. **`app/api/stripe/webhook/route.ts`** — the source of truth. Handles
   `checkout.session.completed` (both subscription mode and the one-time
   top-up payment mode), `customer.subscription.{created,updated,deleted}`,
   and `invoice.paid`.
2. **`app/(billing)/subscribe/success/page.tsx`** — a synchronous fallback
   for the *first* subscription activation, so access unlocks immediately
   instead of waiting on webhook delivery.

Both paths funnel through `lib/stripe/syncSubscription.ts`, which reads the
Supabase user ID out of `subscription.metadata.supabase_user_id` (set at
Checkout Session creation) — not by looking up the Stripe customer ID — so
there's no race between the two paths. The Billing Portal is configured
(via a one-time API call, not in code) to allow switching directly between
Starter and Investor without a second Checkout session.

**Local webhook testing** (needed for renewals/cancellations/top-ups, not for
first-time subscription activation — the success-page fallback covers that):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`. In
production, create the webhook endpoint in the
[Stripe dashboard](https://dashboard.stripe.com/webhooks) pointing at
`https://<your-domain>/api/stripe/webhook`, subscribed to the event types
above, and use its signing secret instead.

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
is hand-written to match the migrations — regenerate it with
`supabase gen types typescript` once available, and keep it in sync with
future migrations until then.
