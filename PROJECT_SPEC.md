# TravelEase — Project Specification

> A production-ready full-stack travel and tour booking platform for a real travel agency business.

**Status:** v1 complete — all 5 implementation phases shipped, plus performance and security hardening pass.

---

## About the Project

**TravelEase** is a modern full-stack travel and tour booking platform designed to serve as both a commercial-grade business website and a portfolio centerpiece. It enables visitors to discover destinations, explore tour packages, make bookings, and manage travel plans — while giving administrators a powerful dashboard to manage tours, bookings, customers, content, and analytics.

The platform is built to feel like a real commercial product, not a student demo. Every feature, component, and page prioritizes scalability, maintainability, security, and user experience.

### Business Context

TravelEase represents a fictional (or real) travel agency that offers curated tour packages across multiple destinations. The platform supports the full customer lifecycle — from discovery and booking to post-trip reviews — and gives agency staff complete operational control through an admin dashboard.

### Target Users

| Role | Description |
|------|-------------|
| **Guest** | Unauthenticated visitor browsing the public website |
| **Customer** | Registered user who can book tours, manage profile, save favorites, and leave reviews |
| **Admin** | Agency staff with full management access to tours, bookings, content, and analytics |

---

## Project Goals

- Build a production-quality business website
- Demonstrate modern full-stack development skills
- Follow clean architecture and best coding practices
- Create an excellent responsive user experience
- Implement secure authentication and authorization
- Optimize performance and SEO
- Make the application deployment-ready

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | React framework with SSR, RSC, ISR, and routing |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible, customizable UI components |
| Framer Motion | Animations and transitions |
| React Hook Form | Form state management |
| Zod | Schema validation |
| Recharts | Admin analytics charts (lazy-loaded) |
| Lucide React | Icon library |
| next-themes | Dark mode support |
| Sonner | Toast notifications |

### Backend & Infrastructure

| Technology | Purpose |
|------------|---------|
| Supabase PostgreSQL | Primary database (transaction pooler for app, session pooler for Drizzle CLI) |
| Supabase Storage | File storage (images, avatars) |
| Supabase RLS | Row Level Security policies |
| Drizzle ORM | Type-safe database access |
| Better Auth | Authentication (email/password + Google OAuth) |
| postgres.js | PostgreSQL driver via Drizzle |

### Authentication

- **Provider:** Better Auth integrated with Supabase PostgreSQL via Drizzle adapter
- **Methods:** Email & Password, Google OAuth (optional, env-gated)
- **Features:** Registration, login, logout, forgot password, password reset (email wiring pending), session management, protected routes, role-based authorization
- **Roles:** `customer` (default) and `admin` — role field is server-controlled (`input: false`)
- **Note:** Email verification is currently disabled (`requireEmailVerification: false`)

---

## Architecture

### Pattern

**Feature-Based Architecture** — code is organized by domain feature rather than by technical layer, keeping business logic modular and maintainable.

### Folder Structure

```
src/
├── app/
│   ├── (public)/         # Marketing site (ISR on key pages)
│   ├── (customer)/       # Customer dashboard (force-dynamic)
│   ├── (admin)/          # Admin dashboard (force-dynamic)
│   └── api/auth/         # Better Auth API route
├── components/
│   ├── ui/               # shadcn/ui primitives
│   └── shared/           # Layout, header, footer, loaders, pagination
├── features/             # Domain feature modules (components + forms)
│   ├── auth/
│   ├── tours/
│   ├── bookings/
│   ├── destinations/
│   ├── blog/
│   ├── gallery/
│   ├── reviews/
│   ├── favorites/
│   ├── contact/
│   ├── home/
│   ├── dashboard/
│   └── admin/
├── actions/              # Server Actions (thin wrappers)
├── services/             # Business logic and DB operations
│   └── admin/            # Admin CRUD and analytics services
├── lib/                  # Auth, DB, Supabase, cache tags, rate limiting
├── utils/                # Formatting and helper functions
├── types/                # TypeScript type definitions
├── schemas/              # Zod validation schemas
├── constants/            # App-wide constants and routes
└── middleware.ts         # Route protection (cookie presence check)

scripts/
├── seed.ts               # Database seeding
└── enable-rls.ts         # Apply RLS policies

supabase/migrations/
├── 001_enable_rls.sql    # Table RLS policies
└── 002_storage_rls.sql   # Storage bucket policies
```

