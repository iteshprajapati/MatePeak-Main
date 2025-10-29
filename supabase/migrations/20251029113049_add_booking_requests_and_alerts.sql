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

-- Create availability_alerts table for alert subscriptions
CREATE TABLE IF NOT EXISTS availability_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  preferred_days TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentee_id, mentor_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_booking_requests_mentee ON booking_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_mentor ON booking_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON booking_requests(requested_date);

CREATE INDEX IF NOT EXISTS idx_availability_alerts_mentee ON availability_alerts(mentee_id);
CREATE INDEX IF NOT EXISTS idx_availability_alerts_mentor ON availability_alerts(mentor_id);
CREATE INDEX IF NOT EXISTS idx_availability_alerts_active ON availability_alerts(is_active);

-- Enable Row Level Security
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_requests
-- Mentees can view their own requests
CREATE POLICY "Users can view their own booking requests"
  ON booking_requests FOR SELECT
  USING (auth.uid() = mentee_id);

-- Mentors can view requests made to them
CREATE POLICY "Mentors can view booking requests made to them"
  ON booking_requests FOR SELECT
  USING (auth.uid() = mentor_id);

-- Mentees can create booking requests
CREATE POLICY "Users can create booking requests"
  ON booking_requests FOR INSERT
  WITH CHECK (auth.uid() = mentee_id);

-- Mentors can update status and response of requests made to them
CREATE POLICY "Mentors can update their booking requests"
  ON booking_requests FOR UPDATE
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

-- RLS Policies for availability_alerts
-- Users can view their own alert subscriptions
CREATE POLICY "Users can view their own alerts"
  ON availability_alerts FOR SELECT
  USING (auth.uid() = mentee_id);

-- Mentors can view alerts subscribed to them
CREATE POLICY "Mentors can view alerts for their profile"
  ON availability_alerts FOR SELECT
  USING (auth.uid() = mentor_id);

-- Users can create/update their own alert subscriptions
CREATE POLICY "Users can manage their own alerts"
  ON availability_alerts FOR INSERT
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Users can update their own alerts"
  ON availability_alerts FOR UPDATE
  USING (auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentee_id);

-- Users can delete their own alert subscriptions
CREATE POLICY "Users can delete their own alerts"
  ON availability_alerts FOR DELETE
  USING (auth.uid() = mentee_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_alerts_updated_at
  BEFORE UPDATE ON availability_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE booking_requests IS 'Stores custom time slot requests from mentees to mentors';
COMMENT ON TABLE availability_alerts IS 'Stores alert subscriptions for mentee notifications when mentor availability changes';
COMMENT ON COLUMN booking_requests.status IS 'Status of the booking request: pending, approved, or declined';
COMMENT ON COLUMN availability_alerts.preferred_days IS 'Array of day names (e.g., ["Monday", "Wednesday"]) for alert filtering';
