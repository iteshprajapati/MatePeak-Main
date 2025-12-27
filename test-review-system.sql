-- ============================================================================
-- MANUAL TESTING SCRIPT FOR REVIEW REQUEST SYSTEM
-- Use this to test the review system without waiting for real sessions
-- ============================================================================

-- ============================================================================
-- STEP 1: Create a test completed session (if needed)
-- ============================================================================

-- Replace these values with your test data:
-- YOUR_STUDENT_ID: UUID of test student user
-- YOUR_MENTOR_ID: UUID of test mentor user
-- YOUR_BOOKING_ID: UUID of a test booking (or create one)

-- Option A: Update existing booking to be completed
UPDATE bookings 
SET 
  status = 'completed',
  updated_at = NOW() - INTERVAL '35 minutes',  -- 35 minutes ago (past the 30-min threshold)
  review_requested_at = NULL  -- Reset so email can be sent
WHERE id = 'YOUR_BOOKING_ID';

-- Option B: Create a new test booking (if needed)
INSERT INTO bookings (
  user_id,
  expert_id,
  session_type,
  scheduled_date,
  scheduled_time,
  duration,
  status,
  total_amount,
  user_name,
  user_email,
  created_at,
  updated_at
) VALUES (
  'YOUR_STUDENT_ID',
  'YOUR_MENTOR_ID',
  'Test Session',
  CURRENT_DATE - INTERVAL '1 day',
  '10:00',
  60,
  'completed',
  100,
  'Test Student',
  'student@test.com',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '35 minutes'
);

-- ============================================================================
-- STEP 2: Verify session is ready for review request
-- ============================================================================

-- Check if session meets criteria
SELECT * FROM get_sessions_ready_for_review();

-- Should return the test booking if:
-- ✅ status = 'completed'
-- ✅ review_requested_at IS NULL
-- ✅ updated_at > 30 minutes ago
-- ✅ No existing review

-- ============================================================================
-- STEP 3: Manually trigger review request (simulate Edge Function)
-- ============================================================================

-- Mark as review requested (simulates email being sent)
SELECT mark_review_requested('YOUR_BOOKING_ID');

-- Verify it was marked
SELECT id, status, updated_at, review_requested_at 
FROM bookings 
WHERE id = 'YOUR_BOOKING_ID';

-- ============================================================================
-- STEP 4: Create a test review (simulate student submission)
-- ============================================================================

-- Insert test review
INSERT INTO reviews (
  booking_id,
  expert_id,
  user_id,
  rating,
  comment
) VALUES (
  'YOUR_BOOKING_ID',
  'YOUR_MENTOR_ID',
  'YOUR_STUDENT_ID',
  5,
  'Amazing session! Really helped me understand the concepts. The mentor was patient and explained everything clearly.'
);

-- ============================================================================
-- STEP 5: Verify review appears correctly
-- ============================================================================

-- Check review with student profile
SELECT 
  r.*,
  p.full_name,
  p.avatar_url
FROM reviews r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.booking_id = 'YOUR_BOOKING_ID';

-- Get mentor rating statistics
SELECT * FROM get_mentor_rating_stats('YOUR_MENTOR_ID');

-- ============================================================================
-- STEP 6: Test mentor reply
-- ============================================================================

-- Simulate mentor replying to review
UPDATE reviews
SET 
  mentor_reply = 'Thank you for the wonderful feedback! It was great working with you.',
  replied_at = NOW()
WHERE booking_id = 'YOUR_BOOKING_ID';

-- ============================================================================
-- STEP 7: Clean up test data (if needed)
-- ============================================================================

-- Delete test review
-- DELETE FROM reviews WHERE booking_id = 'YOUR_BOOKING_ID';

-- Reset booking
-- UPDATE bookings 
-- SET review_requested_at = NULL 
-- WHERE id = 'YOUR_BOOKING_ID';

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- See all reviews for a mentor
SELECT 
  r.id,
  r.rating,
  r.comment,
  r.mentor_reply,
  r.created_at,
  p.full_name as student_name
FROM reviews r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.expert_id = 'YOUR_MENTOR_ID'
ORDER BY r.created_at DESC;

-- Count reviews by rating
SELECT 
  rating,
  COUNT(*) as count
FROM reviews
WHERE expert_id = 'YOUR_MENTOR_ID'
GROUP BY rating
ORDER BY rating DESC;

-- See which sessions need review requests
SELECT 
  b.id,
  b.status,
  b.updated_at,
  b.review_requested_at,
  b.user_name,
  b.user_email,
  EXISTS(SELECT 1 FROM reviews WHERE booking_id = b.id) as has_review
FROM bookings b
WHERE b.status = 'completed'
  AND b.updated_at < NOW() - INTERVAL '30 minutes'
ORDER BY b.updated_at DESC;

-- Check email send rate
SELECT 
  DATE(review_requested_at) as date,
  COUNT(*) as emails_sent
FROM bookings
WHERE review_requested_at IS NOT NULL
GROUP BY DATE(review_requested_at)
ORDER BY date DESC;

-- Review completion rate
SELECT 
  COUNT(CASE WHEN review_requested_at IS NOT NULL THEN 1 END) as emails_sent,
  COUNT(r.id) as reviews_received,
  ROUND(
    COUNT(r.id)::numeric / 
    NULLIF(COUNT(CASE WHEN review_requested_at IS NOT NULL THEN 1 END), 0) * 100, 
    2
  ) as completion_rate_percentage
FROM bookings b
LEFT JOIN reviews r ON r.booking_id = b.id
WHERE b.status = 'completed';

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Check RLS policies on reviews table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reviews';

-- Check if reviews table exists and has data
SELECT 
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  COUNT(DISTINCT expert_id) as mentors_with_reviews
FROM reviews;

-- Check bookings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('review_requested_at', 'user_name', 'user_email')
ORDER BY ordinal_position;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
IMPORTANT: Before running in production:

1. Test with real user accounts
2. Verify email delivery (check Resend dashboard)
3. Test review submission from frontend
4. Verify reviews appear in mentor dashboard
5. Check public profile displays reviews
6. Test mentor reply functionality
7. Monitor database performance with indexes

CRON JOB SETUP:
Run every 15 minutes to check for completed sessions:

SELECT cron.schedule(
  'send-review-requests',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/send-review-requests',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);
*/
