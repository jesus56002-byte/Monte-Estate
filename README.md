# Monte Estate

Property search and investment analysis tool. Enter an address, tune financing
assumptions, and see cash flow, cap rate, cash-on-cash return, IRR, and a
10,000-run Monte Carlo simulation of best/median/worst case outcomes, plus an
AI-generated investment recommendation.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4, hand-built shadcn-style UI components (Radix primitives)
- Supabase (Postgres + Auth) for accounts and saved deals
- RentCast API for property data (beds/baths/sqft/year built/value/rent)
- Anthropic Claude API for AI investment recommendations
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

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — ESLint
- `npm run test` — run unit tests once
- `npm run test:watch` — run unit tests in watch mode

## Database

Supabase schema/migrations live in `supabase/migrations/`. Apply them via the
Supabase CLI or dashboard SQL editor against your project.
