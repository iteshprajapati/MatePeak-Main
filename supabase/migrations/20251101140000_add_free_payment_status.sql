-- Migration: Add 'free' to payment_status check constraint for beta bookings
-- Date: 2025-11-01
-- Purpose: Allow free bookings during beta period without payment

-- Drop all possible existing constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_payment_status;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check1;

-- Remove the check constraint from the column definition if it exists
ALTER TABLE bookings ALTER COLUMN payment_status DROP DEFAULT;
ALTER TABLE bookings ALTER COLUMN payment_status SET DEFAULT 'pending';

-- Add the new constraint with 'free' option
ALTER TABLE bookings
ADD CONSTRAINT bookings_payment_status_check
CHECK (payment_status IN ('pending', 'completed', 'paid', 'failed', 'refunded', 'free'));

-- Update comment to reflect the new option
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, completed, paid, failed, refunded, free (beta)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added "free" payment status option for beta bookings';
END $$;