### Separation of Concerns

- **UI Components** — presentational, reusable; client components only when interactivity is required
- **Server Actions** — auth guards, validation, cache invalidation; delegate to services
- **Services** — business logic and Drizzle queries
- **Validation** — Zod schemas shared between client forms and server actions
- **Session helpers** — `requireAuth`, `requireAdmin`, `requireCustomer` in `lib/session.ts`

### Rendering Strategy

| Route group | Strategy | Notes |
|-------------|----------|-------|
| Public marketing | Static / ISR | Homepage, blog, gallery use `revalidate = 300` (5 min) |
| Tours listing & detail | Dynamic | Search/filter params and per-slug data |
| Customer dashboard | `force-dynamic` | Always fresh user-specific data |
| Admin dashboard | `force-dynamic` | Always fresh admin data |

---

## Features

### Public Website ✅

| Page | Route | Status |
|------|-------|--------|
| **Home** | `/` | ✅ Hero, featured destinations/tours, stats, testimonials, blog, newsletter |
| **About Us** | `/about` | ✅ Company story and mission |
| **Destinations** | `/destinations` | ✅ Browse all destinations |
| **Destination Detail** | `/destinations/[slug]` | ✅ Destination info and related tours |
| **Tour Packages** | `/tours` | ✅ Searchable, filterable, paginated listing |
| **Tour Details** | `/tours/[slug]` | ✅ Gallery, itinerary, reviews, favorite button, book CTA |
| **Book Tour** | `/tours/[slug]/book` | ✅ Multi-step booking wizard (auth required) |
| **Gallery** | `/gallery` | ✅ Photo grid with category filter |
| **Blog** | `/blog` | ✅ Published articles listing |
| **Blog Details** | `/blog/[slug]` | ✅ Individual article page |
| **Contact** | `/contact` | ✅ Contact form with rate limiting |
| **FAQ** | `/faq` | ✅ Frequently asked questions |
| **Privacy Policy** | `/privacy` | ✅ Static placeholder |
| **Terms & Conditions** | `/terms` | ✅ Static placeholder |
| **404 Page** | — | ✅ Custom not-found page |
| **SEO** | — | ✅ `sitemap.ts`, `robots.ts`, per-page metadata |

#### Homepage Sections

1. **Hero** — Background image, headline, CTA, popular search suggestions
2. **Featured Destinations** — Cards with image, country, city
3. **Featured Tours** — Cards with cover image, duration, price, rating, seats
4. **Why Choose Us** — Professional guides, pricing, security, support
5. **Statistics** — Site stats from `site_settings` (admin-editable)
6. **Testimonials** — Approved customer reviews
7. **Latest Blog Posts** — Recent published articles
8. **Newsletter** — Email subscription with rate limiting
9. **Footer** — Company info, navigation, contact info

#### Search & Filtering (Tours)

**Search by:** tour name, destination, country, city

**Filter by:** category, difficulty, minimum rating

**Sort by:** newest, most popular, lowest price, highest price, highest rated

**Pagination:** 12 tours per page

---

### Tour Package Data Model

Each tour includes:

- Title, slug, cover image, gallery images
- Destination, category
- Price, discount price, duration, difficulty
- Maximum guests, available seats, tour guide
- Description, highlights, included/excluded services
- Daily itinerary, map location (lat/lng/address)
- Average rating and review count (denormalized, recalculated on review approval)

---

### Booking System ✅

#### Booking Flow

1. Open tour detail page → click **Book Now**
2. Authenticate (redirect to login if needed)
3. **Step 1:** Select travel date and number of travelers
4. **Step 2:** Enter traveler information (name, optional age)
5. **Step 3:** Review booking summary and confirm
6. **Seat reservation:** Available seats decremented atomically in a DB transaction
7. Booking saved with status **Pending**
8. Admin reviews and confirms or rejects
9. On confirm: status → Confirmed, payment → Paid
10. On cancel/reject (pending): seats restored to tour

#### Booking Number Format

`TRV-YYYY-NNNNNN` (e.g., `TRV-2026-000001`) — auto-generated with retry on unique violation

#### Booking Status

