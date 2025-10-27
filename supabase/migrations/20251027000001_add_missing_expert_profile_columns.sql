-- Add missing columns to expert_profiles table
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS introduction TEXT,
ADD COLUMN IF NOT EXISTS teaching_experience TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS teaching_certifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS has_no_certificate BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.expert_profiles.introduction IS 'Expert introduction and background';
COMMENT ON COLUMN public.expert_profiles.teaching_experience IS 'Teaching experience description';
COMMENT ON COLUMN public.expert_profiles.motivation IS 'Motivation for teaching/mentoring';
COMMENT ON COLUMN public.expert_profiles.headline IS 'Short headline for profile';
COMMENT ON COLUMN public.expert_profiles.education IS 'Array of education entries with institution, degree, field, year';
COMMENT ON COLUMN public.expert_profiles.teaching_certifications IS 'Array of teaching certifications';
COMMENT ON COLUMN public.expert_profiles.has_no_certificate IS 'Indicates if expert has no certifications';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expert_profiles_education 
ON public.expert_profiles USING GIN (education);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_teaching_certifications 
ON public.expert_profiles USING GIN (teaching_certifications);
