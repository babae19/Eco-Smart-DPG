-- Create profile-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access for profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder in profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in profile-images" ON storage.objects;

-- Policy: Anyone can view public images in profile-images bucket
CREATE POLICY "Public Access for profile-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload to own folder in profile-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files in profile-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files in profile-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix broadcast_notifications table - add missing priority column
ALTER TABLE broadcast_notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));