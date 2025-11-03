-- Migration: Ensure bookings table for mentor session calendar
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL,
  student_name TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT,
  session_type TEXT,
  total_amount NUMERIC
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='scheduled_date') THEN
    ALTER TABLE bookings ADD COLUMN scheduled_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='scheduled_time') THEN
    ALTER TABLE bookings ADD COLUMN scheduled_time TIME;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='student_name') THEN
    ALTER TABLE bookings ADD COLUMN student_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='session_type') THEN
    ALTER TABLE bookings ADD COLUMN session_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='total_amount') THEN
    ALTER TABLE bookings ADD COLUMN total_amount NUMERIC;
  END IF;
END $$;

-- Index for mentor calendar queries
CREATE INDEX IF NOT EXISTS idx_bookings_expert_id ON bookings(expert_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
