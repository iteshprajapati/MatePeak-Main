-- =====================================================
-- Teaching Certification Storage and Columns Migration
-- =====================================================
-- This migration creates the storage bucket for teaching certificates
-- and adds related columns to expert_profiles table
-- =====================================================

-- Step 1: Add new columns to expert_profiles table (if they don't exist)
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS teaching_certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS has_no_certificate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS introduction text,
ADD COLUMN IF NOT EXISTS teaching_experience text,
ADD COLUMN IF NOT EXISTS motivation text,
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;

-- Add column comments for documentation
COMMENT ON COLUMN public.expert_profiles.teaching_certifications IS 'Array of teaching certifications with details: subject, certificateName, description, issuedBy, yearFrom, yearTo, certificateUrl, isVerified';
COMMENT ON COLUMN public.expert_profiles.has_no_certificate IS 'Flag indicating if the mentor has no teaching certificate (allows skipping certification step)';
COMMENT ON COLUMN public.expert_profiles.introduction IS 'Mentor introduction text (50-400 characters)';
COMMENT ON COLUMN public.expert_profiles.teaching_experience IS 'Mentor teaching experience description (50-400 characters)';
COMMENT ON COLUMN public.expert_profiles.motivation IS 'Mentor motivation for teaching (50-400 characters)';
COMMENT ON COLUMN public.expert_profiles.headline IS 'Mentor profile headline (10-100 characters)';
COMMENT ON COLUMN public.expert_profiles.education IS 'Array of education entries with degree, university, subject, yearFrom, yearTo, currentlyStudying';

-- Step 2: Create storage bucket for teaching certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teaching-certificates', 
  'teaching-certificates', 
  true,
  20971520, -- 20MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create RLS policies for teaching-certificates bucket
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

-- Allow authenticated users to upload their own certificates
CREATE POLICY "Users can upload their own certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teaching-certificates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own certificates
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

-- Allow authenticated users to delete their own certificates
CREATE POLICY "Users can delete their own certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teaching-certificates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to view all certificates (for profile display)
CREATE POLICY "Public can view certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'teaching-certificates');

-- Step 4: Create indexes for better query performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_expert_profiles_has_certificate 
ON public.expert_profiles(has_no_certificate);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_teaching_certifications 
ON public.expert_profiles USING GIN (teaching_certifications);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_education 
ON public.expert_profiles USING GIN (education);
