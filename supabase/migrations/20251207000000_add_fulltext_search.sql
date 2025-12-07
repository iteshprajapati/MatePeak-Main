-- Add full-text search capabilities for expert profiles
-- This significantly improves search performance from O(n) to O(log n)

-- Step 1: Add tsvector column for full-text search
ALTER TABLE expert_profiles 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create function to update search vector
CREATE OR REPLACE FUNCTION update_expert_profiles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.headline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.categories, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.expertise_tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS expert_profiles_search_vector_update ON expert_profiles;
CREATE TRIGGER expert_profiles_search_vector_update
  BEFORE INSERT OR UPDATE ON expert_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_expert_profiles_search_vector();

-- Step 4: Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_expert_profiles_search_vector 
  ON expert_profiles USING GIN (search_vector);

-- Step 5: Update existing rows with search vector
UPDATE expert_profiles 
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(full_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(bio, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(headline, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(categories, ' '), '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(expertise_tags, ' '), '')), 'C')
WHERE search_vector IS NULL;

-- Step 6: Create helper function for search with ranking
CREATE OR REPLACE FUNCTION search_expert_profiles(
  search_query text,
  max_results int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  bio text,
  categories text[],
  expertise_tags text[],
  profile_picture_url text,
  service_pricing jsonb,
  services jsonb,
  rank real
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.full_name,
    ep.username,
    ep.bio,
    ep.categories,
    ep.expertise_tags,
    ep.profile_picture_url,
    ep.service_pricing,
    ep.services,
    ts_rank(ep.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM expert_profiles ep
  WHERE ep.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT max_results;
END;
$$;

-- Step 7: Add index on frequently queried columns for non-FTS queries
CREATE INDEX IF NOT EXISTS idx_expert_profiles_username 
  ON expert_profiles(username);

CREATE INDEX IF NOT EXISTS idx_expert_profiles_created_at 
  ON expert_profiles(created_at DESC);

-- Step 8: Add composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_expert_profiles_category_created 
  ON expert_profiles USING GIN(categories) 
  WHERE categories IS NOT NULL;

-- Comment documentation
COMMENT ON COLUMN expert_profiles.search_vector IS 
  'Full-text search vector combining name (A), bio (B), headline (B), categories (C), and expertise tags (C) with weighted ranking';

COMMENT ON FUNCTION search_expert_profiles IS 
  'Performs full-text search on expert profiles with relevance ranking. Returns top matches ordered by relevance.';
