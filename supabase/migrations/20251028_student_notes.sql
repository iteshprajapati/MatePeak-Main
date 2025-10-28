-- Create student_notes table for mentor's private notes
CREATE TABLE IF NOT EXISTS student_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(expert_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_notes_expert_id ON student_notes(expert_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);

-- Enable RLS
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Experts can view their own student notes"
    ON student_notes FOR SELECT
    USING (auth.uid() = expert_id);

CREATE POLICY "Experts can insert their own student notes"
    ON student_notes FOR INSERT
    WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update their own student notes"
    ON student_notes FOR UPDATE
    USING (auth.uid() = expert_id);

CREATE POLICY "Experts can delete their own student notes"
    ON student_notes FOR DELETE
    USING (auth.uid() = expert_id);
