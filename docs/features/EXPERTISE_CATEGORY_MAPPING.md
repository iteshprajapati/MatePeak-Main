# Expertise to Featured Category Mapping

## Overview

This document explains how mentors selected during onboarding are automatically categorized into the Featured Mentors sections on the homepage.

## Featured Mentor Sections

The homepage displays mentors in 5 categories:

1. **Recent Graduates** - Mentors who graduated within the last 2 years or are currently studying
2. **Academic Support** - Tutoring, study help, test prep, programming
3. **Mock Interviews** - Interview preparation and practice
4. **Resume Review** - Resume writing, LinkedIn optimization, career advice
5. **Health** - Mental health support, stress management, work-life balance

## Database Fields

- **`categories`** (text[]): Array of broad expertise areas (e.g., "Career Development", "Academic Support")
- **`expertise_tags`** (text[]): Array of specific skills (e.g., "Resume Writing", "Python", "SAT")
- **`education`** (JSONB): Array of education entries with `yearTo` and `currentlyStudying` fields

## Categorization Logic

### 1. Recent Graduates (Auto-detected)

Automatically assigned if:

- Graduated within last 2 years: `education[].yearTo >= currentYear - 2`
- OR currently studying: `education[].currentlyStudying = true`

### 2. Expertise Category Mapping

Broad categories from onboarding → Featured sections:

| Onboarding Category      | Featured Section(s)            |
| ------------------------ | ------------------------------ |
| Career Development       | Mock Interviews, Resume Review |
| Academic Support         | Academic Support               |
| Mental Health            | Health                         |
| Programming & Tech       | Academic Support               |
| Test Preparation         | Academic Support               |
| Creative Arts            | Academic Support               |
| Business & Finance       | Mock Interviews, Resume Review |
| Leadership & Development | Mock Interviews                |

### 3. Expertise Tag Mapping (Most Specific)

Individual skills → Featured sections:

#### Career Development Tags

- Resume Writing → **Resume Review**
- Interview Preparation → **Mock Interviews**
- Mock Interviews → **Mock Interviews**
- Career Counseling → **Mock Interviews**
- Job Search Strategies → **Resume Review**
- LinkedIn Profile Optimization → **Resume Review**

#### Academic Support Tags

- Mathematics → **Academic Support**
- Science → **Academic Support**
- Study Skills → **Academic Support**
- Homework Help → **Academic Support**
- Exam Preparation → **Academic Support**

#### Mental Health Tags

- Stress Management → **Health**
- Anxiety Support → **Health**
- Work-Life Balance → **Health**
- Mindfulness → **Health**

#### Programming & Tech Tags

- Web Development → **Academic Support**
- Python → **Academic Support**
- JavaScript → **Academic Support**
- Data Science → **Academic Support**

#### Test Preparation Tags

- SAT → **Academic Support**
- GRE → **Academic Support**
- GMAT → **Academic Support**
- IELTS → **Academic Support**

#### Creative Arts Tags

- Graphic Design → **Academic Support**
- UI/UX Design → **Academic Support**
- Creative Writing → **Academic Support**

#### Business & Finance Tags

- Entrepreneurship → **Mock Interviews**
- Financial Planning → **Resume Review**
- Business Strategy → **Mock Interviews**

#### Leadership Tags

- Leadership Skills → **Mock Interviews**
- Team Management → **Mock Interviews**
- Communication Skills → **Mock Interviews**

## Priority Order

When categorizing mentors, the system checks in this order:

1. **Education data** → Recent Graduates (if applicable)
2. **Expertise tags** → Most specific mapping
3. **Categories** → Broader expertise areas

A mentor can appear in multiple sections if they have multiple areas of expertise.

## Example Scenarios

### Scenario 1: Recent Graduate + Career Development

**Onboarding Selection:**

- Education: Graduated in 2023, currently studying = false
- Category: Career Development
- Tags: Resume Writing, Interview Preparation

**Result: Appears in 3 sections:**

- ✅ Recent Graduates (graduated within 2 years)
- ✅ Mock Interviews (Interview Preparation tag)
- ✅ Resume Review (Resume Writing tag)

### Scenario 2: Academic Tutor

**Onboarding Selection:**

- Education: Graduated in 2019
- Category: Academic Support
- Tags: Mathematics, Study Skills

**Result: Appears in 1 section:**

- ✅ Academic Support (category + tags match)

### Scenario 3: Current Student + Mental Health

**Onboarding Selection:**

- Education: Currently studying = true
- Category: Mental Health
- Tags: Stress Management, Mindfulness

**Result: Appears in 2 sections:**

- ✅ Recent Graduates (currently studying)
- ✅ Health (Mental Health category + tags)

### Scenario 4: Career Coach + Leadership

**Onboarding Selection:**

- Education: Graduated in 2015
- Categories: Career Development, Leadership & Development
- Tags: Leadership Skills, Interview Preparation, Career Counseling

**Result: Appears in 1 section:**

- ✅ Mock Interviews (all tags + categories map to this section)

## Implementation Details

### Frontend Component

File: `src/components/home/FeaturedMentors.tsx`

```typescript
// Fetch mentors with education data
const { data } = await supabase
  .from("expert_profiles")
  .select(`*, profiles (avatar_url)`);

// Categorize each mentor
const getMentorCategories = (mentor: MentorProfile) => {
  const categories = new Set<string>();

  // 1. Check Recent Graduate status
  if (isRecentGraduate(mentor)) {
    categories.add("Recent Graduates");
  }

  // 2. Map from expertise tags (most specific)
  mentor.expertise_tags?.forEach((tag) => {
    const mapped = TAG_TO_CATEGORY_MAP[tag];
    if (mapped) categories.add(mapped);
  });

  // 3. Map from categories (broader)
  mentor.categories?.forEach((category) => {
    const mapped = EXPERTISE_TO_CATEGORY_MAP[category];
    if (mapped) mapped.forEach((cat) => categories.add(cat));
  });

  return Array.from(categories);
};
```

### Testing SQL Query

See `verify-expertise-mapping.sql` to test which mentors appear in each category.

## Updating the Mapping

To add new mappings:

1. **Add to onboarding options** in `src/components/onboarding/BasicInfoStep.tsx`:

```typescript
const EXPERTISE_OPTIONS = [
  {
    value: "New Category",
    tags: ["Tag 1", "Tag 2", "Tag 3"],
    // ...
  },
];
```

2. **Update mapping** in `src/components/home/FeaturedMentors.tsx`:

```typescript
const EXPERTISE_TO_CATEGORY_MAP = {
  "New Category": ["Featured Section Name"],
  // ...
};

const TAG_TO_CATEGORY_MAP = {
  "Tag 1": "Featured Section Name",
  // ...
};
```

3. **Add to Featured Categories** if needed:

```typescript
const categories = [
  "Recent Graduates",
  "Academic Support",
  "Mock Interviews",
  "Resume Review",
  "Health",
  "New Featured Section", // Add here
];
```

## Notes

- Mentors can appear in multiple sections based on their expertise
- The "Recent Graduates" category is special - it's auto-detected from education data
- Tags provide more granular mapping than categories
- All mappings are defined in `FeaturedMentors.tsx` for easy maintenance
