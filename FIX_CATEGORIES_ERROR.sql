-- =====================================================
-- QUICK FIX: Copy and paste this ENTIRE script into your Supabase SQL Editor
-- Project: hnevrdlcqhmsfubakljg
-- URL: https://hnevrdlcqhmsfubakljg.supabase.co
-- =====================================================

-- This will add the missing columns needed for the Expertise Editor feature

-- Step 1: Add new columns (safe to run multiple times)
ALTER TABLE expert_profiles 
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expertise_tags text[] DEFAULT '{}';

-- Step 2: Migrate existing category data to categories array
UPDATE expert_profiles 
SET categories = ARRAY[category]
WHERE category IS NOT NULL 
  AND category != '' 
  AND (categories IS NULL OR categories = '{}');

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expert_profiles_categories 
ON expert_profiles USING GIN (categories);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_expertise_tags 
ON expert_profiles USING GIN (expertise_tags);

-- Step 4: Add helpful comments
COMMENT ON COLUMN expert_profiles.categories IS 'Array of expertise areas (e.g., Career Coaching, Programming & Tech). Allows mentors to have multiple expertise areas.';
COMMENT ON COLUMN expert_profiles.expertise_tags IS 'Array of specific skills and specializations (e.g., Python, Resume Writing, SAT Prep). Used for precise mentor-student matching.';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify the columns were added:
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'expert_profiles' 
AND column_name IN ('categories', 'expertise_tags')
ORDER BY column_name;

-- Expected output:
-- categories     | ARRAY  | '{}'::text[]
-- expertise_tags | ARRAY  | '{}'::text[]

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Go to: https://supabase.com/dashboard/project/hnevrdlcqhmsfubakljg/sql/new
-- 2. Copy this ENTIRE file
-- 3. Paste into the SQL Editor
-- 4. Click "Run" button
-- 5. Refresh your application (Ctrl+Shift+R)
-- 6. The expertise editor will now work!
-- =====================================================
