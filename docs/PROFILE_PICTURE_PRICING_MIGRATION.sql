-- =====================================================
-- Profile Picture & Service Pricing Migration
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Add new columns to expert_profiles table
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS service_pricing jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS profile_picture_url text;

-- Step 2: Migrate existing pricing data to new structure (if needed)
-- This converts old ispaid/pricing to new service_pricing structure
UPDATE public.expert_profiles
SET service_pricing = jsonb_build_object(
  'oneOnOneSession', jsonb_build_object(
    'enabled', COALESCE(ispaid, false),
    'price', COALESCE(pricing, 0),
    'hasFreeDemo', false
  ),
  'chatAdvice', jsonb_build_object(
    'enabled', false,
    'price', 0,
    'hasFreeDemo', false
  ),
  'digitalProducts', jsonb_build_object(
    'enabled', false,
    'price', 0
  ),
  'notes', jsonb_build_object(
    'enabled', false,
    'price', 0
  )
)
WHERE service_pricing = '{}'::jsonb OR service_pricing IS NULL;

-- Step 3: Add column comments for documentation
COMMENT ON COLUMN public.expert_profiles.service_pricing IS 'Service-specific pricing structure: oneOnOneSession, chatAdvice, digitalProducts, notes with enabled/price/hasFreeDemo flags';
COMMENT ON COLUMN public.expert_profiles.profile_picture_url IS 'URL to mentor profile picture in storage';

-- Step 4: Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create RLS policies for profile-pictures bucket
-- Allow authenticated users to upload their own profile picture
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own profile picture
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own profile picture
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to view all profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Step 6: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expert_profiles_service_pricing 
ON public.expert_profiles USING GIN (service_pricing);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_profile_picture 
ON public.expert_profiles(profile_picture_url) WHERE profile_picture_url IS NOT NULL;

-- Step 7: Optional - You can keep the old columns for backward compatibility
-- or remove them after verifying the migration works
-- ALTER TABLE public.expert_profiles DROP COLUMN IF EXISTS ispaid;
-- ALTER TABLE public.expert_profiles DROP COLUMN IF EXISTS pricing;
-- ALTER TABLE public.expert_profiles DROP COLUMN IF EXISTS bio;

-- Step 8: Verify the changes
-- Uncomment to check after running:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'expert_profiles' 
-- AND column_name IN ('service_pricing', 'profile_picture_url');

-- SELECT * FROM storage.buckets WHERE id = 'profile-pictures';
