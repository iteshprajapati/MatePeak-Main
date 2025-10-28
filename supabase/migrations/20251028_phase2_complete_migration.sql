-- ============================================================================
-- PHASE 2: COMPLETE DATABASE MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: ALTER EXISTING TABLES
-- ============================================================================

-- Add student information to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Add mentor reply field to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS mentor_reply TEXT;

-- ============================================================================
-- PART 2: CREATE NEW TABLES
-- ============================================================================

-- Table: availability_slots
-- Stores mentor availability (recurring weekly or specific dates)
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT false, -- true for weekly recurring, false for specific date
  specific_date DATE, -- NULL for recurring, set for specific date slots
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: blocked_dates
-- Stores dates when mentor is unavailable (vacations, etc.)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: student_notes
-- Stores mentor's private notes about students
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL, -- References user who booked
  notes TEXT,
  tags TEXT[], -- Array of string tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(expert_id, student_id) -- One note record per student per expert
);

-- Table: session_messages
-- Stores messages between mentor and student for specific bookings
CREATE TABLE IF NOT EXISTS session_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- User ID who sent the message
  sender_type TEXT NOT NULL CHECK (sender_type IN ('mentor', 'student')),
  message_text TEXT NOT NULL,
  read_by_mentor BOOLEAN DEFAULT false,
  read_by_student BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- PART 3: CREATE INDEXES
-- ============================================================================

-- Indexes for availability_slots
CREATE INDEX IF NOT EXISTS idx_availability_slots_expert_id ON availability_slots(expert_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_slots_specific_date ON availability_slots(specific_date);

-- Indexes for blocked_dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_expert_id ON blocked_dates(expert_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- Indexes for student_notes
CREATE INDEX IF NOT EXISTS idx_student_notes_expert_id ON student_notes(expert_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);

-- Indexes for session_messages
CREATE INDEX IF NOT EXISTS idx_session_messages_booking_id ON session_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_sender_id ON session_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages(created_at);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES - availability_slots
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Experts can manage their own availability slots" ON availability_slots;
DROP POLICY IF EXISTS "Anyone can view availability slots" ON availability_slots;

-- Experts can manage (CRUD) their own availability slots
CREATE POLICY "Experts can manage their own availability slots"
  ON availability_slots FOR ALL
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

-- Anyone can view availability slots (for booking purposes)
CREATE POLICY "Anyone can view availability slots"
  ON availability_slots FOR SELECT
  USING (true);

-- ============================================================================
-- PART 6: CREATE RLS POLICIES - blocked_dates
-- ============================================================================

DROP POLICY IF EXISTS "Experts can manage their own blocked dates" ON blocked_dates;
DROP POLICY IF EXISTS "Anyone can view blocked dates" ON blocked_dates;

-- Experts can manage their own blocked dates
CREATE POLICY "Experts can manage their own blocked dates"
  ON blocked_dates FOR ALL
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

-- Anyone can view blocked dates (for booking purposes)
CREATE POLICY "Anyone can view blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

-- ============================================================================
-- PART 7: CREATE RLS POLICIES - student_notes
-- ============================================================================

DROP POLICY IF EXISTS "Experts can manage their own student notes" ON student_notes;

-- Experts can manage their own student notes (completely private)
CREATE POLICY "Experts can manage their own student notes"
  ON student_notes FOR ALL
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

-- ============================================================================
-- PART 8: CREATE RLS POLICIES - session_messages
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own session messages" ON session_messages;
DROP POLICY IF EXISTS "Users can send messages for their bookings" ON session_messages;
DROP POLICY IF EXISTS "Users can update read status" ON session_messages;

-- Users can view messages for their own bookings
CREATE POLICY "Users can view their own session messages"
  ON session_messages FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE expert_id = auth.uid() OR user_id = auth.uid()
    )
  );

-- Users can send messages for their bookings
CREATE POLICY "Users can send messages for their bookings"
  ON session_messages FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE expert_id = auth.uid() OR user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- Users can update read status for their messages
CREATE POLICY "Users can update read status"
  ON session_messages FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE expert_id = auth.uid() OR user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 9: ENABLE REALTIME FOR session_messages
-- ============================================================================

-- Enable realtime publication for session_messages
ALTER PUBLICATION supabase_realtime ADD TABLE session_messages;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run after to verify)
-- ============================================================================

-- Uncomment to verify tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('availability_slots', 'blocked_dates', 'student_notes', 'session_messages');

-- Uncomment to verify columns were added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('student_name', 'student_email');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'mentor_reply';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
