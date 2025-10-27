-- Update profiles table to match Users requirements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('student', 'mentor')) DEFAULT 'student';

-- Update expert_profiles table to match Mentors requirements
ALTER TABLE public.expert_profiles
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing INTEGER,
DROP COLUMN IF EXISTS hourly_rate;

-- Rename hourly_rate to pricing if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='expert_profiles' AND column_name='hourly_rate') THEN
    ALTER TABLE public.expert_profiles RENAME COLUMN hourly_rate TO pricing;
  END IF;
END $$;

-- Update bookings table to match Sessions requirements
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS session_time TIMESTAMP WITH TIME ZONE,
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status SET DEFAULT 'pending';

-- Drop old status constraint and add new one
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- Create trigger to automatically assign 'expert' role when expert profile is created
CREATE OR REPLACE FUNCTION public.handle_expert_profile_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update user role to mentor
  UPDATE public.profiles 
  SET role = 'mentor' 
  WHERE id = NEW.id;
  
  -- Add 'expert' role to user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'expert')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_expert_profile_created
  AFTER INSERT ON public.expert_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_expert_profile_creation();

-- Create function to check availability
CREATE OR REPLACE FUNCTION public.check_mentor_availability(
  p_mentor_id UUID,
  p_session_time TIMESTAMP WITH TIME ZONE,
  p_duration INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  -- Check if mentor has any conflicting bookings
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM public.bookings
  WHERE expert_id = p_mentor_id
    AND status NOT IN ('cancelled')
    AND (
      -- Check if new session overlaps with existing ones
      (p_session_time, p_session_time + (p_duration || ' minutes')::INTERVAL) 
      OVERLAPS 
      (session_time, session_time + (duration || ' minutes')::INTERVAL)
    );
  
  RETURN v_conflict_count = 0;
END;
$$;

-- Update RLS policy for bookings to use session_time
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND public.check_mentor_availability(expert_id, session_time, duration)
  );

-- Add index for session_time
CREATE INDEX IF NOT EXISTS idx_bookings_session_time ON public.bookings(session_time);

-- Add index for payment_status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);