| Status | Description |
|--------|-------------|
| Pending | Awaiting admin review; seats held |
| Confirmed | Approved by admin |
| Cancelled | Cancelled by customer or admin; seats restored if pending/confirmed |
| Completed | Tour has been completed |

#### Payment Status

| Status | Description |
|--------|-------------|
| Pending | Payment not yet received |
| Paid | Payment confirmed (set on admin confirm) |
| Refunded | Payment refunded |

---

### Customer Dashboard ✅

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/dashboard` | Stats, recent bookings |
| **My Profile** | `/dashboard/profile` | Edit name/phone, avatar upload |
| **My Bookings** | `/dashboard/bookings` | Booking history with status badges |
| **Booking Details** | `/dashboard/bookings/[bookingNumber]` | Full info, cancel pending bookings |
| **Favorite Tours** | `/dashboard/favorites` | Saved tours grid |
| **My Reviews** | `/dashboard/reviews` | Submitted reviews |
| **Settings** | `/dashboard/settings` | Change password |

#### Customer Capabilities

- Register and login (email or Google)
- Edit profile and upload avatar (Supabase Storage)
- Book tours through multi-step wizard
- View booking history and details
- Cancel pending bookings (seats restored)
- Save/remove favorite tours
- Leave reviews on completed tours (one review per tour per user)
- Read blog articles

---

### Admin Dashboard ✅

| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/admin` | KPI cards, charts, recent activity |
| **Tours** | `/admin/tours` | Full CRUD with image gallery |
| **Destinations** | `/admin/destinations` | Manage destinations |
| **Categories** | `/admin/categories` | Manage tour categories |
| **Bookings** | `/admin/bookings` | View, confirm, reject, complete, cancel |
| **Customers** | `/admin/customers` | View profiles and booking counts |
| **Reviews** | `/admin/reviews` | Approve, reject, delete; recalculates tour ratings |
| **Blog Posts** | `/admin/blog` | Create, edit, publish articles |
| **Gallery** | `/admin/gallery` | Upload, reorder, delete images |
| **Contact Messages** | `/admin/messages` | Inbox, mark read, delete |
| **Newsletter** | `/admin/newsletter` | View subscribers, toggle active |
| **Analytics** | `/admin/analytics` | Extended charts and metrics |
| **Settings** | `/admin/settings` | Homepage stats, contact info |

#### Admin Capabilities

- Full CRUD on tours, destinations, categories, blog, gallery
- Booking management with atomic seat operations
- Review moderation with rating recalculation
- Contact message inbox
- Site settings (stats counters, contact details)
- Dashboard analytics and reporting

#### Dashboard Analytics

**KPI Cards:** total customers, tours, bookings, monthly revenue

**Charts (Recharts, lazy-loaded):**
- Monthly bookings (bar)
- Monthly revenue (line)
- Most popular destinations (horizontal bar)
- Customer growth (area)

**Tables:** recent bookings, customers, reviews

---

## Database Schema

16 tables total — Better Auth tables (`user`, `session`, `account`, `verification`) plus 12 app tables.

### Users (Better Auth)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | Primary key |
| name | TEXT | Display name |
| email | TEXT | Unique, required |
| email_verified | BOOLEAN | Default false |
| image | TEXT | Avatar URL |
| role | TEXT | `customer` \| `admin` — server-controlled |
| phone | TEXT | Optional |
| created_at / updated_at | TIMESTAMP | Auto-managed |

### Destinations

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name, slug | TEXT | Slug unique |
| country, city | TEXT | Location |
| description | TEXT | Full description |
| image | TEXT | Cover image URL |
| featured | BOOLEAN | Show on homepage |
| created_at | TIMESTAMP | Auto-generated |

### Categories

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name, slug | TEXT | Slug unique |
| description | TEXT | Optional |

### Tours

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| destination_id | UUID | FK → destinations |
| category_id | UUID | FK → categories |
| title, slug | TEXT | Slug unique |
| description, duration | TEXT | |
| difficulty | ENUM | `easy` \| `moderate` \| `hard` |
| price, discount_price | DECIMAL | |
| max_guests, available_seats | INTEGER | |
| featured | BOOLEAN | Homepage flag |
| cover_image | TEXT | |
| highlights, included, excluded | JSONB | String arrays |
| itinerary | JSONB | Day/title/description array |
| location | JSONB | `{ address, lat, lng }` |
| tour_guide | TEXT | Optional |
| average_rating | DECIMAL | Denormalized |
| review_count | INTEGER | Denormalized |
| created_at | TIMESTAMP | |

