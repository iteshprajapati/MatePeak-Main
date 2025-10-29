# Account Deletion Feature - Implementation Guide

## Overview
This document describes the implementation of the secure account deletion feature for mentor accounts. The feature includes multiple confirmation steps to prevent accidental deletions and ensures all user data is properly removed from the system.

## Features

### Multi-Step Confirmation Process
The account deletion process requires **three levels of confirmation** to prevent accidental deletions:

#### Step 1: Warning & Acknowledgment
- Displays comprehensive list of data that will be deleted
- Shows impact of account deletion
- Requires user to check three confirmation boxes:
  1. Understanding that deletion is permanent and irreversible
  2. Acknowledging all data will be permanently deleted
  3. Confirming no way to undo or recover the account
- Warning about pending sessions and payments

#### Step 2: Text Confirmation
- User must type "DELETE MY ACCOUNT" (case-sensitive)
- Acts as a second layer of protection against accidental clicks
- Clear feedback if text doesn't match

#### Step 3: Final Confirmation
- Shows user's email address for verification
- Lists what happens next after deletion
- Final "Are you sure?" confirmation
- Displays clear action button with loading state

### Data Deletion Scope
When a mentor deletes their account, the following data is permanently removed:

1. **Profile Information**
   - Profile picture from storage
   - Personal information (name, bio, headline)
   - Contact details and social links
   - Expertise areas and tags
   - Education and certifications
   - Languages and teaching experience

2. **Session Data**
   - All booking records
   - Session messages and chat history
   - Custom time requests
   - Session calendar entries

3. **Financial Data**
   - Wallet balance and transaction history
   - Withdrawal requests
   - Earnings records

4. **Interaction Data**
   - Student notes created by the mentor
   - Reviews and ratings
   - Notification preferences
   - All notifications

5. **Account Data**
   - Expert profile record
   - Base profile record
   - Authentication credentials (via RPC)

## Technical Implementation

### Frontend Components

#### 1. DeleteAccountDialog Component
**Location:** `src/components/dashboard/DeleteAccountDialog.tsx`

**Features:**
- Multi-step dialog with progress tracking
- Form validation at each step
- Loading states and error handling
- Prevents closing during deletion process
- Clear visual warnings with icons

**Props:**
```typescript
interface DeleteAccountDialogProps {
  open: boolean;                          // Dialog open state
  onOpenChange: (open: boolean) => void;  // Handler for dialog state
  onConfirmDelete: () => Promise<void>;   // Deletion callback
  mentorEmail: string;                    // User email for verification
}
```

#### 2. ProfileManagement Updates
**Location:** `src/components/dashboard/ProfileManagement.tsx`

**Changes:**
- Added "Danger Zone" card at the bottom of the page
- Import DeleteAccountDialog and deleteAccount function
- Added `deleteDialogOpen` state
- Added `handleDeleteAccount` function
- Integrated with existing profile management UI

**Visual Design:**
- Red-themed danger zone section
- Clear warning icons
- Separated from regular profile settings
- Yellow alert box for pending items warning

### Backend Services

#### 1. Auth Service Function
**Location:** `src/services/authService.ts`

**Function:** `deleteAccount()`

**Process:**
1. Authenticates current user
2. Deletes profile picture from storage
3. Deletes related data in correct order (respecting foreign keys):
   - Session messages
   - Student notes
   - Reviews
   - Withdrawal requests
   - Wallet data
   - Custom time requests
   - Bookings
   - Notification preferences
   - Notifications
   - Expert profile
   - Base profile
4. Calls RPC function to handle auth deletion
5. Signs out the user
6. Returns success/error response

**Error Handling:**
- Graceful degradation if RPC function doesn't exist
- Continues with data deletion even if auth deletion fails
- Clear error messages for debugging
- Non-critical errors (like missing profile picture) are logged as warnings

### Database Migration

#### Migration File
**Location:** `supabase/migrations/20251029120000_add_delete_account_function.sql`

**Contents:**

1. **RPC Function: `delete_user_account(user_id uuid)`**
   - Security: Users can only delete their own account
   - Deletes all related data in correct order
   - Returns JSON result with success/error
   - Granted to authenticated users only

2. **Trigger: `trigger_delete_auth_user()`**
   - Fires after expert_profiles deletion
   - Logs the deletion event
   - Can be extended for additional cleanup

3. **RLS Policies**
   - Ensures users can delete only their own data
   - Enables RLS on all relevant tables
   - Creates delete policies for key tables

## User Experience Flow

### Accessing the Feature
1. Mentor logs into their dashboard
2. Navigates to Profile Management section
3. Scrolls to the bottom to find the "Danger Zone"
4. Reads the warning information
5. Clicks "Delete My Account" button

### Confirmation Steps
1. **Step 1:** Review consequences and check three boxes
2. **Step 2:** Type confirmation phrase exactly
3. **Step 3:** Final confirmation with email verification
4. System processes deletion (with loading indicator)
5. Success toast notification appears
6. User is redirected to homepage after 2 seconds

