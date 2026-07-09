-- TravelEase Row Level Security Policies
-- Run via: npm run db:rls
-- Safe to re-run (drops existing policies first)

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "destinations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tour_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP EXISTING POLICIES (idempotent re-runs)
-- ============================================================

DROP POLICY IF EXISTS "public_read_destinations" ON "destinations";
DROP POLICY IF EXISTS "public_read_categories" ON "categories";
DROP POLICY IF EXISTS "public_read_tours" ON "tours";
DROP POLICY IF EXISTS "public_read_tour_images" ON "tour_images";
DROP POLICY IF EXISTS "public_read_gallery" ON "gallery";
DROP POLICY IF EXISTS "public_read_published_blogs" ON "blogs";
DROP POLICY IF EXISTS "public_read_approved_reviews" ON "reviews";
DROP POLICY IF EXISTS "public_read_site_settings" ON "site_settings";

-- ============================================================
-- PUBLIC READ POLICIES (anon + authenticated via Supabase API)
-- App server uses postgres role and bypasses RLS — unaffected.
-- ============================================================

CREATE POLICY "public_read_destinations" ON "destinations"
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_categories" ON "categories"
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_tours" ON "tours"
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_tour_images" ON "tour_images"
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_gallery" ON "gallery"
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_published_blogs" ON "blogs"
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "public_read_approved_reviews" ON "reviews"
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "public_read_site_settings" ON "site_settings"
  FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- PROTECTED TABLES (no policies = deny all for anon/authenticated)
-- user, session, account, verification — auth data
-- bookings, favorites — user-private data
-- messages, newsletter — admin/server only
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS (run separately if buckets exist)
-- ============================================================

-- Avatars: public read, authenticated upload own folder
-- INSERT INTO storage.buckets (id, name, public) VALUES ... on conflict do nothing;
