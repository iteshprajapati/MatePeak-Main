# 🚀 QUICK START: Apply Phase 2 Migration

## ⚡ 3-Minute Setup

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project

### Step 2: Run Migration
1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. Open file: `supabase/migrations/20251028_phase2_complete_migration.sql`
4. **Copy ALL contents** of the file
5. **Paste** into SQL Editor
6. Click **Run** button (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

### Step 3: Verify (Optional)
Run this query to verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'availability_slots', 
  'blocked_dates', 
  'student_notes', 
  'session_messages'
);
```
You should see 4 rows returned.

### Step 4: Start Testing
1. Run your development server: `npm run dev`
2. Navigate to mentor dashboard
3. Try each new feature:
   - Reviews (reply, filter, export)
   - Availability (add slots, block dates)
   - Calendar (view sessions, export ICS)
   - Messages (send messages, real-time)
   - Students (view, add notes, search)

## ✅ What You'll Get

**New Tables**: 4 (availability_slots, blocked_dates, student_notes, session_messages)  
**New Columns**: 3 (student_name, student_email, mentor_reply)  
**RLS Policies**: 11 security policies  
**Indexes**: 10 performance indexes  
**Real-time**: Enabled for session_messages  

## 🐛 If Something Goes Wrong

**Error: "relation already exists"**
→ Table already exists, migration is safe to re-run (uses IF NOT EXISTS)

**Error: "column already exists"**
→ Column already exists, migration is safe to re-run (uses IF NOT EXISTS)

**Error: "permission denied"**
→ You need admin access to your Supabase project

**TypeScript still showing errors after migration**
→ Regenerate types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts
```

## 📚 More Help

- Full documentation: `PHASE2_SUMMARY.md`
- Deployment guide: `PHASE2_DEPLOYMENT_GUIDE.md`
- Migration file: `supabase/migrations/20251028_phase2_complete_migration.sql`

---

**That's it!** 🎉 Your Phase 2 dashboard is ready to use.
