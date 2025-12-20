# 🎯 Mentor Card Auto-Generation Implementation Guide

## Overview
This implementation ensures that when a mentor completes onboarding, their profile automatically creates a discoverable mentor card that appears in search results and explore pages.

---

## ✅ Implemented Features

### 1. **Mentor Card Sync Service** (`src/services/mentorCardService.ts`)
- **Transform Function**: Converts `expert_profiles` data into `MentorCard` format
- **Fetch Functions**: Get mentor cards with filtering by category, expertise, search query, price range
- **Rating Updates**: Auto-calculate and cache mentor ratings from reviews
- **Validation**: Check profile completeness and return missing fields
- **Scoring**: Calculate profile completeness score (0-100)

**Key Functions:**
```typescript
transformToMentorCard(profile)        // Transforms DB profile to card format
fetchMentorCards(filters)             // Fetch all cards with filters
fetchMentorCardByUsername(username)   // Get single mentor card
updateMentorRating(mentorId)          // Update cached rating
validateMentorProfile(profile)        // Check completeness
getMentorProfileScore(profile)        // Get 0-100 score
```

---

### 2. **Database Schema Enhancements** (`supabase/migrations/20251029130000_add_profile_status_and_visibility.sql`)

**New Columns Added:**
- `profile_status`: Control visibility (draft/active/inactive/pending_review/suspended)
- `profile_completeness_score`: Cached score (0-100)
- `is_featured`: Flag for featured mentors
- `is_verified`: Admin verification flag
- `average_rating`: Cached rating from reviews
- `total_reviews`: Cached review count
- `total_bookings`: Cached booking count
- `last_active_at`: Last activity timestamp

**Database Functions:**
- `calculate_profile_completeness(profile_id)`: Auto-calculate score
- `update_mentor_rating(mentor_id)`: Update rating from reviews

**Triggers:**
- Auto-update profile completeness score on insert/update
- Auto-update mentor rating when reviews change

**View:**
- `active_mentor_cards`: Pre-filtered view of active mentors with complete profiles

---

### 3. **Updated Explore Page** (`src/pages/Explore.tsx`)
- Integrated with mentor card service
- Fetches real mentor profiles from database
- Uses `MentorCard` component for consistent display
- Filters by category, expertise, search query
- Shows both database mentors and static mentors

---

### 4. **Post-Onboarding Success Flow** 
**Components:**
- `OnboardingSuccessModal`: Celebratory modal with confetti 🎉
- Shows mentor their live card preview
- Displays profile stats (reviews, rating, price)
- Provides actions: Share Profile, View Public Profile, Go to Dashboard
- Lists next steps for mentor

**Integration:**
- Added to `ExpertOnboarding.tsx`
- Shows automatically after successful profile creation
- Redirects to dashboard on close

---

### 5. **Real-Time Updates** (`src/hooks/useMentorCardUpdates.ts`)
**Hooks Created:**
- `useMentorCardUpdates`: Listen to profile changes
- `useMentorReviewUpdates`: Listen to review changes
- `useProfileCompleteness`: Track completeness score

**Features:**
- Supabase real-time subscriptions
- Toast notifications on updates
- Automatic cache invalidation
- Parent component callbacks

---

### 6. **Profile Completeness Widget** (`src/components/dashboard/ProfileCompletenessWidget.tsx`)
- Visual score display with color coding
- Progress bar
- Lists missing required fields
- Shows recommended improvements
- Displays completed sections
- "Improve Your Profile" CTA
- Tips to increase visibility

---

## 🔄 Auto-Generation Flow

```
Mentor Completes Onboarding
           ↓
expert_profiles INSERT/UPDATE
           ↓
[Trigger] calculate_profile_completeness()
           ↓
profile_completeness_score updated
           ↓
profile_status = 'active' (default)
           ↓
Mentor Card Available in:
  - Explore Page
  - Search Results
  - Category Filters
  - AI Search
           ↓
[On Review] update_mentor_rating()
           ↓
average_rating & total_reviews updated
```

---

## 🎨 Mentor Card Display Logic

**Visibility Rules:**
- Only mentors with `profile_status = 'active'` appear
- Minimum `profile_completeness_score >= 60` recommended
- Featured mentors (`is_featured = true`) appear first
- Sorted by: featured → rating → review count

