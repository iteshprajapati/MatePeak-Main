-- Add email tracking columns for email notification system
-- Date: 2025-11-01

-- Add email tracking columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- Add index for efficient querying of reminders
CREATE INDEX IF NOT EXISTS idx_bookings_reminders 
ON bookings(scheduled_date, scheduled_time, status)
WHERE reminder_24h_sent = FALSE OR reminder_1h_sent = FALSE;

-- Add index for follow-ups
CREATE INDEX IF NOT EXISTS idx_bookings_followup
ON bookings(scheduled_date, status)
WHERE followup_sent = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN bookings.reminder_24h_sent IS 'Whether 24-hour reminder email has been sent';
COMMENT ON COLUMN bookings.reminder_1h_sent IS 'Whether 1-hour reminder email has been sent';
COMMENT ON COLUMN bookings.followup_sent IS 'Whether follow-up email has been sent after session';
COMMENT ON COLUMN bookings.confirmation_email_sent IS 'Whether booking confirmation email has been sent';
COMMENT ON COLUMN bookings.meeting_link IS 'Video call meeting link (Zoom, Google Meet, etc.)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Email tracking columns added successfully';
END $$;
