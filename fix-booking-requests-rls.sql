-- =====================================================
-- FIX RLS Policies for booking_requests
-- =====================================================
-- Run this if you're getting "Failed to load requests"
-- even after creating the table
-- =====================================================

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Users can view their own booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Mentors can view booking requests made to them" ON booking_requests;
DROP POLICY IF EXISTS "Users can create booking requests" ON booking_requests;
DROP POLICY IF EXISTS "Mentors can update their booking requests" ON booking_requests;

-- Policy 1: Mentees can view their own requests
CREATE POLICY "Users can view their own booking requests"
  ON booking_requests FOR SELECT
  USING (auth.uid() = mentee_id);

-- Policy 2: Mentors can view ALL requests made to them (this is the key fix)
CREATE POLICY "Mentors can view booking requests made to them"
  ON booking_requests FOR SELECT
  USING (auth.uid() = mentor_id);

-- Policy 3: Anyone authenticated can create booking requests
CREATE POLICY "Users can create booking requests"
  ON booking_requests FOR INSERT
  WITH CHECK (auth.uid() = mentee_id);

-- Policy 4: Mentors can update requests made to them
CREATE POLICY "Mentors can update their booking requests"
  ON booking_requests FOR UPDATE
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

-- Verify policies are created
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
WHERE tablename = 'booking_requests';

-- Check if RLS is enabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'booking_requests';
