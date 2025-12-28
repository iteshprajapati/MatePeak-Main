-- Update booking rate limit from 5 to 20 requests per hour
-- Migration created: 2025-12-29

UPDATE rate_limit_config 
SET 
    max_requests = 20,
    description = 'Max 20 booking requests per hour',
    updated_at = NOW()
WHERE action_type = 'booking_create';
