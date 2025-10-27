-- Create expert_profiles table
CREATE TABLE public.expert_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  services JSONB DEFAULT '{}',
  availability_json TEXT,
  ispaid BOOLEAN DEFAULT true,
  hourly_rate NUMERIC(10, 2),
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Expert profiles are viewable by everyone"
  ON public.expert_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own expert profile"
  ON public.expert_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own expert profile"
  ON public.expert_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER expert_profiles_updated_at
  BEFORE UPDATE ON public.expert_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();