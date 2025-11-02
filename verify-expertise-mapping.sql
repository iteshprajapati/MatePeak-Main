-- Verify Expertise to Featured Category Mapping
-- This query shows which mentors will appear in each Featured Mentor section

WITH mentor_categories AS (
  SELECT 
    id,
    full_name,
    username,
    categories,
    expertise_tags,
    education,
    -- Check if Recent Graduate
    CASE 
      WHEN education IS NOT NULL AND jsonb_array_length(education) > 0 THEN
        EXISTS (
          SELECT 1 
          FROM jsonb_array_elements(education) AS edu
          WHERE 
            (edu->>'currentlyStudying')::boolean = true
            OR 
            (edu->>'yearTo')::int >= EXTRACT(YEAR FROM CURRENT_DATE) - 2
        )
      ELSE false
    END AS is_recent_graduate,
    -- Check for Academic Support expertise
    CASE 
      WHEN 
        'Academic Support' = ANY(categories)
        OR 'Programming & Tech' = ANY(categories)
        OR 'Test Preparation' = ANY(categories)
        OR 'Creative Arts' = ANY(categories)
        OR EXISTS (
          SELECT 1 FROM unnest(expertise_tags) AS tag
          WHERE tag IN (
            'Mathematics', 'Science', 'Study Skills', 'Homework Help', 'Exam Preparation',
            'Web Development', 'Python', 'JavaScript', 'Data Science',
            'SAT', 'GRE', 'GMAT', 'IELTS',
            'Graphic Design', 'UI/UX Design', 'Creative Writing'
          )
        )
      THEN true
      ELSE false
    END AS academic_support,
    -- Check for Mock Interviews expertise
    CASE 
      WHEN 
        'Career Development' = ANY(categories)
        OR 'Business & Finance' = ANY(categories)
        OR 'Leadership & Development' = ANY(categories)
        OR EXISTS (
          SELECT 1 FROM unnest(expertise_tags) AS tag
          WHERE tag IN (
            'Interview Preparation', 'Mock Interviews', 'Career Counseling',
            'Entrepreneurship', 'Business Strategy',
            'Leadership Skills', 'Team Management', 'Communication Skills'
          )
        )
      THEN true
      ELSE false
    END AS mock_interviews,
    -- Check for Resume Review expertise
    CASE 
      WHEN 
        'Career Development' = ANY(categories)
        OR 'Business & Finance' = ANY(categories)
        OR EXISTS (
          SELECT 1 FROM unnest(expertise_tags) AS tag
          WHERE tag IN (
            'Resume Writing', 'Job Search Strategies', 'LinkedIn Profile Optimization',
            'Financial Planning'
          )
        )
      THEN true
      ELSE false
    END AS resume_review,
    -- Check for Health expertise
    CASE 
      WHEN 
        'Mental Health' = ANY(categories)
        OR EXISTS (
          SELECT 1 FROM unnest(expertise_tags) AS tag
          WHERE tag IN (
            'Stress Management', 'Anxiety Support', 'Work-Life Balance', 'Mindfulness'
          )
        )
      THEN true
      ELSE false
    END AS health
  FROM expert_profiles
)

-- Show mentors grouped by Featured Section
SELECT 
  'Recent Graduates' AS featured_section,
  COUNT(*) AS mentor_count,
  string_agg(username, ', ' ORDER BY username) AS mentors
FROM mentor_categories
WHERE is_recent_graduate = true
UNION ALL
SELECT 
  'Academic Support' AS featured_section,
  COUNT(*) AS mentor_count,
  string_agg(username, ', ' ORDER BY username) AS mentors
FROM mentor_categories
WHERE academic_support = true
UNION ALL
SELECT 
  'Mock Interviews' AS featured_section,
  COUNT(*) AS mentor_count,
  string_agg(username, ', ' ORDER BY username) AS mentors
FROM mentor_categories
WHERE mock_interviews = true
UNION ALL
SELECT 
  'Resume Review' AS featured_section,
  COUNT(*) AS mentor_count,
  string_agg(username, ', ' ORDER BY username) AS mentors
FROM mentor_categories
WHERE resume_review = true
UNION ALL
SELECT 
  'Health' AS featured_section,
  COUNT(*) AS mentor_count,
  string_agg(username, ', ' ORDER BY username) AS mentors
FROM mentor_categories
WHERE health = true
ORDER BY 
  CASE featured_section
    WHEN 'Recent Graduates' THEN 1
    WHEN 'Academic Support' THEN 2
    WHEN 'Mock Interviews' THEN 3
    WHEN 'Resume Review' THEN 4
    WHEN 'Health' THEN 5
  END;

-- Detailed view: Show each mentor with their Featured Sections
SELECT 
  full_name,
  username,
  categories,
  expertise_tags,
  CASE WHEN is_recent_graduate THEN 'Recent Graduates' ELSE NULL END AS section_1,
  CASE WHEN academic_support THEN 'Academic Support' ELSE NULL END AS section_2,
  CASE WHEN mock_interviews THEN 'Mock Interviews' ELSE NULL END AS section_3,
  CASE WHEN resume_review THEN 'Resume Review' ELSE NULL END AS section_4,
  CASE WHEN health THEN 'Health' ELSE NULL END AS section_5,
  -- Count total sections
  (
    (CASE WHEN is_recent_graduate THEN 1 ELSE 0 END) +
    (CASE WHEN academic_support THEN 1 ELSE 0 END) +
    (CASE WHEN mock_interviews THEN 1 ELSE 0 END) +
    (CASE WHEN resume_review THEN 1 ELSE 0 END) +
    (CASE WHEN health THEN 1 ELSE 0 END)
  ) AS total_sections
FROM mentor_categories
ORDER BY full_name;

-- Check mentors with no Featured Section assignment
SELECT 
  full_name,
  username,
  categories,
  expertise_tags,
  'NO FEATURED SECTION ASSIGNED' AS warning
FROM mentor_categories
WHERE 
  is_recent_graduate = false
  AND academic_support = false
  AND mock_interviews = false
  AND resume_review = false
  AND health = false;