**Card Data:**
- Name, title, profile picture
- Categories/expertise tags
- Rating & review count
- Starting price
- Connection options (1:1, chat, etc.)
- Link to public profile

---

## 📊 Profile Completeness Scoring

**Required Fields (15 points each = 60 total):**
- Full Name
- Username
- Category/Categories
- Bio (50+ characters)

**Recommended Fields (10 points each = 40 total):**
- Profile Picture
- Services Configuration
- Pricing Setup
- Expertise Tags

**Score Ranges:**
- 0-39%: Needs Improvement ⚠️
- 40-59%: Fair 🔄
- 60-79%: Good ✅
- 80-100%: Excellent ✨

---

## 🚀 Usage Examples

### Fetch Mentor Cards in Any Component
```typescript
import { fetchMentorCards } from "@/services/mentorCardService";

const cards = await fetchMentorCards({
  category: "Programming & Tech",
  expertise: "Python",
  searchQuery: "web development",
  priceRange: [500, 2000]
});
```

### Get Single Mentor Card
```typescript
import { fetchMentorCardByUsername } from "@/services/mentorCardService";

const card = await fetchMentorCardByUsername("johndoe");
```

### Listen to Real-Time Updates
```typescript
import { useMentorCardUpdates } from "@/hooks/useMentorCardUpdates";

useMentorCardUpdates((mentorId) => {
  console.log("Mentor updated:", mentorId);
  // Refresh your data
});
```

### Display Profile Completeness
```typescript
import ProfileCompletenessWidget from "@/components/dashboard/ProfileCompletenessWidget";

<ProfileCompletenessWidget 
  profile={expertProfile}
  onImprove={() => navigate("/profile/edit")}
/>
```

---

## 🔧 Next Steps & Enhancements

### Immediate Priorities:
1. ✅ Run database migration
2. ✅ Test mentor card generation
3. ✅ Verify search/filter functionality
4. ✅ Test real-time updates

### Future Enhancements:
1. **Admin Moderation Dashboard**
   - Review pending profiles
   - Approve/reject mentors
   - Feature/verify mentors

2. **Advanced Search**
   - Location-based filtering
   - Language filtering
   - Availability filtering
   - Rating range filtering

3. **Caching Layer**
   - Redis cache for popular searches
   - CDN for profile images
   - Edge caching for card data

4. **Analytics**
   - Track card impressions
   - Monitor click-through rates
   - Measure conversion rates
   - A/B test card designs

5. **SEO Optimization**
   - Generate sitemap for mentor profiles
   - Add structured data markup
   - Optimize meta tags
   - Create shareable OpenGraph images

---

## 🐛 Troubleshooting

### Mentor card not appearing after onboarding?
1. Check `profile_status = 'active'`
2. Verify `profile_completeness_score >= 60`
3. Run: `SELECT * FROM expert_profiles WHERE id = 'mentor_id'`

### Rating not updating?
1. Check trigger: `SELECT * FROM pg_trigger WHERE tgname = 'update_mentor_rating_on_review'`
2. Manually update: `SELECT update_mentor_rating('mentor_id')`

### Real-time updates not working?
1. Check Supabase Realtime is enabled
2. Verify RLS policies allow SELECT
3. Check browser console for subscription errors

---

## 📝 Files Created/Modified

**New Files:**
- `src/services/mentorCardService.ts`
- `src/hooks/useMentorCardUpdates.ts`
- `src/components/onboarding/OnboardingSuccessModal.tsx`
- `src/components/dashboard/ProfileCompletenessWidget.tsx`
- `supabase/migrations/20251029130000_add_profile_status_and_visibility.sql`

**Modified Files:**
- `src/pages/Explore.tsx`
- `src/pages/ExpertOnboarding.tsx`

---

## ✨ Key Benefits

1. **Instant Discoverability**: Mentors appear immediately after onboarding
2. **Quality Control**: Profile scoring ensures quality standards
3. **Real-Time Sync**: Changes reflect instantly across the platform
4. **Better UX**: Success modal celebrates mentor achievement
5. **Data-Driven**: Analytics-ready with cached metrics
6. **Scalable**: Optimized queries with indexes and views
7. **Maintainable**: Centralized card logic in service layer

---

🎉 **All critical mentor card features have been implemented!**