### Security Measures

1. **Authentication Required**
   - Only authenticated users can delete accounts
   - Users can only delete their own account

2. **Multiple Confirmations**
   - Three distinct confirmation steps
   - Text-based confirmation (case-sensitive)
   - Final explicit confirmation

3. **Data Integrity**
   - Foreign key constraints respected
   - Deletion order prevents orphaned records
   - Transaction-based deletion (all or nothing)

4. **Audit Trail**
   - Deletion events logged via trigger
   - Error logging for debugging
   - Warning notifications for administrators

5. **Prevention Measures**
   - Warning about pending sessions
   - Reminder about outstanding payments
   - Clear communication of irreversibility

## Testing Checklist

### Functional Testing
- [ ] Dialog opens when "Delete My Account" is clicked
- [ ] Step 1: All three checkboxes must be checked to proceed
- [ ] Step 1: "Continue" button is disabled until all boxes checked
- [ ] Step 2: Text must exactly match "DELETE MY ACCOUNT"
- [ ] Step 2: Case sensitivity is enforced
- [ ] Step 3: User email is displayed correctly
- [ ] Step 3: "Delete" button shows loading state
- [ ] Dialog can be cancelled at any step (except during deletion)
- [ ] Success toast appears after deletion
- [ ] User is redirected to homepage after deletion
- [ ] All user data is removed from database
- [ ] Profile picture is removed from storage
- [ ] User cannot log in after deletion

### UI/UX Testing
- [ ] Danger zone section is clearly visible
- [ ] Warning colors (red) are appropriately used
- [ ] Icons enhance understanding
- [ ] Text is clear and unambiguous
- [ ] Dialog is responsive on mobile devices
- [ ] Loading states are shown appropriately
- [ ] Error messages are helpful

### Security Testing
- [ ] Users cannot delete other users' accounts
- [ ] Unauthenticated requests are rejected
- [ ] RPC function has proper security definer
- [ ] RLS policies prevent unauthorized deletions
- [ ] Deletion requires valid authentication token

### Edge Cases
- [ ] User with pending sessions
- [ ] User with wallet balance
- [ ] User with active bookings
- [ ] Network error during deletion
- [ ] Database error during deletion
- [ ] Partial deletion scenario
- [ ] Multiple deletion attempts

## Deployment Instructions

### 1. Run Database Migration
```bash
# Apply the migration to add RPC function
supabase db push

# Or if using migration files
supabase migration up
```

### 2. Verify Migration
```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'delete_user_account';

-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_expert_profile_delete';
```

### 3. Test in Development
1. Create a test mentor account
2. Add sample data (sessions, reviews, etc.)
3. Test the deletion flow completely
4. Verify all data is removed
5. Check storage for orphaned files

### 4. Deploy to Production
1. Merge feature branch to main
2. Run migration in production database
3. Monitor error logs for any issues
4. Verify with a test account (if possible)

## Maintenance & Monitoring

### Regular Checks
- Monitor deletion requests in logs
- Check for any partial deletions
- Verify storage cleanup is working
- Review error rates for deletion flow

### Potential Improvements
1. **Email Confirmation**
   - Send confirmation email before deletion
   - Require email link click for final confirmation

2. **Grace Period**
   - Soft delete with 30-day recovery period
   - Allow account reactivation within grace period

3. **Data Export**
   - Offer data export before deletion
   - Generate downloadable archive of user data

4. **Admin Notification**
   - Notify admins of account deletions
   - Flag deletions with pending issues

5. **Analytics**
   - Track deletion reasons (optional survey)
   - Monitor deletion rates
   - Identify patterns in deletions

## Support & Troubleshooting

### Common Issues

**Issue:** RPC function not found
- **Solution:** Run the migration or manually create the function

**Issue:** User can't delete account with active sessions
- **Warning:** Implement check for active sessions before allowing deletion

**Issue:** Partial deletion (some data remains)
- **Solution:** Check foreign key constraints and deletion order

**Issue:** Auth user not deleted
- **Solution:** This is expected; admin must handle auth.users deletion or implement admin API integration

### Getting Help
- Check error logs in Supabase dashboard
- Review the deletion function execution logs
- Contact development team with specific error messages

## Compliance Notes

This implementation should be reviewed for compliance with:
- **GDPR** (Right to be forgotten)
- **CCPA** (California Consumer Privacy Act)
- **Other regional data protection regulations**

Ensure:
- Users can request data export before deletion
- Deletion is completed within required timeframes
- Audit logs are maintained for compliance
- User consent is properly documented

## Files Modified/Created

### New Files
1. `src/components/dashboard/DeleteAccountDialog.tsx`
2. `supabase/migrations/20251029120000_add_delete_account_function.sql`
3. `ACCOUNT_DELETION_FEATURE.md` (this file)

### Modified Files
1. `src/components/dashboard/ProfileManagement.tsx`
2. `src/services/authService.ts`

## Version History

- **v1.0.0** (2025-10-29): Initial implementation with three-step confirmation
