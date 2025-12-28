-- =====================================================
-- FIX BOOKING ERROR - Comprehensive Fix
-- =====================================================
-- This fixes the "booking not successful" error
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. First, let's check current bookings table structure
DO $$
BEGIN
  RAISE NOTICE 'Checking bookings table structure...';
END $$;

-- 2. Drop ALL existing payment_status constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_payment_status;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check1;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_payment_status;

-- 3. Ensure payment_status column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
    RAISE NOTICE 'Added payment_status column';
  ELSE
    RAISE NOTICE 'payment_status column already exists';
  END IF;
END $$;

-- 4. Set default for payment_status
ALTER TABLE bookings ALTER COLUMN payment_status DROP DEFAULT;
ALTER TABLE bookings ALTER COLUMN payment_status SET DEFAULT 'pending';

-- 5. Add the correct constraint with all valid values
ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check
CHECK (payment_status IN ('pending', 'completed', 'paid', 'failed', 'refunded', 'free'));

-- 6. Ensure all required columns exist for booking creation
DO $$ 
BEGIN
  -- user_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_name TEXT;
    RAISE NOTICE 'Added user_name column';
  END IF;

  -- user_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_email TEXT;
    RAISE NOTICE 'Added user_email column';
  END IF;

  -- user_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_phone TEXT;
    RAISE NOTICE 'Added user_phone column';
  END IF;

  -- price_verified
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'price_verified'
  ) THEN
    ALTER TABLE bookings ADD COLUMN price_verified BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added price_verified column';
  END IF;

  -- meeting_link
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'meeting_link'
  ) THEN
    ALTER TABLE bookings ADD COLUMN meeting_link TEXT;
    RAISE NOTICE 'Added meeting_link column';
  END IF;

  -- meeting_provider
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'meeting_provider'
  ) THEN
    ALTER TABLE bookings ADD COLUMN meeting_provider TEXT;
    RAISE NOTICE 'Added meeting_provider column';
  END IF;

  -- meeting_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'meeting_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN meeting_id TEXT;
    RAISE NOTICE 'Added meeting_id column';
  END IF;
END $$;

-- 7. Check RLS policies are correct
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Mentors can view bookings made to them" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

-- Users can view bookings they're involved in
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = expert_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 8. Add helpful comments
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, completed, paid, failed, refunded, free (for beta testing)';
COMMENT ON COLUMN bookings.price_verified IS 'Whether the price was verified server-side to prevent manipulation';

-- 9. Verify the fix
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns 
  WHERE table_name = 'bookings' 
  AND column_name IN ('payment_status', 'user_name', 'user_email', 'price_verified', 'meeting_link');
  
  IF col_count = 5 THEN
    RAISE NOTICE '✅ All required columns exist!';
  ELSE
    RAISE WARNING '⚠️ Some columns may be missing. Found % of 5 required columns', col_count;
  END IF;
END $$;

-- 10. Display current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Booking error fix applied successfully! Try creating a booking now.' AS status;
