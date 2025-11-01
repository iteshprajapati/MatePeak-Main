-- Add meeting link columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_provider VARCHAR(50) DEFAULT 'jitsi',
ADD COLUMN IF NOT EXISTS meeting_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT FALSE;

-- Add index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_bookings_reminders 
ON bookings(scheduled_date, scheduled_time, status, reminder_24h_sent, reminder_1h_sent);

-- Add comment for documentation
COMMENT ON COLUMN bookings.meeting_link IS 'Full URL to the video meeting (Jitsi, Zoom, Google Meet)';
COMMENT ON COLUMN bookings.meeting_provider IS 'Video meeting provider: jitsi, zoom, google_meet';
COMMENT ON COLUMN bookings.meeting_id IS 'Unique meeting/room ID from the provider';
COMMENT ON COLUMN bookings.reminder_24h_sent IS 'Whether 24-hour reminder email was sent';
COMMENT ON COLUMN bookings.reminder_1h_sent IS 'Whether 1-hour reminder email was sent';
