-- Add UPDATE policy for expert_profiles to allow mentors to update their own profile

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own expert profile" ON expert_profiles;
DROP POLICY IF EXISTS "Experts can update their own profile" ON expert_profiles;

-- Create comprehensive UPDATE policy
CREATE POLICY "Users can update their own expert profile"
  ON expert_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create SELECT policy if it doesn't exist (needed for public profiles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'expert_profiles' 
    AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON expert_profiles
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Create INSERT policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'expert_profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON expert_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
