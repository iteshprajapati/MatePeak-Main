-- Add profile status and visibility fields to expert_profiles
-- This enables mentor profile moderation and visibility control

-- Add profile_status column
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS profile_status TEXT 
CHECK (profile_status IN ('draft', 'active', 'inactive', 'pending_review', 'suspended')) 
DEFAULT 'active';

-- Add profile_completeness_score column (0-100)
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS profile_completeness_score INTEGER DEFAULT 0 
CHECK (profile_completeness_score >= 0 AND profile_completeness_score <= 100);

-- Add is_featured flag for highlighting top mentors
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add is_verified flag for verified mentors
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add visibility_updated_at timestamp
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS visibility_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add total_bookings counter
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;

-- Add average_rating (calculated from reviews)
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.0 
CHECK (average_rating >= 0 AND average_rating <= 5);

-- Add total_reviews counter
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Add last_active_at timestamp
ALTER TABLE public.expert_profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add column comments
COMMENT ON COLUMN public.expert_profiles.profile_status IS 'Profile visibility status: draft (not visible), active (visible), inactive (paused), pending_review (awaiting approval), suspended (blocked)';
COMMENT ON COLUMN public.expert_profiles.profile_completeness_score IS 'Profile completeness score from 0-100 based on filled fields';
COMMENT ON COLUMN public.expert_profiles.is_featured IS 'Whether this mentor is featured on homepage or explore page';
COMMENT ON COLUMN public.expert_profiles.is_verified IS 'Whether this mentor has been verified by admin';
COMMENT ON COLUMN public.expert_profiles.average_rating IS 'Cached average rating from reviews (0.00-5.00)';
COMMENT ON COLUMN public.expert_profiles.total_reviews IS 'Cached count of total reviews';
COMMENT ON COLUMN public.expert_profiles.total_bookings IS 'Cached count of completed bookings';
COMMENT ON COLUMN public.expert_profiles.last_active_at IS 'Last time the mentor was active on the platform';

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_expert_profiles_profile_status 
ON public.expert_profiles(profile_status);

-- Create index for featured mentors
CREATE INDEX IF NOT EXISTS idx_expert_profiles_is_featured 
ON public.expert_profiles(is_featured) 
WHERE is_featured = true;

-- Create index for active profiles
CREATE INDEX IF NOT EXISTS idx_expert_profiles_active 
ON public.expert_profiles(profile_status, created_at) 
WHERE profile_status = 'active';

-- Create composite index for rating-based queries
CREATE INDEX IF NOT EXISTS idx_expert_profiles_rating 
ON public.expert_profiles(average_rating DESC, total_reviews DESC) 
WHERE profile_status = 'active';

-- Function to calculate profile completeness score
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile_data RECORD;
BEGIN
  SELECT * INTO profile_data FROM expert_profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Required fields (15 points each = 60 total)
  IF profile_data.full_name IS NOT NULL AND LENGTH(profile_data.full_name) > 0 THEN
    score := score + 15;
  END IF;
  
  IF profile_data.username IS NOT NULL AND LENGTH(profile_data.username) > 0 THEN
    score := score + 15;
  END IF;
  
  IF profile_data.category IS NOT NULL OR (profile_data.categories IS NOT NULL AND array_length(profile_data.categories, 1) > 0) THEN
    score := score + 15;
  END IF;
  
  IF profile_data.bio IS NOT NULL AND LENGTH(profile_data.bio) > 50 THEN
    score := score + 15;
  END IF;
  
  -- Recommended fields (10 points each = 40 total)
  IF profile_data.profile_picture_url IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  IF profile_data.services IS NOT NULL AND jsonb_typeof(profile_data.services) = 'object' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.service_pricing IS NOT NULL AND jsonb_typeof(profile_data.service_pricing) = 'object' THEN
    score := score + 10;
  END IF;
  
  IF profile_data.expertise_tags IS NOT NULL AND array_length(profile_data.expertise_tags, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update mentor rating from reviews
CREATE OR REPLACE FUNCTION update_mentor_rating(mentor_id UUID)
RETURNS VOID AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  review_count INTEGER;
BEGIN
  SELECT 
    COALESCE(AVG(rating), 0.0)::DECIMAL(3, 2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE mentor_id = mentor_id;
  
  UPDATE expert_profiles
  SET 
    average_rating = avg_rating,
    total_reviews = review_count,
    updated_at = now()
  WHERE id = mentor_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile completeness score on profile updates
CREATE OR REPLACE FUNCTION trigger_update_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness_score := calculate_profile_completeness(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_profile_completeness ON expert_profiles;
CREATE TRIGGER update_profile_completeness
  BEFORE INSERT OR UPDATE ON expert_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_completeness();

-- Trigger to update mentor rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_mentor_rating(OLD.mentor_id);
  ELSE
    PERFORM update_mentor_rating(NEW.mentor_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on reviews table
DROP TRIGGER IF EXISTS update_mentor_rating_on_review ON reviews;
CREATE TRIGGER update_mentor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_mentor_rating();

-- Update existing profiles with completeness score
UPDATE expert_profiles 
SET profile_completeness_score = calculate_profile_completeness(id)
WHERE profile_completeness_score = 0;

-- Update existing profiles with ratings from reviews
DO $$
DECLARE
  mentor_record RECORD;
BEGIN
  FOR mentor_record IN SELECT DISTINCT id FROM expert_profiles LOOP
    PERFORM update_mentor_rating(mentor_record.id);
  END LOOP;
END $$;

-- Create view for active mentors with complete profiles
CREATE OR REPLACE VIEW active_mentor_cards AS
SELECT 
  ep.*,
  p.avatar_url,
  p.email
FROM expert_profiles ep
LEFT JOIN profiles p ON ep.id = p.id
WHERE ep.profile_status = 'active'
  AND ep.profile_completeness_score >= 60
ORDER BY ep.is_featured DESC, ep.average_rating DESC, ep.total_reviews DESC;

-- Grant access to the view
GRANT SELECT ON active_mentor_cards TO authenticated;
GRANT SELECT ON active_mentor_cards TO anon;
