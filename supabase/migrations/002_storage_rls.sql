-- TravelEase Storage RLS Policies
-- Run in Supabase SQL Editor AFTER creating storage buckets

-- Create buckets (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('tours', 'tours', true),
  ('destinations', 'destinations', true),
  ('blog', 'blog', true),
  ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Drop existing storage policies
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
DROP POLICY IF EXISTS "public_read_tours" ON storage.objects;
DROP POLICY IF EXISTS "public_read_destinations" ON storage.objects;
DROP POLICY IF EXISTS "public_read_blog" ON storage.objects;
DROP POLICY IF EXISTS "public_read_gallery" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_avatars" ON storage.objects;

-- Public read for all buckets
CREATE POLICY "public_read_avatars" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "public_read_tours" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'tours');

CREATE POLICY "public_read_destinations" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'destinations');

CREATE POLICY "public_read_blog" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'blog');

CREATE POLICY "public_read_gallery" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery');

-- Authenticated users can upload to avatars bucket
CREATE POLICY "auth_upload_avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');