**Indexes:** `destination_id`, `category_id`, `featured`

### Tour Images

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| tour_id | UUID | FK → tours (cascade delete) |
| image_url | TEXT | |
| sort_order | INTEGER | Display order |

**Index:** `tour_id`

### Bookings

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| booking_number | TEXT | Unique, auto-generated |
| user_id | TEXT | FK → user |
| tour_id | UUID | FK → tours |
| travel_date | DATE | |
| travelers | INTEGER | |
| traveler_info | JSONB | `{ name, age? }[]` |
| total_price | DECIMAL | |
| booking_status | ENUM | `pending` \| `confirmed` \| `cancelled` \| `completed` |
| payment_status | ENUM | `pending` \| `paid` \| `refunded` |
| admin_notes | TEXT | Optional internal notes |
| created_at | TIMESTAMP | |

**Indexes:** `user_id`, `tour_id`, `booking_status`, `created_at`

### Reviews

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | TEXT | FK → user |
| tour_id | UUID | FK → tours |
| rating | INTEGER | 1–5 |
| comment | TEXT | |
| status | ENUM | `pending` \| `approved` \| `rejected` |
| created_at | TIMESTAMP | |

**Constraints:** unique `(user_id, tour_id)` — one review per user per tour

**Index:** `(tour_id, status)`

### Favorites

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | TEXT | FK → user |
| tour_id | UUID | FK → tours |

**Constraint:** unique `(user_id, tour_id)`

### Blogs, Gallery, Messages, Newsletter

Same as original spec — blogs have `published`/`published_at`; gallery has `sort_order`; messages have `read` flag; newsletter has `active` flag.

### Site Settings

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| key | TEXT | Unique setting key |
| value | JSONB | Setting payload (stats, contact info) |

Used for admin-editable homepage statistics and contact details.

---

## File Storage (Supabase Storage)

| Bucket | Contents | Access |
|--------|----------|--------|
| `avatars` | User profile photos | Authenticated upload, public read |
| `tours` | Tour cover and gallery images | Admin upload, public read |
| `destinations` | Destination cover images | Admin upload, public read |
| `blog` | Blog cover images | Admin upload, public read |
| `gallery` | Gallery photos | Admin upload, public read |

Storage RLS policies defined in `supabase/migrations/002_storage_rls.sql`.

---

## UI & Design Requirements

### Design Philosophy

Premium, modern, elegant, minimal, and professional — resembling a real commercial travel agency website.

### Visual Elements

- Rounded cards with soft shadows
- Large, high-quality photography (Unsplash + Supabase CDN)
- Smooth Framer Motion animations
- Consistent spacing and typography
- Skeleton loading states on key list pages
- Toast notifications (Sonner)
- Dark mode support (next-themes)
- Fully responsive layout (mobile-first)

### Color Palette

| Role | Color |
|------|-------|
| Primary | Blue |
| Secondary | Sky Blue |
| Accent | Orange |
| Neutral | White, Gray |
| Success | Green |
| Danger | Red |
| Warning | Yellow |

---

## Security

### Implemented

- **Better Auth** — session management, role field server-controlled
- **Server-side authorization** — `requireAdmin()` / `requireCustomer()` on all protected pages and mutations
- **Middleware** — redirects unauthenticated users from `/dashboard` and `/admin`; role checks happen server-side in layouts
- **Zod validation** — all form inputs validated client-side and server-side
- **Open redirect protection** — `safeCallbackPath()` allowlists post-login redirects to same-origin paths
- **Rate limiting** — contact (5/min), newsletter (3/min), booking (10/min) per user+IP
- **Atomic booking operations** — seat reservation in transaction prevents overbooking races
- **Booking IDOR protection** — bookings scoped to authenticated user ID
- **UUID validation** — on favorite toggle actions
- **HTTP security headers** — HSTS, X-Frame-Options, nosniff, referrer policy, permissions policy
- **Environment variables** — `.env*` gitignored; secrets never logged (password reset URLs not logged)
- **Supabase RLS** — enabled on all tables via `npm run db:rls`
- **Seed safety** — admin creation skipped in production unless `SEED_ADMIN_PASSWORD` is set; credentials never written to README

