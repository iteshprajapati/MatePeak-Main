-- Quick check to see if there are any mentors in the database
SELECT 
  COUNT(*) as total_mentors,
  COUNT(CASE WHEN categories IS NOT NULL AND array_length(categories, 1) > 0 THEN 1 END) as mentors_with_categories,
  COUNT(CASE WHEN expertise_tags IS NOT NULL AND array_length(expertise_tags, 1) > 0 THEN 1 END) as mentors_with_tags,
  COUNT(CASE WHEN education IS NOT NULL AND jsonb_array_length(education) > 0 THEN 1 END) as mentors_with_education
FROM expert_profiles;

-- Show first 5 mentors with their data
SELECT 
  full_name,
  username,
  categories,
  expertise_tags,
  CASE 
    WHEN education IS NOT NULL AND jsonb_array_length(education) > 0 THEN
      'Has education data'
    ELSE 'No education data'
  END as education_status
FROM expert_profiles
LIMIT 5;
