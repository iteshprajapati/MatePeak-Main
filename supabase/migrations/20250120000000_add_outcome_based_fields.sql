-- Add outcome-based onboarding fields to expert_profiles table
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS problems_helped JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS outcomes_delivered JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS suggested_services JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN expert_profiles.target_audience IS 'Target audience selection: students, freshers, professionals, founders';
COMMENT ON COLUMN expert_profiles.problems_helped IS 'Problems the mentor helps solve: careerConfusion, resumeRejection, interviewFear, skillRoadmap, personalBranding';
COMMENT ON COLUMN expert_profiles.outcomes_delivered IS 'Outcomes the mentor delivers: clearDirection, feedback, roadmap, ongoingSupport';
COMMENT ON COLUMN expert_profiles.suggested_services IS 'Auto-generated service suggestions based on mentor profile';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expert_profiles_target_audience ON expert_profiles USING GIN (target_audience);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_problems_helped ON expert_profiles USING GIN (problems_helped);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_outcomes_delivered ON expert_profiles USING GIN (outcomes_delivered);