### Known v1 Limitations

| Item | Status | Recommendation |
|------|--------|----------------|
| Rate limiting | In-memory per instance | Use Upstash Redis for production |
| Email verification | Disabled | Enable before public launch |
| Password reset email | Dev logging only | Wire Resend/SendGrid |
| Middleware role check | Cookie presence only | Acceptable — server layouts enforce roles |
| Payment processing | Simulated (admin marks paid) | Stripe integration in v2 |

---

## Performance

### Implemented

- **Server Components by default** — client components only for forms, filters, charts, theme toggle
- **ISR** — homepage, blog, gallery revalidate every 5 minutes
- **React `cache()`** — request-level dedup on `getTourBySlug`
- **Targeted cache invalidation** — `updateTag()` with `CACHE_TAGS` on admin mutations
- **Lazy-loaded charts** — Recharts loaded via dynamic import in admin
- **SQL aggregations** — `count()` for dashboard stats instead of fetching all rows
- **Limited queries** — `getRecentUserBookings(5)` on customer dashboard
- **Database indexes** — on tours, bookings, reviews, tour_images, favorites
- **Image optimization** — Next.js Image with AVIF/WebP formats; remote patterns for Unsplash and Supabase
- **Connection pooling** — postgres.js with tuned pool size for serverless
- **SEO** — dynamic metadata, sitemap, robots.txt

---

## Code Quality Standards

- Strict TypeScript throughout
- Reusable, composable components
- Feature-based architecture
- Typed `ActionResult<T>` for all server action responses
- Clean error handling in services and actions
- ESLint with React Compiler rules
- Production-level folder structure

---

## Implementation Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Foundation — Next.js scaffold, Drizzle schema (16 tables), Better Auth, middleware, seed script, RLS | ✅ Complete |
| **Phase 2** | Public Website — all marketing pages, tour discovery, search/filter, blog, gallery, contact, SEO | ✅ Complete |
| **Phase 3** | Booking System — multi-step wizard, server actions, booking numbers, confirmation page | ✅ Complete |
| **Phase 4** | Customer Dashboard — profile, bookings, favorites, reviews, settings, avatar upload | ✅ Complete |
| **Phase 5** | Admin Dashboard — full CRUD modules, booking approval, analytics charts, site settings | ✅ Complete |
| **Hardening** | Performance optimization, security audit, indexes, rate limiting, atomic bookings | ✅ Complete |

---

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:seed` | Seed sample data + admin user |
| `npm run db:rls` | Apply RLS policies |
| `npm run db:studio` | Open Drizzle Studio |

---

## Future Enhancements (v2+)

These features are planned but not required for v1:

- Online payment integration (Stripe)
- Booking and auth email notifications (Resend/SendGrid)
- Distributed rate limiting (Upstash Redis)
- Email verification enforcement
- Travel wishlist sharing
- Multi-language support (i18n)
- Currency switching
- Admin activity logs
- Discount coupons and promotional banners
- Live chat support
- Push notifications
- AI travel assistant
- Weather information integration
- Flight booking integration
- CI pipeline (GitHub Actions — lint, typecheck, build)

---

## Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Next.js hosting |
| **Supabase** | PostgreSQL database and file storage |
| **GitHub** | Source control |

### Post-Deploy Checklist

1. Set all environment variables in Vercel (see below)
2. Run `npm run db:push` and `npm run db:rls` against production database
3. Run `002_storage_rls.sql` in Supabase SQL Editor when storage buckets exist
4. Create Supabase storage buckets (`avatars`, `tours`, `destinations`, `blog`, `gallery`)
5. Set `SEED_ADMIN_PASSWORD` and run seed once, then rotate password
6. Update Google OAuth redirect URI to production domain
7. Rotate any secrets that were shared during development

---

## Environment Variables

```env
# Database
# App runtime — transaction pooler (port 6543)
DATABASE_URL=

# Drizzle db:push / db:generate — session pooler (port 5432)
DATABASE_URL_DRIZZLE=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Seed (optional — password required in production)
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

---

*This document serves as the single source of truth for TravelEase v1 scope, features, and technical decisions. Last updated after Phase 5 completion and performance/security hardening pass.*
