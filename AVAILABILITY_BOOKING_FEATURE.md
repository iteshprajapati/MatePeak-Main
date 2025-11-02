# Availability Tab Booking Feature Implementation

## Overview

This document describes the implementation of the enhanced booking flow from the availability tab on mentor public profiles. When a user clicks the "Book" button on a specific time slot in the availability tab, they now go through the same 3-step booking process with the date and time automatically pre-selected.

## Changes Made

### 1. BookingDialog Component (`src/components/booking/BookingDialog.tsx`)

#### Added Features:

- **Pre-selected DateTime Support**: Added `preSelectedDateTime` prop to accept date/time from availability tab
- **Auto-step Progression**: When a date/time is pre-selected, the booking flow automatically skips the date/time selection step (Step 2)
- **Smart Step Navigation**: After selecting a service (Step 1), if a date/time is pre-selected, the dialog jumps directly to confirmation (Step 3)

#### Modified Code:

```typescript
interface BookingDialogProps {
  // ... existing props
  preSelectedDateTime?: SelectedDateTime | null;
}

// Added useEffect to handle pre-selected date/time
useEffect(() => {
  if (open && preSelectedDateTime) {
    setSelectedDateTime(preSelectedDateTime);
    setStep(1); // Start at service selection
  }
}, [open, preSelectedDateTime]);

// Modified handleServiceSelect to skip date/time step when pre-selected
const handleServiceSelect = (service: SelectedService) => {
  setSelectedService(service);
  if (service.type === "oneOnOneSession") {
    // If we already have a pre-selected date/time, skip to confirmation
    if (preSelectedDateTime || selectedDateTime) {
      setStep(3);
    } else {
      setStep(2);
    }
  }
  // ... rest of logic
};
```

### 2. ProfileAvailability Component (`src/components/profile/ProfileAvailability.tsx`)

#### Added Features:

- **Callback Prop**: Added `onBookSlot` callback prop to trigger parent booking dialog
- **Date Object Conversion**: Converts date string to Date object for compatibility with BookingDialog
- **Fallback Navigation**: Maintains backward compatibility with old navigation behavior

#### Modified Code:

```typescript
interface ProfileAvailabilityProps {
  mentorId: string;
  mentorName?: string;
  mentorTimezone?: string;
  onBookSlot?: (date: Date, time: string, timezone: string) => void;
}

const handleBookSlot = (date: string, startTime: string, endTime: string) => {
  const dateObj = new Date(date + "T00:00:00");

  if (onBookSlot) {
    const timezone = showUserTimezone ? userTimezone : mentorTimezone;
    onBookSlot(dateObj, startTime, timezone);
  } else {
    // Fallback to old navigation behavior
    // ... legacy code
  }
};
```

### 3. ProfileHeader Component (`src/components/profile/ProfileHeader.tsx`)

#### Refactored:

- **Removed Internal BookingDialog**: Moved dialog management to parent component
- **Added Callback Prop**: Added `onOpenBooking` prop to notify parent when booking should open
- **Simplified State**: Removed local `bookingDialogOpen` state

#### Modified Code:

```typescript
interface ProfileHeaderProps {
  // ... existing props
  onOpenBooking?: () => void;
}

const handleBookingClick = async () => {
  // ... auth check logic
  if (onOpenBooking) {
    onOpenBooking();
  }
};
```

### 4. MentorPublicProfile Page (`src/pages/MentorPublicProfile.tsx`)

#### Added Features:

- **Centralized Booking State**: Manages `bookingDialogOpen` and `preSelectedDateTime` state
- **Booking Callback**: Implements `handleBookFromAvailability` to handle bookings from availability tab
- **Single BookingDialog**: Renders one BookingDialog at page level, used by both header and availability tab

#### Implementation:

```typescript
const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
const [preSelectedDateTime, setPreSelectedDateTime] = useState<SelectedDateTime | null>(null);

// Callback for availability tab bookings
const handleBookFromAvailability = (date: Date, time: string, timezone: string) => {
  setPreSelectedDateTime({
    date,
    time,
    timezone,
  });
  setBookingDialogOpen(true);
};

// Pass callbacks to child components
<ProfileHeader
  // ... props
  onOpenBooking={() => {
    setPreSelectedDateTime(null);
    setBookingDialogOpen(true);
  }}
/>

<ProfileAvailability
  // ... props
  onBookSlot={handleBookFromAvailability}
/>

// Single BookingDialog for entire page
<BookingDialog
  // ... props
  preSelectedDateTime={preSelectedDateTime}
/>
```

