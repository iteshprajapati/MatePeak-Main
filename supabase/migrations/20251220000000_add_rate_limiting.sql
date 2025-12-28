-- Rate Limiting Implementation
-- Prevents abuse and ensures platform stability

-- ============================================
-- 1. Rate Limit Tracking Table
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'booking_create',
        'booking_request',
        'message_send',
        'review_create',
        'search_query',
        'profile_update',
        'api_call'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action 
    ON rate_limit_log(user_id, action_type, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_action 
    ON rate_limit_log(ip_address, action_type, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expires 
    ON rate_limit_log(expires_at);

-- Enable RLS
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own rate limit logs
CREATE POLICY "Users can view own rate limits"
    ON rate_limit_log FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 2. Rate Limit Configuration Table
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limit_config (
    action_type TEXT PRIMARY KEY,
    max_requests INTEGER NOT NULL,
    time_window_minutes INTEGER NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rate limits
INSERT INTO rate_limit_config (action_type, max_requests, time_window_minutes, description)
VALUES
    ('booking_create', 20, 60, 'Max 20 booking requests per hour'),
    ('booking_request', 10, 60, 'Max 10 booking-related actions per hour'),
    ('message_send', 30, 60, 'Max 30 messages per hour'),
    ('review_create', 3, 60, 'Max 3 reviews per hour'),
    ('search_query', 100, 1, 'Max 100 searches per minute'),
    ('profile_update', 10, 60, 'Max 10 profile updates per hour'),
    ('api_call', 60, 1, 'Max 60 API calls per minute')
ON CONFLICT (action_type) DO NOTHING;

-- ============================================
-- 3. Rate Limit Check Function
-- ============================================

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_ip_address TEXT,
    p_action_type TEXT
) RETURNS JSONB AS $$
DECLARE
    v_max_requests INTEGER;
    v_time_window_minutes INTEGER;
    v_current_count INTEGER;
    v_cutoff_time TIMESTAMPTZ;
BEGIN
    -- Get rate limit config
    SELECT max_requests, time_window_minutes
    INTO v_max_requests, v_time_window_minutes
    FROM rate_limit_config
    WHERE action_type = p_action_type;

    -- If no config found, use default (allow)
    IF v_max_requests IS NULL THEN
        v_max_requests := 1000;
        v_time_window_minutes := 60;
    END IF;

    -- Calculate cutoff time
    v_cutoff_time := NOW() - (v_time_window_minutes || ' minutes')::INTERVAL;

    -- Count requests in time window (check both user_id and ip_address)
    SELECT COUNT(*)
    INTO v_current_count
    FROM rate_limit_log
    WHERE action_type = p_action_type
        AND created_at > v_cutoff_time
        AND (
            (user_id = p_user_id AND p_user_id IS NOT NULL)
            OR (ip_address = p_ip_address AND p_ip_address IS NOT NULL)
        );

    -- Check if limit exceeded
    IF v_current_count >= v_max_requests THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'current_count', v_current_count,
            'max_requests', v_max_requests,
            'time_window_minutes', v_time_window_minutes,
            'retry_after_seconds', (v_time_window_minutes * 60),
            'message', format('Rate limit exceeded. Max %s requests per %s minutes.', 
                v_max_requests, v_time_window_minutes)
        );
    END IF;

    -- Log the request
    INSERT INTO rate_limit_log (user_id, ip_address, action_type)
    VALUES (p_user_id, p_ip_address, p_action_type);

    -- Return success
    RETURN jsonb_build_object(
        'allowed', true,
        'current_count', v_current_count + 1,
        'max_requests', v_max_requests,
        'time_window_minutes', v_time_window_minutes,
        'remaining', v_max_requests - v_current_count - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Cleanup Function (Remove Expired Logs)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limit_log
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Scheduled Cleanup (Run every hour)
-- ============================================

-- Note: This requires pg_cron extension
-- For production, set up a cron job or Edge Function to call this
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_rate_limit_logs()');

-- ============================================
-- 6. Helper Function - Get Rate Limit Status
-- ============================================

CREATE OR REPLACE FUNCTION get_rate_limit_status(
    p_user_id UUID,
    p_action_type TEXT
) RETURNS JSONB AS $$
DECLARE
    v_max_requests INTEGER;
    v_time_window_minutes INTEGER;
    v_current_count INTEGER;
    v_cutoff_time TIMESTAMPTZ;
BEGIN
    -- Get rate limit config
    SELECT max_requests, time_window_minutes
    INTO v_max_requests, v_time_window_minutes
    FROM rate_limit_config
    WHERE action_type = p_action_type;

    IF v_max_requests IS NULL THEN
        RETURN jsonb_build_object('error', 'Invalid action type');
    END IF;

    -- Calculate cutoff time
    v_cutoff_time := NOW() - (v_time_window_minutes || ' minutes')::INTERVAL;

    -- Count current requests
    SELECT COUNT(*)
    INTO v_current_count
    FROM rate_limit_log
    WHERE action_type = p_action_type
        AND user_id = p_user_id
        AND created_at > v_cutoff_time;

    RETURN jsonb_build_object(
        'action_type', p_action_type,
        'current_count', v_current_count,
        'max_requests', v_max_requests,
        'remaining', GREATEST(0, v_max_requests - v_current_count),
        'time_window_minutes', v_time_window_minutes,
        'resets_at', v_cutoff_time + (v_time_window_minutes || ' minutes')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Grant Permissions
-- ============================================

-- Allow authenticated users to check their rate limits
GRANT SELECT ON rate_limit_config TO authenticated;
GRANT EXECUTE ON FUNCTION get_rate_limit_status(UUID, TEXT) TO authenticated;

-- ============================================
-- 8. Comments
-- ============================================

COMMENT ON TABLE rate_limit_log IS 'Tracks API requests for rate limiting';
COMMENT ON TABLE rate_limit_config IS 'Configuration for rate limits per action type';
COMMENT ON FUNCTION check_rate_limit IS 'Check if user/IP has exceeded rate limit for an action';
COMMENT ON FUNCTION cleanup_rate_limit_logs IS 'Remove expired rate limit logs';
COMMENT ON FUNCTION get_rate_limit_status IS 'Get current rate limit status for a user';
