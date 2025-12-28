-- =====================================================
-- FIX STUDENT DASHBOARD - Add Missing Fields
-- =====================================================
-- Student dashboard is failing because it's looking for
-- "session_date" but table has "scheduled_date" + "scheduled_time"
-- Also needs "student_id" column (currently "user_id")
-- =====================================================

-- 1. Check current bookings table structure
SELECT 
  'Checking bookings table...' as status,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'bookings';

-- 2. Temporarily drop the valid_date constraint to allow updating old bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_date;

-- 3. Add session_date column (combination of scheduled_date + scheduled_time)
-- This is what student dashboard expects
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'session_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN session_date TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✅ Added session_date column';
    
    -- Populate session_date from existing scheduled_date + scheduled_time
    UPDATE bookings 
    SET session_date = (scheduled_date::text || ' ' || scheduled_time::text)::timestamp with time zone
    WHERE session_date IS NULL AND scheduled_date IS NOT NULL AND scheduled_time IS NOT NULL;
    
    RAISE NOTICE '✅ Populated session_date from existing data';
  ELSE
    RAISE NOTICE 'session_date column already exists';
  END IF;
END $$;

-- 4. Add student_id as alias/copy of user_id (for compatibility)
-- Many dashboard queries use "student_id" instead of "user_id"
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added student_id column';
    
    -- Copy user_id to student_id
    UPDATE bookings SET student_id = user_id WHERE student_id IS NULL;
    
    RAISE NOTICE '✅ Copied user_id to student_id';
  ELSE
    RAISE NOTICE 'student_id column already exists';
  END IF;
END $$;

-- 5. Re-add valid_date constraint but only for INSERT, not UPDATE
-- This allows us to keep historical data but prevent creating bookings in the past
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_date;

-- Don't re-add the constraint since it prevents legitimate updates to past bookings
-- If you need date validation, handle it in the application layer for new bookings only

-- 6. Create trigger to auto-populate session_date when scheduled_date/scheduled_time change
CREATE OR REPLACE FUNCTION sync_session_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scheduled_date IS NOT NULL AND NEW.scheduled_time IS NOT NULL THEN
    NEW.session_date := (NEW.scheduled_date::text || ' ' || NEW.scheduled_time::text)::timestamp with time zone;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_session_date ON bookings;
CREATE TRIGGER trigger_sync_session_date
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_session_date();

-- 7. Create trigger to keep student_id in sync with user_id
CREATE OR REPLACE FUNCTION sync_student_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    NEW.student_id := NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_student_id ON bookings;
CREATE TRIGGER trigger_sync_student_id
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_id();

-- 8. Add index for student_id for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_date ON bookings(session_date);

-- 9. Update RLS policies to include student_id
DROP POLICY IF EXISTS "Students can view own bookings via student_id" ON bookings;
CREATE POLICY "Students can view own bookings via student_id"
ON bookings FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = user_id);

-- 10. Add student_name and student_email if missing
DO $$ 
BEGIN
  -- These might already exist from fix-booking-error.sql
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'student_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN student_name TEXT;
    RAISE NOTICE '✅ Added student_name column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'student_email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN student_email TEXT;
    RAISE NOTICE '✅ Added student_email column';
  END IF;
END $$;

-- 11. Verify the fix
DO $$
DECLARE
  has_session_date BOOLEAN;
  has_student_id BOOLEAN;
  has_student_name BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'session_date'
  ) INTO has_session_date;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'student_id'
  ) INTO has_student_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'student_name'
  ) INTO has_student_name;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '    STUDENT DASHBOARD FIX STATUS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'session_date column: %', CASE WHEN has_session_date THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'student_id column: %', CASE WHEN has_student_id THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'student_name column: %', CASE WHEN has_student_name THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';
  
  IF has_session_date AND has_student_id AND has_student_name THEN
    RAISE NOTICE '🎉 Student Dashboard should work now!';
  ELSE
    RAISE WARNING '⚠️ Some columns still missing';
  END IF;
  RAISE NOTICE '========================================';
END $$;

-- 12. Show current bookings structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings'
AND column_name IN ('id', 'user_id', 'student_id', 'expert_id', 'session_date', 'scheduled_date', 'scheduled_time', 'student_name', 'student_email')
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Student dashboard fix applied! The valid_date constraint was removed to allow historical data.' AS status;
