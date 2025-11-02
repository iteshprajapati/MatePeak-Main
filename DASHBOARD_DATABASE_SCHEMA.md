# Student Dashboard Database Schema

## 📊 Required Database Tables

### **1. student_profiles** (For Profile Tab)
```sql
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  occupation TEXT,
  bio TEXT,
  learning_goals TEXT,
  interests TEXT[], -- Array of strings
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Students can insert own profile"
  ON student_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### **2. bookings** (Already Exists - For Sessions/Calendar)
Should have structure similar to:
```sql
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- minutes
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  message TEXT,
  total_price DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_expert ON bookings(expert_id);
CREATE INDEX idx_bookings_date ON bookings(session_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Experts can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = expert_id);

CREATE POLICY "Students can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Experts can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = expert_id);
```

### **3. reviews** (Already Exists - For Reviews Tab)
Should have structure similar to:
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, booking_id) -- One review per booking
);

-- Indexes
CREATE INDEX idx_reviews_student ON reviews(student_id);
CREATE INDEX idx_reviews_expert ON reviews(expert_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Students can create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Students can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = student_id);
```

### **4. expert_profiles** (Already Exists - For Mentor Info)
Should have structure similar to:
```sql
CREATE TABLE IF NOT EXISTS expert_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  profile_picture_url TEXT,
  bio TEXT,
  expertise TEXT[], -- Array of expertise areas
  location TEXT,
  hourly_rate DECIMAL(10, 2),
  languages TEXT[],
  total_sessions INTEGER DEFAULT 0,
  years_of_experience INTEGER,
  education TEXT[],
  certifications TEXT[],
  availability JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_experts_username ON expert_profiles(username);
CREATE INDEX idx_experts_expertise ON expert_profiles USING GIN(expertise);

-- Enable RLS
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view expert profiles"
  ON expert_profiles FOR SELECT
  USING (true);

CREATE POLICY "Experts can update own profile"
  ON expert_profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 🆕 Optional Enhancement Tables

### **5. favorite_mentors** (For My Mentors Favorite Feature)
```sql
CREATE TABLE IF NOT EXISTS favorite_mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES expert_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, expert_id)
);

-- Index
CREATE INDEX idx_favorites_student ON favorite_mentors(student_id);
CREATE INDEX idx_favorites_expert ON favorite_mentors(expert_id);

-- Enable RLS
ALTER TABLE favorite_mentors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can manage own favorites"
  ON favorite_mentors FOR ALL
  USING (auth.uid() = student_id);
```

### **6. messages** (For Real Messaging Feature)
```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);
```

### **7. notification_preferences** (For Profile Notification Settings)
```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_sessions BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  email_reminders BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  push_sessions BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  push_reminders BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = id);
```

---

## 🔧 Setup Instructions

### **Option 1: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste each table creation script
5. Run the queries
6. Verify tables in **Table Editor**

### **Option 2: Migration File**
1. Create migration file in `supabase/migrations/`
2. Name it: `YYYYMMDDHHMMSS_student_dashboard_tables.sql`
3. Paste all CREATE TABLE statements
4. Run: `supabase db push`

### **Option 3: Supabase CLI**
```bash
# Create migration
supabase migration new student_dashboard_tables

# Edit the migration file and add SQL

# Apply migration
supabase db push
```

---

## ✅ Verification Queries

After creating tables, verify with these queries:

```sql
-- Check student_profiles table
SELECT * FROM student_profiles LIMIT 1;

-- Check bookings with joins
SELECT 
  b.*,
  e.full_name as mentor_name
FROM bookings b
LEFT JOIN expert_profiles e ON b.expert_id = e.id
LIMIT 5;

-- Check reviews with joins
SELECT 
  r.*,
  s.full_name as student_name,
  e.full_name as expert_name
FROM reviews r
LEFT JOIN student_profiles s ON r.student_id = s.id
LEFT JOIN expert_profiles e ON r.expert_id = e.id
LIMIT 5;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('student_profiles', 'bookings', 'reviews');
```

---

## 🎯 Current Dashboard Requirements

### **Minimum Required Tables:**
- ✅ `student_profiles` - **REQUIRED** for Profile tab
- ✅ `bookings` - **REQUIRED** for Sessions, Calendar, Overview
- ✅ `reviews` - **REQUIRED** for Reviews tab
- ✅ `expert_profiles` - **REQUIRED** for mentor info across all tabs

### **Optional Enhancement Tables:**
- ⚠️ `favorite_mentors` - For favorite functionality (currently using client state)
- ⚠️ `messages` - For real messaging (currently using sample data)
- ⚠️ `notification_preferences` - For notification settings (currently using client state)

---

## 📝 Notes

1. **Authentication**: Uses Supabase Auth (`auth.users` table)
2. **RLS**: All tables have Row Level Security enabled
3. **Policies**: Ensure policies match your security requirements
4. **Indexes**: Added for performance on common queries
5. **Foreign Keys**: Properly linked with CASCADE delete where appropriate

---

## 🚨 Important

Before running in production:
1. Review all RLS policies
2. Test with different user roles
3. Add proper constraints
4. Set up database backups
5. Monitor query performance
6. Add appropriate indexes

---

## 🔄 Migration Rollback

If you need to rollback:

```sql
-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS favorite_mentors CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
```

**⚠️ WARNING: This will delete all data in these tables!**

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs for errors
2. Verify RLS policies are correct
3. Ensure foreign key references exist
4. Check user authentication
5. Review the Supabase docs: https://supabase.com/docs

---

## ✨ Summary

The Student Dashboard requires:
- **3-4 core tables** (student_profiles, bookings, reviews, expert_profiles)
- **3 optional tables** (favorite_mentors, messages, notification_preferences)
- **Proper RLS policies** for security
- **Indexes** for performance

Most of these tables likely already exist from your MVP setup. You mainly need to add `student_profiles` table and optionally the enhancement tables.

Run the SQL scripts in your Supabase project and you're ready to go! 🚀
