# Featured Mentors Categorization - Quick Reference

## 🎯 How Mentors Are Categorized

### Featured Sections

```
┌─────────────────────────────────────────────────────────┐
│                    HOMEPAGE SECTIONS                     │
├─────────────────────────────────────────────────────────┤
│ 1. 🎓 Recent Graduates                                  │
│ 2. 📚 Academic Support                                  │
│ 3. 💼 Mock Interviews                                   │
│ 4. 📄 Resume Review                                     │
│ 5. 💚 Health                                            │
└─────────────────────────────────────────────────────────┘
```

## 📋 Mapping Examples

### Example 1: Recent Graduate + Career Expert

```
ONBOARDING INPUT:
├─ Education: Graduated 2023 (Currently Studying: No)
├─ Category: Career Development
└─ Tags: Resume Writing, Interview Preparation

RESULT - APPEARS IN 3 SECTIONS:
├─ ✅ Recent Graduates (graduated within 2 years)
├─ ✅ Mock Interviews (Interview Preparation tag)
└─ ✅ Resume Review (Resume Writing tag)
```

### Example 2: Current Student + Academic Tutor

```
ONBOARDING INPUT:
├─ Education: Currently Studying = Yes
├─ Category: Academic Support
└─ Tags: Mathematics, Study Skills

RESULT - APPEARS IN 2 SECTIONS:
├─ ✅ Recent Graduates (currently studying)
└─ ✅ Academic Support (category + tags match)
```

### Example 3: Mental Health Counselor

```
ONBOARDING INPUT:
├─ Education: Graduated 2018
├─ Category: Mental Health
└─ Tags: Stress Management, Anxiety Support

RESULT - APPEARS IN 1 SECTION:
└─ ✅ Health (Mental Health category + tags)
```

### Example 4: Tech Instructor

```
ONBOARDING INPUT:
├─ Education: Graduated 2019
├─ Category: Programming & Tech
└─ Tags: Python, Web Development, JavaScript

RESULT - APPEARS IN 1 SECTION:
└─ ✅ Academic Support (Programming & Tech → Academic Support)
```

### Example 5: Multi-Expertise Career Coach

```
ONBOARDING INPUT:
├─ Education: Graduated 2015
├─ Categories: Career Development, Leadership & Development
└─ Tags: Leadership Skills, Interview Preparation, Career Counseling

RESULT - APPEARS IN 1 SECTION:
└─ ✅ Mock Interviews (all expertise converges here)
```

### Example 6: Test Prep Specialist

```
ONBOARDING INPUT:
├─ Education: Graduated 2020
├─ Category: Test Preparation
└─ Tags: SAT, GRE, GMAT

RESULT - APPEARS IN 1 SECTION:
└─ ✅ Academic Support (Test Preparation → Academic Support)
```

## 🗺️ Complete Category Mapping

### Career Development →

- ✅ Mock Interviews
- ✅ Resume Review

### Academic Support →

- ✅ Academic Support

### Mental Health →

- ✅ Health

### Programming & Tech →

- ✅ Academic Support

### Test Preparation →

- ✅ Academic Support

### Creative Arts →

- ✅ Academic Support

### Business & Finance →

- ✅ Mock Interviews
- ✅ Resume Review

### Leadership & Development →

- ✅ Mock Interviews

## 🏷️ Common Tags Mapping

### Career Tags

| Tag                   | Featured Section |
| --------------------- | ---------------- |
| Resume Writing        | Resume Review    |
| Interview Preparation | Mock Interviews  |
| Career Counseling     | Mock Interviews  |
| Job Search Strategies | Resume Review    |
| LinkedIn Profile      | Resume Review    |

### Academic Tags

| Tag          | Featured Section |
| ------------ | ---------------- |
| Mathematics  | Academic Support |
| Science      | Academic Support |
| Python       | Academic Support |
| SAT/GRE/GMAT | Academic Support |
| Study Skills | Academic Support |

### Health Tags

| Tag               | Featured Section |
| ----------------- | ---------------- |
| Stress Management | Health           |
| Anxiety Support   | Health           |
| Work-Life Balance | Health           |
| Mindfulness       | Health           |

### Leadership Tags

| Tag                  | Featured Section |
| -------------------- | ---------------- |
| Leadership Skills    | Mock Interviews  |
| Team Management      | Mock Interviews  |
| Communication Skills | Mock Interviews  |

## 🔄 Priority Order

```
1. Check Education Data
   ├─ Graduated within 2 years? → Recent Graduates
   └─ Currently studying? → Recent Graduates

2. Check Expertise Tags (Most Specific)
   └─ Map individual tags to sections

3. Check Categories (Broader)
   └─ Map broad categories to sections
```

## ⚠️ Important Notes

1. **Multiple Sections**: Mentors can appear in 2-3 sections based on expertise
2. **Recent Graduates**: Always auto-detected from education data
3. **Tag Priority**: Tags are more specific than categories
4. **No Match**: Mentors with unmapped expertise won't appear

## 🔍 How to Verify

Run this SQL query in Supabase:

```sql
SELECT
  full_name,
  categories,
  expertise_tags,
  -- Check education for Recent Graduate
  CASE
    WHEN education IS NOT NULL THEN
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(education) AS edu
        WHERE (edu->>'currentlyStudying')::boolean = true
           OR (edu->>'yearTo')::int >= EXTRACT(YEAR FROM CURRENT_DATE) - 2
      )
    ELSE false
  END AS is_recent_graduate
FROM expert_profiles;
```

## 💡 Tips for Mentors

**To appear in Recent Graduates:**

- Add education with graduation within 2 years
- OR check "Currently Studying"

**To appear in Mock Interviews:**

- Select "Career Development", "Business & Finance", or "Leadership & Development"
- Add tags like "Interview Preparation", "Leadership Skills"

**To appear in Resume Review:**

- Select "Career Development" or "Business & Finance"
- Add tags like "Resume Writing", "LinkedIn Profile Optimization"

**To appear in Academic Support:**

- Select "Academic Support", "Programming & Tech", "Test Preparation", or "Creative Arts"
- Add specific subject tags (Math, Python, SAT, etc.)

**To appear in Health:**

- Select "Mental Health"
- Add tags like "Stress Management", "Mindfulness"

## 📊 Expected Distribution

Based on onboarding options:

```
Recent Graduates  ████░░░░░░  20-30% (auto-detected)
Academic Support  ████████░░  40-50% (largest category)
Mock Interviews   ███████░░░  30-40%
Resume Review     █████░░░░░  20-30%
Health            ██░░░░░░░░  10-15%
```

Most mentors will appear in 1-2 sections.
Career mentors often appear in 2-3 sections.
