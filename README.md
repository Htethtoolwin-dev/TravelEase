# TravelEase

A production-ready full-stack travel and tour booking platform built with Next.js 16, Drizzle ORM, Supabase, and Better Auth.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Storage), Drizzle ORM
- **Auth:** Better Auth (Email/Password + Google OAuth)
- **Forms:** React Hook Form, Zod

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Random secret (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — `http://localhost:3000`
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Optional, for Google OAuth
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — Optional for `db:seed` (password required in production)

### 3. Set up the database

```bash
npm run db:push
npm run db:seed
npm run db:rls
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # UI and shared components
├── features/      # Feature-based modules
├── lib/           # Auth, DB, Supabase clients
├── schemas/       # Zod validation schemas
├── constants/     # App constants
└── types/         # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:rls` | Enable Row Level Security policies |
| `npm run db:studio` | Open Drizzle Studio |
| `npm test` | Run booking concurrency tests (needs `TEST_DATABASE_URL`) |

## Booking and seat handling

Seats are taken and returned with single conditional SQL statements, so
concurrent requests cannot oversell a tour or return seats twice:

- **Booking:** `UPDATE tours SET available_seats = available_seats - n WHERE id = ? AND available_seats >= n`.
  If two customers race for the last seat, Postgres locks the row and re-checks
  the `WHERE`, so the second request updates 0 rows and is told no seats are left.
  The booking row is inserted in the same transaction, so a failed insert gives the seats back.
- **Booking numbers** come from the `booking_number_seq` Postgres sequence, so
  concurrent bookings never get the same number.
- **Customer cancel:** `UPDATE bookings SET status = 'cancelled' WHERE ... AND status = 'pending'`.
  Only the request that gets a row back returns the seats.
- **Admin status change:** locks the booking with `SELECT ... FOR UPDATE` and only
  allows `pending → confirmed/cancelled` and `confirmed → cancelled/completed`.

### Testing

`tests/booking-concurrency.test.mts` fires real concurrent requests at a real
Postgres database (mocks cannot reproduce a race):

```bash
# use a throwaway database, never production
DATABASE_URL_DRIZZLE="<test-db-url>" npm run db:push
TEST_DATABASE_URL="<test-db-url>" npm test
```

Existing databases: run `supabase/migrations/003_booking_number_seq.sql` once
(or `npm run db:push`) to create the booking number sequence.

### Known limitation

`available_seats` belongs to the tour, not to a departure date, so a booking for
one date uses up seats for every date. The fix is a `tour_departures (tour_id,
date, seats_left)` table and running the same conditional `UPDATE` against the
departure row.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial TravelEase deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo
2. Add these **Environment Variables** in Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase transaction pooler URL (port **6543**) |
| `DATABASE_URL_DRIZZLE` | Supabase session pooler URL (port **5432**) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key |
| `BETTER_AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Your Vercel URL (e.g. `https://travelease.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |

3. Deploy — Vercel auto-builds on push

### 3. Post-deploy

- Run `npm run db:rls` locally (already done) or paste `supabase/migrations/001_enable_rls.sql` in Supabase SQL Editor
- For storage, run `supabase/migrations/002_storage_rls.sql` in Supabase SQL Editor
- Update Google OAuth redirect URI to `https://your-domain.vercel.app/api/auth/callback/google`

## Security

- **HTTP headers:** HSTS, X-Frame-Options, nosniff, and referrer policy via `next.config.ts`
- **Rate limiting:** Contact, newsletter, and booking actions (in-memory; use Redis/Upstash in production)
- **Auth:** Server-side `requireAdmin` / `requireCustomer` on protected routes and actions
- **Bookings:** Atomic seat reservation prevents overbooking races
- **Row Level Security (RLS)** is enabled on all tables:
- **Public read:** destinations, tours, categories, gallery, published blogs, approved reviews
- **Protected:** user, session, bookings, favorites, messages (server-only via Next.js)

## Documentation

See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for the full project specification.

## Default Admin Account (after seeding)

Run `npm run db:seed` to create an admin user. Credentials are printed once in the terminal output — **change the password immediately** and never commit credentials to the repo.
