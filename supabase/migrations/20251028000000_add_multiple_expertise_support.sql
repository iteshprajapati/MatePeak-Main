-- Migration to support multiple expertise areas and granular tags for better mentor-student matching
-- This enhances the precision of mentor search and recommendations

-- Step 1: Add new columns
ALTER TABLE expert_profiles 
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expertise_tags text[] DEFAULT '{}';

-- Step 2: Migrate existing category data to categories array
UPDATE expert_profiles 
SET categories = ARRAY[category]
WHERE category IS NOT NULL AND category != '';

-- Step 3: Drop the old category column (optional - uncomment if you want to remove it completely)
-- ALTER TABLE expert_profiles DROP COLUMN IF EXISTS category;

-- Step 4: Create index for better search performance on arrays
CREATE INDEX IF NOT EXISTS idx_expert_profiles_categories ON expert_profiles USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_expertise_tags ON expert_profiles USING GIN (expertise_tags);

-- Step 5: Update the search function to handle multiple categories and tags
CREATE OR REPLACE FUNCTION public.search_mentors_text(
  search_query text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  category text,
  categories text[],
  expertise_tags text[],
  experience integer,
  pricing integer,
  bio text,
  full_name text,
  username text,
  availability_json text,
  social_links jsonb,
  services jsonb,
  ispaid boolean,
  created_at timestamptz,
  updated_at timestamptz,
  profile jsonb,
  reviews jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.id as user_id,
    -- Return first category for backward compatibility
    CASE 
      WHEN array_length(ep.categories, 1) > 0 THEN ep.categories[1]
      ELSE NULL
    END as category,
    ep.categories,
    ep.expertise_tags,
    ep.experience,
    ep.pricing,
    ep.bio,
    ep.full_name,
    ep.username,
    ep.availability_json,
    ep.social_links,
    ep.services,
    ep.ispaid,
    ep.created_at,
    ep.updated_at,
    jsonb_build_object(
      'full_name', p.full_name,
      'email', p.email
    ) as profile,
    jsonb_build_object(
      'average_rating', COALESCE(AVG(r.rating), 0),
      'total_reviews', COUNT(r.id)
    ) as reviews
  FROM expert_profiles ep
  LEFT JOIN profiles p ON ep.id = p.id
  LEFT JOIN reviews r ON ep.id = r.mentor_id
  WHERE 
    (
      -- Search in categories array
      EXISTS (
        SELECT 1 FROM unnest(ep.categories) AS cat 
        WHERE cat ILIKE '%' || search_query || '%'
      ) OR
      -- Search in expertise tags array
      EXISTS (
        SELECT 1 FROM unnest(ep.expertise_tags) AS tag 
        WHERE tag ILIKE '%' || search_query || '%'
      ) OR
      -- Search in other text fields
      ep.bio ILIKE '%' || search_query || '%' OR
      ep.full_name ILIKE '%' || search_query || '%' OR
      ep.username ILIKE '%' || search_query || '%'
    )
  GROUP BY ep.id, p.full_name, p.email
  ORDER BY 
    -- Prioritize exact matches in categories and tags
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM unnest(ep.categories) AS cat 
        WHERE cat ILIKE search_query
      ) THEN 1
      WHEN EXISTS (
        SELECT 1 FROM unnest(ep.expertise_tags) AS tag 
        WHERE tag ILIKE search_query
      ) THEN 2
      WHEN EXISTS (
        SELECT 1 FROM unnest(ep.categories) AS cat 
        WHERE cat ILIKE '%' || search_query || '%'
      ) THEN 3
      WHEN ep.full_name ILIKE '%' || search_query || '%' THEN 4
      ELSE 5
    END,
    -- Secondary sort by rating
    COALESCE(AVG(r.rating), 0) DESC,
    ep.created_at DESC
  LIMIT match_count;
END;
$$;

-- Step 6: Add comment explaining the new structure
COMMENT ON COLUMN expert_profiles.categories IS 'Array of expertise areas (e.g., Career Coaching, Programming & Tech). Allows mentors to have multiple expertise areas.';
COMMENT ON COLUMN expert_profiles.expertise_tags IS 'Array of specific skills and specializations (e.g., Python, Resume Writing, SAT Prep). Used for precise mentor-student matching.';

-- Step 7: Create a helper function to get mentors by specific expertise
CREATE OR REPLACE FUNCTION public.get_mentors_by_expertise(
  expertise_area text,
  specific_tag text DEFAULT NULL,
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  categories text[],
  expertise_tags text[],
  bio text,
  pricing integer,
  average_rating numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.full_name,
    ep.username,
    ep.categories,
    ep.expertise_tags,
    ep.bio,
    ep.pricing,
    COALESCE(AVG(r.rating), 0) as average_rating
  FROM expert_profiles ep
  LEFT JOIN reviews r ON ep.id = r.mentor_id
  WHERE 
    expertise_area = ANY(ep.categories)
    AND (
      specific_tag IS NULL 
      OR specific_tag = ANY(ep.expertise_tags)
    )
  GROUP BY ep.id
  ORDER BY COALESCE(AVG(r.rating), 0) DESC, ep.created_at DESC
  LIMIT limit_count;
END;
$$;

COMMENT ON FUNCTION public.get_mentors_by_expertise IS 'Get mentors filtered by expertise area and optionally by specific skill tag. Useful for targeted mentor recommendations.';
