# 🔧 Fix: Apply Expertise Migration to Your Database

## ⚠️ Error You're Seeing:
```
Could not find the 'categories' column of 'expert_profiles' in the schema cache
```

## 🎯 Solution:
The database migration file exists but hasn't been applied to your Supabase database yet. Follow these steps:

---

## Option 1: Apply via Supabase Dashboard (RECOMMENDED)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Copy and Run the Migration
Copy this SQL and run it in the SQL Editor:

```sql
-- Migration to support multiple expertise areas and granular tags
-- Run this ONCE in your Supabase SQL Editor

-- Step 1: Add new columns
ALTER TABLE expert_profiles 
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expertise_tags text[] DEFAULT '{}';

-- Step 2: Migrate existing category data to categories array
UPDATE expert_profiles 
SET categories = ARRAY[category]
WHERE category IS NOT NULL AND category != '' AND (categories IS NULL OR categories = '{}');

-- Step 3: Create index for better search performance on arrays
CREATE INDEX IF NOT EXISTS idx_expert_profiles_categories ON expert_profiles USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_expertise_tags ON expert_profiles USING GIN (expertise_tags);

-- Step 4: Add comments
COMMENT ON COLUMN expert_profiles.categories IS 'Array of expertise areas (e.g., Career Coaching, Programming & Tech)';
COMMENT ON COLUMN expert_profiles.expertise_tags IS 'Array of specific skills and specializations (e.g., Python, Resume Writing)';
```

### Step 3: Verify the Migration
Run this query to verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expert_profiles' 
AND column_name IN ('categories', 'expertise_tags');
```

You should see:
```
categories     | ARRAY
expertise_tags | ARRAY
```

---

## Option 2: Apply via Supabase CLI (If Using Local Development)

If you're running Supabase locally:

```bash
# Navigate to your project directory
cd d:\Matepeak\Project\spark-mentor-connect-08475-37914-35681--84739

# Apply the migration
supabase db push

# Or reset and apply all migrations
supabase db reset
```

---

## Option 3: Quick Fix - Manual Column Addition

If the above doesn't work, manually add the columns:

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `expert_profiles` table
3. Click **+ New Column**
4. Add column `categories`:
   - Name: `categories`
   - Type: `text[]` (Array of text)
   - Default value: `{}`
5. Click **+ New Column** again
6. Add column `expertise_tags`:
   - Name: `expertise_tags`
   - Type: `text[]` (Array of text)
   - Default value: `{}`

---

## ✅ After Migration Success:

1. **Refresh your browser** (Clear cache: Ctrl+Shift+R)
2. **Restart the dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```
3. Navigate to **Dashboard → Profile**
4. You should now see the **"Areas of Expertise"** section working!

---

## 🧪 Test the Migration:

Run this query in Supabase SQL Editor to test:

```sql
-- Test updating a profile with new expertise
UPDATE expert_profiles 
SET 
  categories = ARRAY['Programming & Tech', 'Career Coaching'],
  expertise_tags = ARRAY['Python', 'JavaScript', 'Resume Writing']
WHERE id = (SELECT id FROM expert_profiles LIMIT 1)
RETURNING *;
```

---

## 🆘 Still Having Issues?

### Check if migration was already applied:
```sql
SELECT * FROM expert_profiles LIMIT 1;
```

Look for `categories` and `expertise_tags` columns in the result.

### Check RLS Policies:
Make sure Row Level Security policies allow updates:

```sql
-- View current policies
SELECT * FROM pg_policies WHERE tablename = 'expert_profiles';
```

---

## 📋 Rollback (If Needed):

If something goes wrong, you can rollback:

```sql
ALTER TABLE expert_profiles 
DROP COLUMN IF EXISTS categories,
DROP COLUMN IF EXISTS expertise_tags;
```

---

## ⏱️ Estimated Time:
- **Option 1 (SQL Editor)**: 2-3 minutes
- **Option 2 (CLI)**: 1 minute
- **Option 3 (Manual)**: 5 minutes

---

## 🎉 After Migration:

The expertise editor will work perfectly, allowing mentors to:
- ✅ Select multiple expertise areas
- ✅ Choose specific skill tags
- ✅ Update their profile dynamically
- ✅ Be discovered by students more easily

---

**Need Help?** Check the Supabase docs: https://supabase.com/docs/guides/database/migrations
