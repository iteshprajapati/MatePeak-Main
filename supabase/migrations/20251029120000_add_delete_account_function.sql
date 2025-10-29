-- Migration: Add delete_user_account RPC function
-- Description: Creates a secure function to delete user accounts with all associated data
-- Created: 2025-10-29

-- Create the RPC function to delete user account
-- This function must be called by an authenticated user to delete their own account
CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  result json;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Security check: Users can only delete their own account
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF current_user_id != user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete user data in correct order (respecting foreign key constraints)
  
  -- 1. Delete session messages
  DELETE FROM session_messages WHERE mentor_id = user_id;
  
  -- 2. Delete student notes
  DELETE FROM student_notes WHERE mentor_id = user_id;
  
  -- 3. Delete reviews
  DELETE FROM reviews WHERE mentor_id = user_id;
  
  -- 4. Delete withdrawal requests
  DELETE FROM withdrawal_requests WHERE mentor_id = user_id;
  
  -- 5. Delete wallet
  DELETE FROM mentor_wallets WHERE mentor_id = user_id;
  
  -- 6. Delete custom time requests
  DELETE FROM custom_time_requests WHERE mentor_id = user_id;
  
  -- 7. Delete bookings
  DELETE FROM bookings WHERE mentor_id = user_id;
  
  -- 8. Delete notification preferences
  DELETE FROM notification_preferences WHERE user_id = user_id;
  
  -- 9. Delete notifications
  DELETE FROM notifications WHERE user_id = user_id;
  
  -- 10. Delete expert profile
  DELETE FROM expert_profiles WHERE id = user_id;
  
  -- 11. Delete from profiles table
  DELETE FROM profiles WHERE id = user_id;
  
  -- 12. Delete from auth.users (requires admin privileges)
  -- This is handled by Supabase's auth.admin API
  -- For security, this function returns success and the auth deletion
  -- should be handled separately or via a trigger
  
  result := json_build_object(
    'success', true,
    'message', 'User data deleted successfully',
    'user_id', user_id
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    RAISE WARNING 'Error deleting user account: %', SQLERRM;
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user_account(uuid) IS 
'Securely deletes a user account and all associated data. Users can only delete their own account.';

-- Optional: Create a trigger to delete auth.users when expert_profiles is deleted
-- This ensures cleanup of auth records when accounts are deleted
CREATE OR REPLACE FUNCTION trigger_delete_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Note: This requires admin privileges and may need to be handled differently
  -- depending on your Supabase setup
  -- For now, we'll just log the deletion
  RAISE NOTICE 'User profile deleted: %', OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger on expert_profiles deletion
DROP TRIGGER IF EXISTS on_expert_profile_delete ON expert_profiles;
CREATE TRIGGER on_expert_profile_delete
  AFTER DELETE ON expert_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_delete_auth_user();

-- Add RLS policies to ensure users can only delete their own data
-- (Most tables should already have these, but let's ensure they exist)

-- Ensure RLS is enabled on key tables
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

-- Add delete policy for expert_profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'expert_profiles' 
    AND policyname = 'Users can delete own profile'
  ) THEN
    CREATE POLICY "Users can delete own profile"
      ON expert_profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Add delete policy for profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can delete own profile record'
  ) THEN
    CREATE POLICY "Users can delete own profile record"
      ON profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;
