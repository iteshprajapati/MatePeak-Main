-- =====================================================
-- QUICK FIX: Teaching Certificates Storage Bucket
-- =====================================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- and run it to fix the "bucket not found" error
-- =====================================================

-- Create storage bucket for teaching certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teaching-certificates', 
  'teaching-certificates', 
  true,
  20971520, -- 20MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'];

-- Create policies using DO block to handle if they already exist
DO $$ 
BEGIN
  -- Allow authenticated users to upload their own certificates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own certificates'
  ) THEN
    CREATE POLICY "Users can upload their own certificates"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'teaching-certificates' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Allow authenticated users to update their own certificates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own certificates'
  ) THEN
    CREATE POLICY "Users can update their own certificates"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'teaching-certificates' AND
      auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'teaching-certificates' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Allow authenticated users to delete their own certificates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own certificates'
  ) THEN
    CREATE POLICY "Users can delete their own certificates"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'teaching-certificates' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Allow public to view all certificates (for profile display)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view certificates'
  ) THEN
    CREATE POLICY "Public can view certificates"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'teaching-certificates');
  END IF;
END $$;

-- Verify the bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'teaching-certificates';
