-- Add sample languages to all existing expert profiles
-- This will give each mentor English and one additional language for testing

-- First, let's see what expert profiles exist
-- SELECT id, full_name, username FROM expert_profiles;

-- Add languages to all expert profiles that don't have any
UPDATE public.expert_profiles
SET languages = '[
  {"language": "English", "level": "Fluent"},
  {"language": "Hindi", "level": "Native"}
]'::jsonb
WHERE languages IS NULL OR languages = '[]'::jsonb OR jsonb_array_length(languages) = 0;

-- Check the results
SELECT id, full_name, username, languages FROM expert_profiles;
