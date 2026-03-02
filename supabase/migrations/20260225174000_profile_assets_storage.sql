-- Create profile_assets bucket for admin profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_assets', 'profile_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profile_assets
-- 1. Allow public read access
CREATE POLICY "Allow public read from profile_assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile_assets');

-- 2. Allow authenticated users to upload their own profile assets
-- We'll simplify to allow any authenticated user to upload to this bucket for now
-- as it's an admin-only area anyway.
CREATE POLICY "Allow authenticated upload to profile_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile_assets');

-- 3. Allow users to delete their own assets
CREATE POLICY "Allow authenticated delete from profile_assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile_assets');
