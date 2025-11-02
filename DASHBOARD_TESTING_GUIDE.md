# Student Dashboard Testing Guide

## 🧪 How to Test the New Dashboard

### **Prerequisites:**
✅ Dev server running on http://localhost:8080
✅ Supabase project configured
✅ Student account created

---

## 📋 Testing Checklist

### **1. Access Dashboard**
- [ ] Navigate to http://localhost:8080
- [ ] Login with student credentials
- [ ] Verify redirect to `/dashboard`
- [ ] See "Student Dashboard" header
- [ ] See 7 tabs: Overview, Sessions, Calendar, Messages, Mentors, Reviews, Profile

---

### **2. Overview Tab (Default)**
**Should Display:**
- [ ] 4 stat cards (Upcoming Sessions, Total Hours, Active Mentors, Pending Reviews)
- [ ] Quick Actions section with 4 buttons
- [ ] Next Session widget (if you have upcoming sessions)
- [ ] Upcoming Sessions preview (next 3)
- [ ] OR "No Upcoming Sessions" empty state

**Test Actions:**
- [ ] Click "Find Mentors" → redirects to `/explore`
- [ ] Click stat cards (visual feedback)
- [ ] Hover effects work on cards

---

### **3. My Sessions Tab**
**Should Display:**
- [ ] 4 sub-tabs (Upcoming, Past, Cancelled, All)
- [ ] Search bar
- [ ] Export CSV button
- [ ] Session cards with mentor info

**Test Actions:**
- [ ] Switch between sub-tabs
- [ ] Search for a mentor name
- [ ] Click "Export CSV" → downloads file
- [ ] Click "Join Session" on confirmed session
- [ ] Click "Message" button
- [ ] Click "Cancel" → shows confirmation
- [ ] Click "Write Review" on completed session

---

### **4. Calendar Tab**
**Should Display:**
- [ ] Current month name
- [ ] Previous/Next/Today navigation buttons
- [ ] 7-day week header (Sun-Sat)
- [ ] Calendar grid with dates
- [ ] Color-coded session indicators
- [ ] Legend showing colors (Confirmed, Pending, Completed)

**Test Actions:**
- [ ] Click Previous/Next month
- [ ] Click "Today" → returns to current month
- [ ] Click on a session → opens details modal
- [ ] Close modal
- [ ] Click "Export .ics" → downloads calendar file

---

### **5. Messages Tab**
**Should Display:**
- [ ] Two-panel layout (conversations list + chat)
- [ ] Search bar in conversations
- [ ] Sample conversations with mentors
- [ ] Online status indicators
- [ ] Message input at bottom

**Test Actions:**
- [ ] Click different conversations
- [ ] Search for a mentor
- [ ] Type in message input
- [ ] Click "Send" button
- [ ] Scroll through messages

*Note: Real messaging requires backend implementation*

---

### **6. My Mentors Tab**
**Should Display:**
- [ ] Grid of mentor cards
- [ ] Search bar
- [ ] Each card shows: avatar, name, expertise, rating, stats

**Test Actions:**
- [ ] Search for a mentor
- [ ] Click heart icon to favorite
- [ ] Click "Book Again" button
- [ ] Click "Message" button
- [ ] Click mentor name → redirects to profile
- [ ] Hover effects on cards

---

### **7. Reviews Tab**
**Should Display:**
- [ ] "Pending Reviews" section (orange)
- [ ] "Your Reviews" section
- [ ] Review forms for completed sessions
- [ ] 5-star rating system

**Test Actions:**
- [ ] Click stars to rate
- [ ] Type review comment
- [ ] Click "Submit Review"
- [ ] See success toast
- [ ] Review moves to "Your Reviews"
- [ ] Click "Edit" on submitted review
- [ ] Click "Delete" → shows confirmation

---

### **8. Profile Tab**
**Should Display:**
- [ ] Personal Information section
- [ ] Notification Preferences section
- [ ] Account & Security section
- [ ] Payment Methods section
- [ ] Danger Zone section

**Test Actions:**
- [ ] Edit name, phone, location
- [ ] Add interests/topics (press Enter)
- [ ] Remove interest tags
- [ ] Toggle notification switches
- [ ] Click "Save Changes"
- [ ] See success toast
- [ ] Scroll to Danger Zone
- [ ] Click "Delete Account" → shows warnings

---

## 🔍 What to Look For

### **Visual Quality:**
- [ ] Consistent styling across all tabs
- [ ] Smooth transitions and animations
- [ ] Proper spacing and alignment
- [ ] Readable text sizes
- [ ] Professional color scheme
- [ ] Icons display correctly
- [ ] Loading skeletons appear during data fetch

### **Responsiveness:**
- [ ] Test on desktop (1920px)
- [ ] Test on laptop (1366px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Menu collapses properly
- [ ] Cards stack vertically on mobile
- [ ] No horizontal scrolling

### **Data Integration:**
- [ ] Real data loads from Supabase
- [ ] Empty states show when no data
- [ ] Loading states appear briefly
- [ ] Error handling (try offline mode)
- [ ] Toast notifications work
- [ ] Page refreshes maintain data

---

## 🐛 Common Issues & Fixes

### **Issue: TypeScript errors in VS Code**
**Fix:** These are false positives. The dev server compiles fine. Restart VS Code or run:
```bash
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### **Issue: No sessions showing**
**Fix:** Book a test session:
1. Go to Explore page
2. Find a mentor
3. Book a session
4. Return to dashboard

### **Issue: Stats showing 0**
**Fix:** This is expected if you're a new user. Complete actions:
- Book sessions → increases sessions count
- Complete sessions → increases hours
- Write reviews → decreases pending reviews

### **Issue: Empty conversations in Messages**
**Fix:** This is expected - real messaging requires:
- Supabase real-time subscriptions
- Messages table in database
- Backend message handling

### **Issue: Can't see mentor cards in "My Mentors"**
**Fix:** You need to book at least one session with a mentor first

---

## 📊 Test Scenarios

### **Scenario 1: New Student**
1. Sign up as new student
2. See all empty states
3. Click "Find Mentors"
4. Book first session
5. Return to dashboard
6. See session in Overview
7. Check all tabs update

### **Scenario 2: Active Student**
1. Login with existing account
2. See populated stats
3. Check upcoming sessions
4. Navigate calendar
5. Send messages
6. Write reviews
7. Update profile

### **Scenario 3: Power User**
1. Have 10+ sessions
2. Multiple mentors
3. Several reviews written
4. Test search/filter
5. Test export features
6. Test bulk actions

---

## ✅ Success Criteria

**Dashboard is working correctly if:**
- ✅ All 7 tabs load without errors
- ✅ Data displays from Supabase
- ✅ Actions trigger appropriate responses
- ✅ UI is responsive on all screen sizes
- ✅ Loading states appear during data fetch
- ✅ Empty states show helpful prompts
- ✅ Toast notifications confirm actions
- ✅ Navigation works smoothly
- ✅ No console errors (except expected warnings)

---

## 🚀 Ready to Test!

Open http://localhost:8080 and start testing! Report any issues you find.

**Quick Test URL:**
```
http://localhost:8080/dashboard
```

**Sample Test Flow:**
1. Login → Dashboard → See Overview
2. Click each tab → Verify content loads
3. Try search/filter features
4. Test action buttons
5. Check responsive design
6. Update profile and save

Enjoy your new dashboard! 🎉
