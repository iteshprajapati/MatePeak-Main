# Fix: Certificate Upload Bucket Not Found

## Problem

The certificate upload feature is failing with "bucket not found" error because the `teaching-certificates` storage bucket hasn't been created in Supabase.

## Solution Options

### Option 1: Quick Fix (Recommended)

Run the SQL script directly in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Open the file `fix-certificate-bucket.sql` in this repository
4. Copy all its contents
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify that you see the bucket details in the results

### Option 2: Using Supabase CLI (If you have it installed)

If you have the Supabase CLI installed and configured:

```powershell
# Navigate to your project directory
cd d:\Matepeak\Project\spark-mentor-connect-08475-37914-35681--84739

# Run the migration
supabase db push
```

### Option 3: Manual Creation via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Set the following:
   - **Name**: `teaching-certificates`
   - **Public bucket**: ✓ (checked)
   - **File size limit**: 20MB
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`
5. Click **Create bucket**
6. Then run the policies from `fix-certificate-bucket.sql` in the SQL Editor (lines 22-61)

## What This Creates

### Storage Bucket

- **Name**: `teaching-certificates`
- **Public access**: Yes (for viewing certificates on profiles)
- **Max file size**: 20MB
- **Allowed formats**: JPG, PNG

### Security Policies

- Users can only upload, update, and delete their own certificates
- Anyone can view certificates (for public profiles)
- File paths include user ID for organization: `{userId}/certificates/{timestamp}.{ext}`

## Verification

After running the fix, verify the bucket exists:

1. Go to **Storage** in your Supabase dashboard
2. You should see `teaching-certificates` bucket listed
3. Try uploading a certificate through your app

## Files Created

- `supabase/migrations/20251101170000_add_teaching_certificates_storage.sql` - Full migration including columns
- `fix-certificate-bucket.sql` - Quick fix SQL script (storage bucket + policies only)

## Need Help?

If you still encounter issues after running the fix:

1. Check that you're logged in as an authenticated user
2. Verify the bucket exists in Storage section
3. Check browser console for detailed error messages
4. Ensure file meets requirements (JPG/PNG, <20MB)
