# Availability Tab Advanced Features

## Overview
This document describes three advanced features added to the mentor availability tab to enhance the booking experience and improve mentor-mentee communication.

## Features Implemented

### 1. **Request Custom Time** 🗓️

**Purpose:** Allow mentees to request session times that aren't currently in the mentor's published availability schedule.

**User Flow:**
1. Mentee clicks "Request Custom Time" button in the availability tab
2. Opens dialog with:
   - Date picker (minimum: today)
   - Start time input
   - End time input
   - Optional message field for special requirements
3. Submit creates a pending booking request
4. Mentor receives notification and can approve/decline
5. Mentee gets email notification with mentor's response

**Technical Implementation:**
- **Component:** Dialog component in `ProfileAvailability.tsx`
- **State Management:**
  - `customTimeDialogOpen`: Controls dialog visibility
  - `requestedDate`, `requestedStartTime`, `requestedEndTime`: Form fields
  - `requestMessage`: Optional message from mentee
  - `submittingRequest`: Loading state during submission

- **Database Table:** `booking_requests`
  ```sql
  - id: UUID (primary key)
  - mentee_id: UUID (references auth.users)
  - mentor_id: UUID (references auth.users)
  - requested_date: DATE
  - requested_start_time: TIME
  - requested_end_time: TIME
  - message: TEXT (optional)
  - status: TEXT (pending/approved/declined)
  - mentor_response: TEXT
  - created_at, updated_at: TIMESTAMP
  ```

- **Handler:** `handleCustomTimeRequest()`
  - Validates all required fields are filled
  - Checks user authentication
  - Inserts request into database with "pending" status
  - Shows success toast notification
  - Resets form and closes dialog

**UI Design:**
- Button: Outlined style with message icon, matepeak-primary border
- Dialog: Clean form layout with proper spacing
- Info box: Blue background explaining 24-hour response time
- Validation: Prevents submission with incomplete data

**RLS Policies:**
- Mentees can view/create their own requests
- Mentors can view/update requests made to them
- Automatic updated_at timestamp on changes

---

### 2. **Get Availability Alerts** 🔔

**Purpose:** Notify mentees when their preferred mentor adds new availability slots or when specific time slots become available.

**User Flow:**
1. Mentee clicks "Get Notified" button (changes to "Alerts Active" when enabled)
2. Opens dialog with:
   - Email address input
   - Multi-select for preferred days (Monday-Sunday)
   - Information about notification triggers
3. Submit creates/updates alert subscription
4. Mentee receives email when:
   - Mentor adds new slots on preferred days
   - Previously booked slots on preferred days open up
5. Can update preferences anytime by reopening dialog

**Technical Implementation:**
- **Component:** Dialog component in `ProfileAvailability.tsx`
- **State Management:**
  - `alertDialogOpen`: Controls dialog visibility
  - `alertsEnabled`: Tracks if user has active subscription
  - `alertEmail`: Email address for notifications
  - `alertDaysPreference`: Array of selected days
  - `submittingAlert`: Loading state during submission

- **Database Table:** `availability_alerts`
  ```sql
  - id: UUID (primary key)
  - mentee_id: UUID (references auth.users)
  - mentor_id: UUID (references auth.users)
  - email: TEXT
  - preferred_days: TEXT[] (array of day names)
  - is_active: BOOLEAN
  - created_at, updated_at: TIMESTAMP
  - UNIQUE constraint on (mentee_id, mentor_id)
  ```

- **Handler:** `handleAlertSubscription()`
  - Validates email and at least one day selected
  - Checks user authentication
  - Uses UPSERT to create or update existing subscription
  - Updates local state to reflect active status
  - Shows success toast notification

- **Helper:** `toggleAlertDay(day: string)`
  - Adds/removes day from preference array
  - Provides smooth multi-select UX

**UI Design:**
- Button: Outline style with bell icon, green accent when active
- Dialog: Grid layout for day selection (2 columns)
- Day buttons: Toggle between outlined and filled (matepeak-primary)
- Check icons: Show/hide based on selection
- Info box: Green background explaining notification triggers

**RLS Policies:**
- Users can view/manage their own subscriptions
- Mentors can view alerts subscribed to their profile
- UPSERT prevents duplicate subscriptions

**Loading on Mount:**
- `fetchAvailability()` checks for existing alert subscription
- Auto-populates email and preferences if found
- Updates button text to "Alerts Active"

---

### 3. **Session Type Filter** (Prepared for Future Implementation) 🔍

**Purpose:** Allow mentees to filter availability by specific session types (e.g., "Career Guidance", "Code Review", "Mock Interview").

**Implementation Status:** State prepared, UI ready for integration

**State Variables:**
- `sessionTypes`: Array of available session types
- `selectedSessionType`: Currently selected filter (default: "all")

**Planned Features:**
- Filter dropdown above view tabs
- "All Sessions" option plus mentor's service types
- Updates both week view and recurring schedule
- Integration with booking flow to include session type

---

## Database Migration

**File:** `supabase/migrations/20251029113049_add_booking_requests_and_alerts.sql`

