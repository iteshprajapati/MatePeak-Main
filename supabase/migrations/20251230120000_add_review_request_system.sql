-- ============================================================================
-- REVIEW REQUEST SYSTEM MIGRATION
-- Adds review request tracking and automated feedback collection
-- ============================================================================

-- Add review_requested column to bookings table to track if email was sent
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMP WITH TIME ZONE;

-- Add helpful_count to reviews for community feedback
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Add is_featured flag for highlighting exceptional reviews
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_review_requested 
ON public.bookings(review_requested_at) 
WHERE review_requested_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
ON public.reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_rating 
ON public.reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_featured 
ON public.reviews(is_featured) 
WHERE is_featured = true;

-- ============================================================================
-- FUNCTION: Get completed sessions ready for review requests
-- Returns bookings that completed 30+ minutes ago and haven't been requested yet
-- ============================================================================
CREATE OR REPLACE FUNCTION get_sessions_ready_for_review()
RETURNS TABLE (
  booking_id UUID,
  student_id UUID,
  student_name TEXT,
  student_email TEXT,
  mentor_id UUID,
  mentor_name TEXT,
  scheduled_date DATE,
  scheduled_time TEXT,
  duration INTEGER,
  service_type TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    b.user_id as student_id,
    COALESCE(b.user_name, p.full_name) as student_name,
    COALESCE(b.user_email, p.email) as student_email,
    b.expert_id as mentor_id,
    ep.full_name as mentor_name,
    b.scheduled_date,
    b.scheduled_time,
    b.duration,
    b.session_type as service_type,
    b.updated_at as completed_at
  FROM public.bookings b
  LEFT JOIN public.profiles p ON p.id = b.user_id
  LEFT JOIN public.expert_profiles ep ON ep.id = b.expert_id
  WHERE 
    b.status = 'completed'
    AND b.review_requested_at IS NULL
    AND b.updated_at < NOW() - INTERVAL '30 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM public.reviews r 
      WHERE r.booking_id = b.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Mark review as requested
-- Updates booking to prevent duplicate emails
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_review_requested(p_booking_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.bookings
  SET review_requested_at = NOW()
  WHERE id = p_booking_id 
    AND review_requested_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Get mentor rating statistics
-- Returns detailed rating breakdown for a mentor
-- ============================================================================
CREATE OR REPLACE FUNCTION get_mentor_rating_stats(p_mentor_id UUID)
RETURNS TABLE (
  total_reviews INTEGER,
  average_rating NUMERIC,
  rating_5_count INTEGER,
  rating_4_count INTEGER,
  rating_3_count INTEGER,
  rating_2_count INTEGER,
  rating_1_count INTEGER,
  rating_5_percentage NUMERIC,
  rating_4_percentage NUMERIC,
  rating_3_percentage NUMERIC,
  rating_2_percentage NUMERIC,
  rating_1_percentage NUMERIC
) AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.reviews
  WHERE expert_id = p_mentor_id;

  RETURN QUERY
  SELECT 
    v_total as total_reviews,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as average_rating,
    COUNT(*) FILTER (WHERE rating = 5) as rating_5_count,
    COUNT(*) FILTER (WHERE rating = 4) as rating_4_count,
    COUNT(*) FILTER (WHERE rating = 3) as rating_3_count,
    COUNT(*) FILTER (WHERE rating = 2) as rating_2_count,
    COUNT(*) FILTER (WHERE rating = 1) as rating_1_count,
    CASE WHEN v_total > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE rating = 5)::numeric / v_total * 100), 1)
      ELSE 0 
    END as rating_5_percentage,
    CASE WHEN v_total > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE rating = 4)::numeric / v_total * 100), 1)
      ELSE 0 
    END as rating_4_percentage,
    CASE WHEN v_total > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE rating = 3)::numeric / v_total * 100), 1)
      ELSE 0 
    END as rating_3_percentage,
    CASE WHEN v_total > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE rating = 2)::numeric / v_total * 100), 1)
      ELSE 0 
    END as rating_2_percentage,
    CASE WHEN v_total > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE rating = 1)::numeric / v_total * 100), 1)
      ELSE 0 
    END as rating_1_percentage
  FROM public.reviews
  WHERE expert_id = p_mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES: Ensure reviews can be created by students
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can create reviews for their bookings" ON public.reviews;
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

-- Allow students to create reviews for their completed bookings
CREATE POLICY "Students can create reviews for their bookings"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = booking_id
      AND user_id = auth.uid()
      AND status = 'completed'
  )
);

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Users can update their own reviews (within 30 days)
CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (
  auth.uid() = user_id 
  AND created_at > NOW() - INTERVAL '30 days'
);

-- Users can delete their own reviews (within 7 days)
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (
  auth.uid() = user_id 
  AND created_at > NOW() - INTERVAL '7 days'
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION get_sessions_ready_for_review() TO service_role;
GRANT EXECUTE ON FUNCTION mark_review_requested(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_mentor_rating_stats(UUID) TO authenticated, anon;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN public.bookings.review_requested_at IS 
  'Timestamp when review request email was sent to student';

COMMENT ON COLUMN public.reviews.helpful_count IS 
  'Number of users who found this review helpful';

COMMENT ON COLUMN public.reviews.is_featured IS 
  'Flag for exceptional reviews to be highlighted in mentor profile';

COMMENT ON FUNCTION get_sessions_ready_for_review() IS 
  'Returns completed sessions that finished 30+ minutes ago and need review request emails';

COMMENT ON FUNCTION mark_review_requested(UUID) IS 
  'Marks a booking as having received a review request email';

COMMENT ON FUNCTION get_mentor_rating_stats(UUID) IS 
  'Returns detailed rating statistics and distribution for a mentor';
