-- =====================================================
-- DIAGNOSTIC: Check Booking System Status
-- =====================================================
-- Run this AFTER running fix-booking-error.sql
-- to verify everything is working correctly
-- =====================================================

-- 1. Check if bookings table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'bookings'
    ) THEN '✅ bookings table exists'
    ELSE '❌ bookings table NOT FOUND'
  END as table_status;

-- 2. Check all required columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN ('user_id', 'expert_id', 'session_type', 'scheduled_date', 'scheduled_time', 
                         'duration', 'total_amount', 'status', 'payment_status', 'user_name', 
                         'user_email', 'price_verified', 'meeting_link') 
    THEN '✅ Required'
    ELSE '   Optional'
  END as importance
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY 
  CASE 
    WHEN column_name IN ('user_id', 'expert_id', 'session_type', 'scheduled_date', 'scheduled_time', 
                         'duration', 'total_amount', 'status', 'payment_status', 'user_name', 
                         'user_email', 'price_verified', 'meeting_link') 
    THEN 0
    ELSE 1
  END,
  ordinal_position;

-- 3. Check payment_status constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition,
  CASE 
    WHEN pg_get_constraintdef(con.oid) LIKE '%free%' 
    THEN '✅ Contains "free" option'
    ELSE '⚠️ Missing "free" option'
  END as status
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'bookings'
  AND con.conname LIKE '%payment_status%';

-- 4. Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS enabled'
    ELSE '⚠️ RLS not enabled'
  END as status
FROM pg_tables
WHERE tablename = 'bookings';

-- 5. List all RLS policies
SELECT 
  policyname as policy_name,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ Read access'
    WHEN cmd = 'INSERT' THEN '✅ Create booking'
    WHEN cmd = 'UPDATE' THEN '✅ Update booking'
    WHEN cmd = 'DELETE' THEN '✅ Delete booking'
    ELSE cmd
  END as description
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY cmd;

-- 6. Count existing bookings
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  COUNT(CASE WHEN payment_status = 'free' THEN 1 END) as free_bookings
FROM bookings;

-- 7. Check for any constraint violations in existing data
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM bookings
  WHERE payment_status NOT IN ('pending', 'completed', 'paid', 'failed', 'refunded', 'free')
     OR payment_status IS NULL;
  
  IF invalid_count > 0 THEN
    RAISE WARNING '⚠️ Found % bookings with invalid payment_status', invalid_count;
  ELSE
    RAISE NOTICE '✅ All bookings have valid payment_status';
  END IF;
END $$;

-- 8. Final Summary
DO $$
DECLARE
  required_columns INTEGER;
  has_constraint BOOLEAN;
  has_policies BOOLEAN;
BEGIN
  -- Count required columns
  SELECT COUNT(*) INTO required_columns
  FROM information_schema.columns 
  WHERE table_name = 'bookings'
  AND column_name IN ('user_id', 'expert_id', 'session_type', 'scheduled_date', 
                     'scheduled_time', 'duration', 'total_amount', 'status', 
                     'payment_status', 'user_name', 'user_email', 'price_verified', 'meeting_link');
  
  -- Check for payment_status constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'bookings'
      AND con.conname LIKE '%payment_status%'
      AND pg_get_constraintdef(con.oid) LIKE '%free%'
  ) INTO has_constraint;
  
  -- Check for RLS policies
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings'
  ) INTO has_policies;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '         BOOKING SYSTEM STATUS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Required columns: % / 13', required_columns;
  RAISE NOTICE 'Payment constraint: %', CASE WHEN has_constraint THEN '✅ OK' ELSE '❌ Missing' END;
  RAISE NOTICE 'RLS policies: %', CASE WHEN has_policies THEN '✅ OK' ELSE '❌ Missing' END;
  RAISE NOTICE '';
  
  IF required_columns = 13 AND has_constraint AND has_policies THEN
    RAISE NOTICE '🎉 ALL SYSTEMS GO! Ready to accept bookings!';
  ELSE
    RAISE WARNING '⚠️ Some issues detected. Run fix-booking-error.sql';
  END IF;
  RAISE NOTICE '========================================';
END $$;