## User Flow

### Before (Old Flow):

1. User clicks "Book" on availability time slot
2. Navigates to separate `/booking/:id` page
3. User manually selects date and time again
4. Fills in booking details
5. Submits booking

### After (New Flow):

1. User clicks "Book" on availability time slot
2. BookingDialog opens on same page (Step 1: Service Selection)
3. Date and time are automatically pre-selected from the clicked slot
4. User selects service type (30/60/90 min session, free demo, etc.)
5. Dialog automatically skips to Step 3 (Confirmation) with pre-filled date/time
6. User fills in their details (name, email, purpose)
7. Submits booking

## Benefits

1. **Seamless Experience**: No page navigation, stays on mentor profile
2. **Reduced Friction**: Date/time automatically selected from clicked slot
3. **Consistency**: Same 3-step booking flow throughout the application
4. **Time Savings**: Users don't need to re-select date/time they already clicked
5. **Context Preservation**: Users can see mentor profile while booking

## Testing

### Test Scenarios:

1. **Book from Availability Tab**:

   - Navigate to mentor public profile
   - Click "Availability" tab
   - Click "Book" on any time slot
   - Verify BookingDialog opens with date/time pre-selected
   - Select a service
   - Verify it skips to confirmation step
   - Complete booking

2. **Book from Header**:

   - Click "Book Session" button in profile header
   - Verify BookingDialog opens without pre-selected date/time
   - Select service
   - Manually select date/time in Step 2
   - Complete booking

3. **Week View Booking**:

   - In availability tab, ensure "Week View" is selected
   - Click "Book" on any slot
   - Verify correct date and time are pre-selected

4. **Recurring Schedule View**:
   - Switch to "Recurring Schedule" view
   - Note: Book buttons not shown in this view (by design)
   - Week view is primary booking interface

## Technical Notes

### Data Flow:

```
ProfileAvailability (Click "Book")
  ↓
handleBookSlot(dateStr, time)
  ↓
MentorPublicProfile.handleBookFromAvailability(Date, time, timezone)
  ↓
setPreSelectedDateTime({ date, time, timezone })
setBookingDialogOpen(true)
  ↓
BookingDialog receives preSelectedDateTime prop
  ↓
useEffect sets selectedDateTime state
  ↓
handleServiceSelect checks for preSelectedDateTime
  ↓
Skips to Step 3 (Confirmation)
```

### State Management:

- **Page Level**: `bookingDialogOpen`, `preSelectedDateTime` (in MentorPublicProfile)
- **Component Level**: `step`, `selectedService`, `selectedDateTime` (in BookingDialog)

### Backward Compatibility:

- ProfileAvailability still supports old navigation if `onBookSlot` callback is not provided
- BookingDialog works normally without `preSelectedDateTime` prop
- All existing booking flows remain functional

## Future Enhancements

1. **Direct Slot Reservation**: Consider adding ability to reserve slot temporarily while user fills details
2. **Time Zone Conversion**: Show selected time in both mentor's and user's timezone
3. **Recurring Booking**: Allow booking recurring sessions from single slot
4. **Quick Booking**: Add "Quick Book" for returning users with saved preferences

## Files Modified

1. `src/components/booking/BookingDialog.tsx` - Added pre-selected date/time support
2. `src/components/profile/ProfileAvailability.tsx` - Added booking callback
3. `src/components/profile/ProfileHeader.tsx` - Refactored to use parent dialog
4. `src/pages/MentorPublicProfile.tsx` - Centralized booking state management

## Dependencies

No new dependencies added. Uses existing:

- React hooks (useState, useEffect)
- React Router (useNavigate)
- Lucide icons
- Existing UI components (Dialog, Button, etc.)

## Accessibility

- Dialog remains keyboard accessible (Esc to close, Tab navigation)
- Pre-selected date/time clearly visible in confirmation step
- User can still change date/time by clicking "Change Date/Time" button
- Screen reader friendly with proper ARIA labels

## Performance

- No additional API calls required
- State management efficient with minimal re-renders
- Dialog lazy-loaded (already existing behavior)
- No performance impact on page load

---

**Implementation Date**: November 1, 2025
**Status**: ✅ Completed and Tested
**Developer**: GitHub Copilot
