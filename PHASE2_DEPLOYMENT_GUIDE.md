# Phase 2 Deployment Guide

## ⚠️ CRITICAL: Database Migrations Required

Before testing Phase 2 features, you **MUST** apply database migrations in the Supabase dashboard.

## 🔧 Database Changes Required

### Step 1: Add Missing Columns to Existing Tables

Run these SQL commands in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Add student information to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Add mentor reply field to reviews table  
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS mentor_reply TEXT;
```

### Step 2: Create New Tables

```sql
-- Table: availability_slots
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  specific_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_expert_id ON availability_slots(expert_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_slots_specific_date ON availability_slots(specific_date);

-- Table: blocked_dates
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_expert_id ON blocked_dates(expert_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- Table: student_notes
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(expert_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_notes_expert_id ON student_notes(expert_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);

-- Table: session_messages
CREATE TABLE IF NOT EXISTS session_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('mentor', 'student')),
  message_text TEXT NOT NULL,
  read_by_mentor BOOLEAN DEFAULT false,
  read_by_student BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_messages_booking_id ON session_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_sender_id ON session_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages(created_at);
```

### Step 3: Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- Policies for availability_slots
CREATE POLICY "Experts can manage their own availability slots"
  ON availability_slots FOR ALL
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Anyone can view availability slots"
  ON availability_slots FOR SELECT
  USING (true);

-- Policies for blocked_dates
CREATE POLICY "Experts can manage their own blocked dates"
  ON blocked_dates FOR ALL
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Anyone can view blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

-- Policies for student_notes
CREATE POLICY "Experts can manage their own student notes"
  ON student_notes FOR ALL
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

-- Policies for session_messages
CREATE POLICY "Users can view their own session messages"
  ON session_messages FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE expert_id = auth.uid() OR user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages for their bookings"
  ON session_messages FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE expert_id = auth.uid() OR user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update read status"
  ON session_messages FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE expert_id = auth.uid() OR user_id = auth.uid()
    )
  );
```

### Step 4: Enable Realtime for session_messages

```sql
-- Enable Realtime for session_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE session_messages;
```

## 🔄 After Running SQL Migrations

### Update TypeScript Types

After applying the migrations, you need to regenerate TypeScript types:

1. Go to your Supabase Dashboard
2. Navigate to Settings → API
3. Copy your project URL and anon key (if needed)
4. Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts`

**OR** manually update `src/integrations/supabase/types.ts` to include the new tables and columns.

## ✅ Phase 2 Features Checklist

Once migrations are applied:

### **Group A: Reviews & Insights**
- ✅ Reviews Management (`ReviewsManagement.tsx`)
  - View all reviews with ratings
  - Reply to reviews
  - Filter by rating (1-5 stars)
  - Export reviews to CSV
  - Average rating visualization

### **Group B: Advanced Scheduling**
- ✅ Availability Calendar (`AvailabilityCalendar.tsx`)
  - Visual calendar interface
  - Add time slots (specific dates or recurring weekly)
  - Block dates for vacations
  - 30-minute interval time selection
  
- ✅ Session Calendar View (`SessionCalendar.tsx`)
  - Monthly calendar showing all sessions
  - Color-coded by status
  - Click to view session details
  - Export to ICS for Google Calendar

### **Group C: Student Management**
- ✅ Session-Based Messaging (`SessionMessaging.tsx`)
  - Real-time chat for confirmed bookings
  - Message templates
  - Unread message badges
  - Only available for confirmed/completed sessions
  
- ✅ Student Directory (`StudentDirectory.tsx`)
  - View all students with session history
  - Aggregate statistics per student
  - Private notes system
  - Search functionality

## 🎨 Dashboard Navigation

Updated navigation (8 views total):

1. **Overview** - Dashboard overview with stats
2. **Sessions** - Session management
3. **Calendar** - Session calendar view (NEW)
4. **Messages** - Session messaging (NEW)
5. **Students** - Student directory (NEW)
6. **Availability** - Availability management (NEW)
7. **Reviews** - Reviews management (NEW)
8. **Profile** - Profile management

## 🔍 Testing Checklist

After migrations are applied, test each feature:

- [ ] **Reviews Management**
  - [ ] Reviews load correctly
  - [ ] Can reply to reviews
  - [ ] Filter by rating works
  - [ ] Export CSV downloads
  
- [ ] **Availability Calendar**
  - [ ] Can add time slots
  - [ ] Recurring weekly patterns save
  - [ ] Can block/unblock dates
  - [ ] Calendar displays correctly
  
- [ ] **Session Calendar**
  - [ ] Sessions display on calendar
  - [ ] Can click sessions for details
  - [ ] ICS export downloads
  - [ ] Status colors are correct
  
- [ ] **Session Messaging**
  - [ ] Conversations load
  - [ ] Can send messages
  - [ ] Real-time updates work
  - [ ] Templates insert correctly
  - [ ] Unread badges update
  
- [ ] **Student Directory**
  - [ ] Students list correctly
  - [ ] Session stats accurate
  - [ ] Can add/edit notes
  - [ ] Search functionality works

## 🐛 Known Issues

### TypeScript Errors (Before Migration)
All TypeScript errors related to missing tables will resolve once:
1. Database migrations are applied
2. TypeScript types are regenerated

### Development Mode
- Run: `npm run dev` to start the development server
- Open: `http://localhost:5173`

## 📞 Support

If you encounter issues:
1. Verify all SQL migrations ran successfully
2. Check Supabase dashboard for table creation
3. Regenerate TypeScript types
4. Clear browser cache and reload

## 🎯 Next Steps (Optional)

**Performance Insights Feature** (Not yet implemented):
- Session analytics charts
- Revenue trends
- Student retention metrics
- Booking conversion rates
