-- Create RLS policies for storage.objects to allow campaign image uploads

-- Policy to allow authenticated users to upload files to profile-images bucket
CREATE POLICY "Allow authenticated users to upload to profile-images bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'profile-images');

-- Policy to allow public read access to profile-images bucket
CREATE POLICY "Allow public read access to profile-images bucket" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'profile-images');

-- Policy to allow users to update their own files in profile-images bucket
CREATE POLICY "Allow users to update their own files in profile-images bucket" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own files in profile-images bucket
CREATE POLICY "Allow users to delete their own files in profile-images bucket" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);