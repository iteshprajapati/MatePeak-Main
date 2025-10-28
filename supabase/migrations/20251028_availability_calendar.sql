-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    specific_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_expert_id ON availability_slots(expert_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_slots_specific_date ON availability_slots(specific_date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_expert_id ON blocked_dates(expert_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- Enable RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_slots
CREATE POLICY "Experts can view their own availability slots"
    ON availability_slots FOR SELECT
    USING (auth.uid() = expert_id);

CREATE POLICY "Experts can insert their own availability slots"
    ON availability_slots FOR INSERT
    WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update their own availability slots"
    ON availability_slots FOR UPDATE
    USING (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own availability slots"
    ON availability_slots FOR DELETE
    USING (auth.uid() = expert_id);

-- RLS Policies for blocked_dates
CREATE POLICY "Experts can view their own blocked dates"
    ON blocked_dates FOR SELECT
    USING (auth.uid() = expert_id);

CREATE POLICY "Experts can insert their own blocked dates"
    ON blocked_dates FOR INSERT
    WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own blocked dates"
    ON blocked_dates FOR DELETE
    USING (auth.uid() = expert_id);

-- Allow students to view expert availability (for booking purposes)
CREATE POLICY "Anyone can view expert availability slots"
    ON availability_slots FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view blocked dates"
    ON blocked_dates FOR SELECT
    USING (true);
