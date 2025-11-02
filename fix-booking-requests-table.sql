-- =====================================================
-- QUICK FIX: Create booking_requests Table
-- =====================================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- and run it to fix the "table not found" error
-- =====================================================

-- Create booking_requests table for custom time requests
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_start_time TIME NOT NULL,
  requested_end_time TIME NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  mentor_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_booking_requests_mentee ON booking_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_mentor ON booking_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON booking_requests(requested_date);

-- Enable Row Level Security
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_requests using DO blocks to avoid conflicts
DO $$ 
BEGIN
  -- Mentees can view their own requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'booking_requests' 
    AND policyname = 'Users can view their own booking requests'
  ) THEN
    CREATE POLICY "Users can view their own booking requests"
      ON booking_requests FOR SELECT
      USING (auth.uid() = mentee_id);
  END IF;

  -- Mentors can view requests made to them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'booking_requests' 
    AND policyname = 'Mentors can view booking requests made to them'
  ) THEN
    CREATE POLICY "Mentors can view booking requests made to them"
      ON booking_requests FOR SELECT
      USING (auth.uid() = mentor_id);
  END IF;

  -- Mentees can create booking requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'booking_requests' 
    AND policyname = 'Users can create booking requests'
  ) THEN
    CREATE POLICY "Users can create booking requests"
      ON booking_requests FOR INSERT
      WITH CHECK (auth.uid() = mentee_id);
  END IF;

  -- Mentors can update status and response of requests made to them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'booking_requests' 
    AND policyname = 'Mentors can update their booking requests'
  ) THEN
    CREATE POLICY "Mentors can update their booking requests"
      ON booking_requests FOR UPDATE
      USING (auth.uid() = mentor_id)
      WITH CHECK (auth.uid() = mentor_id);
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at (using DO block to check if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_booking_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_booking_requests_updated_at
      BEFORE UPDATE ON booking_requests
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE booking_requests IS 'Stores custom time slot requests from mentees to mentors';
COMMENT ON COLUMN booking_requests.status IS 'Status of the booking request: pending, approved, or declined';

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'booking_requests'
ORDER BY ordinal_position;
