-- Add languages column to expert_profiles table
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.expert_profiles.languages IS 'Array of languages spoken by the expert with proficiency levels';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_expert_profiles_languages 
ON public.expert_profiles USING GIN (languages);
