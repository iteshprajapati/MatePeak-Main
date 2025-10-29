-- This SQL script adds sample language data to existing expert profiles
-- Run this in your Supabase SQL Editor after applying the migration

-- First, make sure the languages column exists
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Update a sample profile with languages (replace the id with an actual expert profile id)
-- You can find IDs by running: SELECT id, full_name, username FROM expert_profiles LIMIT 5;

-- Example: Update first expert profile with sample languages
UPDATE public.expert_profiles
SET languages = '[
  {"language": "English", "level": "Native"},
  {"language": "Spanish", "level": "Fluent"},
  {"language": "French", "level": "Intermediate"}
]'::jsonb
WHERE id = (SELECT id FROM public.expert_profiles LIMIT 1);

-- To update all profiles with at least English as a default:
-- UPDATE public.expert_profiles
-- SET languages = '[{"language": "English", "level": "Fluent"}]'::jsonb
-- WHERE languages IS NULL OR languages = '[]'::jsonb;
