-- Add missing columns and security enhancements to bookings table
-- Date: 2025-11-01

-- Add missing user data columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_phone TEXT;

-- Add payment tracking columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));

-- Add timezone tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS user_timezone TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS mentor_timezone TEXT DEFAULT 'Asia/Kolkata';

-- Add cancellation tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Add verification flag for server-validated bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS price_verified BOOLEAN DEFAULT false;

-- Add constraints for data validation
ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS valid_duration 
  CHECK (duration >= 15 AND duration <= 240);

ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS valid_amount 
  CHECK (total_amount >= 0 AND total_amount <= 100000);

ALTER TABLE bookings 
ADD CONSTRAINT IF NOT EXISTS valid_date 
  CHECK (scheduled_date >= CURRENT_DATE - INTERVAL '1 day');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_bookings_price_verified ON bookings(price_verified);

-- Add comments
COMMENT ON COLUMN bookings.user_name IS 'User full name at time of booking';
COMMENT ON COLUMN bookings.user_email IS 'User email at time of booking';
COMMENT ON COLUMN bookings.user_phone IS 'User phone number (optional)';
COMMENT ON COLUMN bookings.payment_id IS 'Payment gateway transaction ID';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN bookings.user_timezone IS 'Timezone of the user booking';
COMMENT ON COLUMN bookings.mentor_timezone IS 'Timezone of the mentor';
COMMENT ON COLUMN bookings.price_verified IS 'Whether the price was verified server-side';

-- Update existing bookings to have price_verified = false
UPDATE bookings SET price_verified = false WHERE price_verified IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Booking security columns added successfully';
END $$;
