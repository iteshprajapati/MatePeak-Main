# Booking System - Quick Reference

## 🚀 Quick Start

### For Frontend Developers

#### Import the Service

```typescript
import {
  createBooking,
  getAvailableTimeSlots,
  getUserBookings,
} from "@/services/bookingService";
```

#### Create a Booking

```typescript
const result = await createBooking({
  expert_id: "mentor-uuid",
  session_type: "oneOnOneSession",
  scheduled_date: "2025-11-15",
  scheduled_time: "14:00",
  duration: 60,
  message: "Need help with React hooks",
  total_amount: 2000,
});

if (result.success) {
  navigate(`/booking-success?id=${result.data.id}`);
} else {
  toast.error(result.error);
}
```

#### Get Available Time Slots

```typescript
const result = await getAvailableTimeSlots(
  mentorId,
  new Date("2025-11-15"),
  60 // duration in minutes
);

if (result.success) {
  const availableSlots = result.data.filter((slot) => slot.available);
  // Display slots to user
}
```

#### Fetch User's Bookings

```typescript
const result = await getUserBookings();
if (result.success) {
  const bookings = result.data;
  // Display in dashboard
}
```

---

## 📊 Database Quick Reference

### Check Bookings for a Mentor

```sql
SELECT
  b.*,
  p.full_name as student_name
FROM bookings b
JOIN profiles p ON b.user_id = p.id
WHERE b.expert_id = 'mentor-uuid'
ORDER BY b.scheduled_date DESC;
```

### Check Available Slots Setup

```sql
-- Check recurring availability
SELECT * FROM availability_slots
WHERE expert_id = 'mentor-uuid'
AND is_recurring = true;

-- Check specific dates
SELECT * FROM availability_slots
WHERE expert_id = 'mentor-uuid'
AND is_recurring = false
AND specific_date >= CURRENT_DATE;

-- Check blocked dates
SELECT * FROM blocked_dates
WHERE expert_id = 'mentor-uuid'
AND date >= CURRENT_DATE;
```

### Find Conflicting Bookings

```sql
SELECT * FROM bookings
WHERE expert_id = 'mentor-uuid'
AND scheduled_date = '2025-11-15'
AND status IN ('pending', 'confirmed')
ORDER BY scheduled_time;
```

---

## 🔧 Common Tasks

### Add Mentor Availability

#### Recurring (Every Monday 9 AM - 5 PM)

```sql
INSERT INTO availability_slots (expert_id, day_of_week, start_time, end_time, is_recurring)
VALUES ('mentor-uuid', 1, '09:00', '17:00', true);
```

#### Specific Date

```sql
INSERT INTO availability_slots (expert_id, specific_date, start_time, end_time, is_recurring)
VALUES ('mentor-uuid', '2025-11-15', '14:00', '18:00', false);
```

### Block a Date

```sql
INSERT INTO blocked_dates (expert_id, date, reason)
VALUES ('mentor-uuid', '2025-11-25', 'Holiday');
```

### Cancel a Booking

```typescript
const result = await cancelBooking(bookingId);
```

Or via SQL:

```sql
UPDATE bookings
SET status = 'cancelled'
WHERE id = 'booking-uuid';
```

### Update Booking Status

```sql
-- Confirm booking
UPDATE bookings
SET status = 'confirmed'
WHERE id = 'booking-uuid';

-- Mark as completed
UPDATE bookings
SET status = 'completed'
WHERE id = 'booking-uuid';
```

---

## 🎯 Testing Checklist

### Happy Path

- [ ] User can select service
- [ ] Available time slots load correctly
- [ ] User can select date and time
- [ ] Form pre-fills user data
- [ ] Booking creates successfully
- [ ] Success page displays correct info

### Edge Cases

- [ ] No availability set up
- [ ] Date is blocked
- [ ] All slots booked
- [ ] Double booking prevention works
- [ ] Different durations handled correctly

### Error Handling

- [ ] Not logged in → error message
- [ ] Network error → retry option
- [ ] Invalid data → validation message
- [ ] Booking conflict → alternative suggestions

---

## 🐛 Debugging

