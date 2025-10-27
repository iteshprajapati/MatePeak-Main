-- Enable vector extension (requires superuser, may need manual enable in Supabase dashboard)
-- If this fails, user needs to enable pgvector in Database > Extensions in Supabase dashboard

-- Create the vector search function without vector type for now
-- Will use similarity search on text fields as fallback

CREATE OR REPLACE FUNCTION public.search_mentors_text(
  search_query text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  category text,
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
    ep.category,
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
      'email', p.email,
      'avatar_url', p.avatar_url,
      'role', p.role
    ) as profile,
    (
      SELECT jsonb_agg(jsonb_build_object('rating', r.rating, 'comment', r.comment))
      FROM public.reviews r
      WHERE r.expert_id = ep.id
    ) as reviews
  FROM public.expert_profiles ep
  LEFT JOIN public.profiles p ON p.id = ep.id
  WHERE 
    ep.bio ILIKE '%' || search_query || '%' OR
    ep.category ILIKE '%' || search_query || '%' OR
    ep.full_name ILIKE '%' || search_query || '%'
  ORDER BY 
    CASE 
      WHEN ep.full_name ILIKE '%' || search_query || '%' THEN 1
      WHEN ep.category ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END
  LIMIT match_count;
END;
$$;