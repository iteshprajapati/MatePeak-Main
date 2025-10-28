-- Create session_messages table for mentor-student communication
CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('mentor', 'student')),
    message_text TEXT NOT NULL,
    read_by_mentor BOOLEAN DEFAULT false,
    read_by_student BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_messages_booking_id ON session_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_sender_id ON session_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages(created_at);

-- Enable RLS
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow participants to view messages for their bookings
CREATE POLICY "Users can view messages for their bookings"
    ON session_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = session_messages.booking_id
            AND (bookings.expert_id = auth.uid() OR bookings.student_id = auth.uid())
        )
    );

-- Allow participants to send messages for their bookings
CREATE POLICY "Users can send messages for their bookings"
    ON session_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_id
            AND (bookings.expert_id = auth.uid() OR bookings.student_id = auth.uid())
        )
    );

-- Allow users to update read status
CREATE POLICY "Users can update read status of messages"
    ON session_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = session_messages.booking_id
            AND (bookings.expert_id = auth.uid() OR bookings.student_id = auth.uid())
        )
    );
