# Green Mile

Residency & travel tracker for U.S. permanent residents (form I-551). Log trips
abroad; the app continuously computes physical-presence, continuous-residence
risk, and naturalization timing against today's date.

Productionized from the `migration-tracker.html` prototype. Terminal design
system preserved as CSS tokens (`app/globals.css`); all residency math lives in
`lib/residency.ts` (pure, unit-testable).

## Stack
- Next.js 14 (App Router, TypeScript)
- Supabase (Auth + Postgres, RLS per user)
- Vercel (deploy)

## Setup
1. `npm install`
2. Create a Supabase project, run `supabase/schema.sql` in the SQL Editor.
3. Copy `.env.local.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `npm run dev` → http://localhost:3000

## Deploy (Vercel)
Import the repo, set the two env vars above, deploy. Every push auto-deploys.

## Notes
- Registration seeds the profile via Supabase user metadata → DB trigger.
- If Supabase email confirmation is ON, users confirm via email before first sign-in.
- Immigration thresholds (913-day presence, 180-day / 1-year lines, N-400 90-day
  early filing) are tracking conveniences, not legal advice.
