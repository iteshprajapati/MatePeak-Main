-- =====================================================
-- CHECK IF BOOKING EXISTS
-- =====================================================
-- Run this to check if your recent booking was created
-- =====================================================

-- 1. Check if any bookings exist
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as bookings_last_hour,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as bookings_today
FROM bookings;

-- 2. Show most recent bookings (last 5)
SELECT 
  id,
  user_id,
  expert_id,
  session_type,
  scheduled_date,
  scheduled_time,
  status,
  payment_status,
  user_name,
  user_email,
  meeting_link,
  created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check specific booking (replace with your booking ID)
-- Copy the ID from the URL: /booking-confirmed/YOUR-ID-HERE
SELECT 
  id,
  user_id,
  expert_id,
  session_type,
  scheduled_date,
  scheduled_time,
  duration,
  status,
  payment_status,
  total_amount,
  user_name,
  user_email,
  meeting_link,
  created_at
FROM bookings
WHERE id = '512203f8-3096-4832-b25e-37b42c18088a'  -- Replace with your booking ID
LIMIT 1;

-- 4. If booking doesn't exist, check what went wrong
-- Look for any recent errors or constraint violations
SELECT 
  'If you see no results above, the booking was not created.' as status,
  'Run fix-booking-error.sql and try creating a NEW booking.' as action;