**Contents:**
1. **Tables:** `booking_requests`, `availability_alerts`
2. **Indexes:** Optimized for common queries (mentee_id, mentor_id, status, date)
3. **RLS Policies:** Secure access control for both tables
4. **Triggers:** Auto-update `updated_at` timestamps
5. **Comments:** Documentation for table purposes

**To Apply Migration:**
```bash
# If using Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard
# SQL Editor > Paste migration content > Run
```

---

## Integration Points

### With Booking System
- Custom time requests can convert to bookings upon mentor approval
- Booking data includes session type (when filter implemented)
- Timezone preserved throughout request/booking flow

### With Notification System
- Email notifications for:
  - Custom time request responses
  - New availability on preferred days
  - Slot openings matching preferences
- Can extend to push notifications in future

### With Mentor Dashboard
- Mentors need view to see/respond to custom time requests
- Dashboard should show alert subscriber count
- Analytics on popular request times

---

## Styling Consistency

All features follow established design system:

**Colors:**
- Primary: `matepeak-primary` (#000000)
- Secondary: `matepeak-secondary`
- Accent: `matepeak-yellow`
- Backgrounds: `gray-50` (page), `white` (cards)
- Borders: `gray-200`, `gray-300`

**Components:**
- Buttons: Rounded (`rounded-lg`), proper hover states
- Cards: `rounded-xl` or `rounded-2xl`, subtle shadows
- Dialogs: Max width 500px, clean spacing
- Inputs: Border `gray-300`, focus rings

**Spacing:**
- Gap between elements: `gap-2`, `gap-3`, `gap-4`
- Card padding: `p-4`, `p-6`
- Compact layout maintained throughout

**Icons:**
- Size: `h-4 w-4` for most contexts
- lucide-react library
- Proper semantic meaning

---

## Future Enhancements

### Phase 2 Improvements
1. **Session Type Filter**
   - Fetch session types from mentor profile
   - Implement filter dropdown UI
   - Add filtering logic to `getWeekSchedule()`

2. **Custom Time Request Management**
   - Mentor dashboard page for reviewing requests
   - Approve/decline with response message
   - Convert approved requests to bookings
   - Statistics on request patterns

3. **Enhanced Alerts**
   - Time range preferences (e.g., "only morning slots")
   - Frequency control (immediate vs daily digest)
   - Push notifications for mobile app
   - Alert when specific mentor adds any availability

4. **Analytics**
   - Track most requested times
   - Monitor alert subscription rates
   - Measure feature adoption

### Integration with AI
- AI suggests best times to request based on mentor patterns
- Auto-fill request message with session goals
- Smart alert preferences based on mentee schedule

---

## Testing Checklist

### Request Custom Time
- [ ] Dialog opens/closes properly
- [ ] Date picker enforces minimum date
- [ ] Time inputs validate properly
- [ ] Message field optional but saves correctly
- [ ] Submission requires authentication
- [ ] Success toast appears
- [ ] Form resets after submission
- [ ] Database record created with correct data
- [ ] RLS policies prevent unauthorized access

### Availability Alerts
- [ ] Dialog opens/closes properly
- [ ] Email validation works
- [ ] Day toggle buttons respond correctly
- [ ] At least one day required
- [ ] Submission requires authentication
- [ ] Success toast appears
- [ ] Button updates to "Alerts Active"
- [ ] Existing alerts load on mount
- [ ] UPSERT prevents duplicates
- [ ] Can update preferences

### UI/UX
- [ ] Consistent styling across all dialogs
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states show properly
- [ ] Error messages clear and helpful
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Icons semantic and clear

---

## Troubleshooting

### Common Issues

**Issue:** "Please sign in" error when submitting
- **Cause:** User not authenticated
- **Solution:** Check Supabase auth state, redirect to login if needed

**Issue:** Alert subscription not saving
- **Cause:** RLS policy blocking insert/update
- **Solution:** Verify user ID matches mentee_id in policy

**Issue:** Dialog not closing after submission
- **Cause:** State not updating
- **Solution:** Ensure `setDialogOpen(false)` called after success

**Issue:** Existing alerts not loading
- **Cause:** Query failing silently
- **Solution:** Check console for errors, verify table name and columns

### Debug Commands

```javascript
// Check user authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Test booking_requests insert
const { data, error } = await supabase
  .from("booking_requests")
  .insert({ /* your data */ })
  .select();
console.log('Insert result:', { data, error });

// Test availability_alerts query
const { data, error } = await supabase
  .from("availability_alerts")
  .select("*")
  .eq("mentee_id", userId);
console.log('Alerts:', { data, error });
```

---

## Conclusion

These three features significantly enhance the booking experience by:
1. **Flexibility:** Mentees can request times outside published schedule
2. **Proactivity:** Alerts keep mentees informed of new opportunities  
3. **Convenience:** Reduces back-and-forth communication

The implementation maintains design consistency, follows security best practices, and integrates seamlessly with existing functionality. Future phases will add mentor-side management and advanced filtering capabilities.

