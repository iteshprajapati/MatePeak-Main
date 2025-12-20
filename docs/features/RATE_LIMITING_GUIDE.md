/\*\*

- Rate Limiting Usage Examples and Integration Guide
  \*/

## 🚀 Quick Start

### 1. Database Migration

Run the migration to set up rate limiting tables:

```bash
# Apply the migration
supabase db push

# Or manually run:
psql -f supabase/migrations/20251220000000_add_rate_limiting.sql
```

### 2. Basic Usage in Components

```typescript
import { useRateLimit } from "@/hooks/useRateLimit";

function BookingButton() {
  const { execute, isChecking } = useRateLimit("booking_create");

  const handleBooking = async () => {
    const result = await execute(async () => {
      return await createBooking(bookingData);
    });

    if (result) {
      toast.success("Booking created!");
    }
  };

  return (
    <Button onClick={handleBooking} disabled={isChecking}>
      {isChecking ? "Checking..." : "Book Session"}
    </Button>
  );
}
```

### 3. In Service Functions

Already integrated in:

- ✅ `bookingService.ts` - createBooking()
- ✅ Prevents spam booking requests (5 per hour)

### 4. For Search Queries

```typescript
import { checkRateLimit } from "@/services/rateLimitService";

async function handleSearch(query: string) {
  const rateLimit = await checkRateLimit("search_query");

  if (!rateLimit.allowed) {
    toast.error("Too many searches. Please slow down.");
    return;
  }

  // Proceed with search
  const results = await searchMentors(query);
}
```

## 📊 Rate Limit Configuration

Default limits (configured in database):

| Action              | Max Requests | Time Window |
| ------------------- | ------------ | ----------- |
| **booking_create**  | 5            | 1 hour      |
| **booking_request** | 10           | 1 hour      |
| **message_send**    | 30           | 1 hour      |
| **review_create**   | 3            | 1 hour      |
| **search_query**    | 100          | 1 minute    |
| **profile_update**  | 10           | 1 hour      |
| **api_call**        | 60           | 1 minute    |

## 🔧 Customizing Rate Limits

Update limits in the database:

```sql
UPDATE rate_limit_config
SET max_requests = 10, time_window_minutes = 120
WHERE action_type = 'booking_create';
```

## 🎯 Integration Checklist

- [x] Database migration created
- [x] Rate limiting service created
- [x] React hook created
- [x] Booking creation protected
- [ ] Review creation protected (add to review service)
- [ ] Message sending protected (add to messaging)
- [ ] Search queries protected (add to search)
- [ ] Profile updates protected (add to profile service)

## 🔍 Monitoring

Check rate limit status:

```typescript
const status = await getRateLimitStatus("booking_create");
console.log(status);
// {
//   action_type: "booking_create",
//   current_count: 2,
//   max_requests: 5,
//   remaining: 3,
//   time_window_minutes: 60,
//   resets_at: "2025-12-20T15:00:00Z"
// }
```

## ⚠️ Error Handling

The service "fails open" - if there's an error checking rate limits, it allows the action to prevent blocking legitimate users.

## 🧹 Maintenance

Rate limit logs are automatically cleaned up after expiration. For production, set up a cron job:

```sql
-- Run cleanup hourly
SELECT cleanup_rate_limit_logs();
```

## 🚀 Production Deployment

1. Apply migration to production database
2. Monitor rate_limit_log table size
3. Adjust limits based on actual usage
4. Set up alerts for high rate limit violations
5. Consider adding Redis cache for even faster checks