### Check Browser Console

```javascript
// Enable debug logs
localStorage.setItem("debug", "booking:*");

// View all bookings
console.table(await getUserBookings());

// Check availability
console.log(await getAvailableTimeSlots(mentorId, date, 60));
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to Logs → Database
3. Filter by table: `bookings`, `availability_slots`
4. Look for errors or slow queries

### Common Errors

#### "You must be logged in"

```typescript
// Check auth state
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("User:", user);
```

#### "No available slots"

```typescript
// Check mentor availability
const result = await getMentorAvailability(mentorId, date, date);
console.log("Availability:", result.data);

// Check bookings
const bookedResult = await getBookedSlots(mentorId, date);
console.log("Booked:", bookedResult.data);
```

#### "Failed to create booking"

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- Try as superuser
INSERT INTO bookings (user_id, expert_id, session_type, ...)
VALUES (...);
```

---

## 📱 Components Reference

### Using BookingDialog

```tsx
<BookingDialog
  open={open}
  onOpenChange={setOpen}
  mentorId={mentor.id}
  mentorName={mentor.full_name}
  mentorImage={mentor.profile_picture_url}
  services={mentor.services}
  servicePricing={mentor.service_pricing}
  timezone={mentor.timezone}
/>
```

### Component Props

#### ServiceSelection

```typescript
{
  services: any;
  servicePricing: any;
  onServiceSelect: (service: SelectedService) => void;
}
```

#### DateTimeSelection

```typescript
{
  selectedService: SelectedService;
  mentorId: string;
  timezone: string;
  onDateTimeSelect: (dateTime: SelectedDateTime) => void;
}
```

#### BookingConfirmation

```typescript
{
  selectedService: SelectedService;
  selectedDateTime: SelectedDateTime;
  mentorName: string;
  onSubmit: (details: BookingDetails) => void;
  onChangeDateTime: () => void;
  isSubmitting?: boolean;
}
```

---

## 🔐 Security Notes

### Row Level Security (RLS)

- Users can only view their own bookings + bookings where they're the mentor
- Users can only create bookings for themselves
- Only mentors can update booking status
- Availability and blocked dates are publicly viewable

### Data Validation

- All dates validated on server
- Double booking prevented by database trigger
- Status transitions validated
- Only valid session types allowed

---

## 📈 Performance Tips

### Frontend

```typescript
// Cache availability data
const [availabilityCache, setAvailabilityCache] = useState({});

// Debounce date selection
const debouncedFetchSlots = useMemo(() => debounce(fetchTimeSlots, 300), []);
```

### Database

```sql
-- Use indexes for common queries
CREATE INDEX idx_bookings_expert_date
ON bookings(expert_id, scheduled_date);

-- Use views for complex queries
SELECT * FROM upcoming_bookings
WHERE expert_id = 'mentor-uuid';
```

---

## 🔄 Migration Commands

### Apply Migration

```bash
# Using Supabase CLI
supabase db push

# Or apply specific migration
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20251101000000_enhance_bookings_system.sql
```

### Rollback (if needed)

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS prevent_double_booking ON bookings;

-- Drop function
DROP FUNCTION IF EXISTS check_booking_conflict();

-- Remove indexes
DROP INDEX IF EXISTS idx_bookings_expert_date;
```

---

## 📞 Support Resources

### Documentation

- [Full Backend Integration Guide](./BACKEND_INTEGRATION_GUIDE.md)
- [Booking System Implementation](./BOOKING_SYSTEM_IMPLEMENTATION.md)
- [Testing Guide](./BOOKING_TESTING_GUIDE.md)

### Code Locations

- Service: `src/services/bookingService.ts`
- Components: `src/components/booking/`
- Success Page: `src/pages/BookingSuccess.tsx`
- Migration: `supabase/migrations/20251101000000_enhance_bookings_system.sql`

### Common Commands

```bash
# Check TypeScript errors
npm run type-check

# Run development server
npm run dev

# Check Supabase status
supabase status

# View database schema
supabase db dump --schema public > schema.sql
```

---

**Last Updated**: November 1, 2025
**Version**: 1.0.0
