# Matepeak Backend API Documentation

## Overview

This backend uses **Supabase** which provides:
- ✅ **Automatic JWT Authentication** (no need for custom bcrypt/JWT)
- ✅ **Auto-generated REST APIs** for all tables
- ✅ **Row Level Security (RLS)** for authorization
- ✅ **Edge Functions** for complex business logic

---

## 🔐 Authentication

### Signup (Create User)

**Method:** Use Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client'

const signup = async (name: string, email: string, password: string, role: 'student' | 'mentor') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: role
      },
      emailRedirectTo: `${window.location.origin}/`
    }
  })
  
  return { data, error }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "student"
    }
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

### Login

```typescript
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}
```

**Response:** Same as signup

### Logout

```typescript
const logout = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}
```

### Get Current User

```typescript
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
```

---

## 👨‍🏫 Mentor APIs

### List All Mentors (with filters)

**Method:** Direct Supabase Query

```typescript
const getMentors = async (filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
}) => {
  let query = supabase
    .from('expert_profiles')
    .select(`
      *,
      profile:profiles(full_name, email, avatar_url),
      reviews(rating)
    `)
  
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters?.minPrice) {
    query = query.gte('pricing', filters.minPrice)
  }
  
  if (filters?.maxPrice) {
    query = query.lte('pricing', filters.maxPrice)
  }
  
  const { data, error } = await query
  return { data, error }
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "mentor-uuid",
      "user_id": "user-uuid",
      "category": "Technology & Engineering",
      "experience": 5,
      "pricing": 50,
      "bio": "Expert in software development",
      "availability_json": "[...]",
      "profile": {
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "avatar_url": "https://..."
      },
      "reviews": [
        { "rating": 5 },
        { "rating": 4 }
      ]
    }
  ]
}
```

### Get Single Mentor Profile

```typescript
const getMentorById = async (mentorId: string) => {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select(`
      *,
      profile:profiles(full_name, email, avatar_url),
      reviews(id, rating, comment, user:profiles(full_name))
    `)
    .eq('id', mentorId)
    .single()
  
  return { data, error }
}
```

### Create/Update Mentor Profile (Mentor Only)

```typescript
const updateMentorProfile = async (profileData: {
  category: string
  experience: number
  pricing: number
  bio: string
  availability_json: string
  social_links?: object
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('expert_profiles')
    .upsert({
      id: user!.id,
      ...profileData
    })
    .select()
    .single()
  
  return { data, error }
}
```

---

## 📅 Session/Booking APIs

### Book a Session (Student Only)

**Method:** Edge Function (for availability checking)

```typescript
const bookSession = async (bookingData: {
  mentor_id: string
  session_time: string  // ISO 8601 format
  duration: number      // minutes
  session_type: string
  message?: string
}) => {
  const { data, error } = await supabase.functions.invoke('book-session', {
    body: bookingData
  })
  
  return { data, error }
}
```

**Request Example:**
```json
{
  "mentor_id": "uuid",
  "session_time": "2025-10-15T14:00:00Z",
  "duration": 60,
  "session_type": "1-on-1 Video Call",
  "message": "Looking forward to discussing career growth"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session booked successfully",
  "data": {
    "id": "booking-uuid",
    "user_id": "student-uuid",
    "expert_id": "mentor-uuid",
    "session_time": "2025-10-15T14:00:00Z",
    "duration": 60,
    "status": "pending",
    "payment_status": "pending",
    "total_amount": 50,
    "expert": {
      "full_name": "Jane Smith",
      "category": "Career Development"
    }
  }
}
```

**Error Responses:**
```json
// Mentor not available
{
  "success": false,
  "message": "Mentor is not available at this time. Please choose another time slot."
}

// Missing fields
{
  "success": false,
  "message": "Missing required fields"
}
```

### List Sessions for Current User

**Students see their bookings, Mentors see received bookings**

```typescript
const getMySessions = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is mentor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()
  
  let query = supabase
    .from('bookings')
    .select(`
      *,
      expert:expert_profiles(full_name, category),
      student:profiles!bookings_user_id_fkey(full_name, email)
    `)
  
  if (profile?.role === 'mentor') {
    query = query.eq('expert_id', user!.id)
  } else {
    query = query.eq('user_id', user!.id)
  }
  
  const { data, error } = await query.order('session_time', { ascending: false })
  return { data, error }
}
```

### Update Session Status (Mentor confirms/completes)

**Method:** Edge Function

```typescript
const manageSession = async (sessionData: {
  session_id: string
  action: 'confirm' | 'complete' | 'cancel'
  payment_status?: 'paid' | 'refunded'
}) => {
  const { data, error } = await supabase.functions.invoke('manage-session', {
    body: sessionData
  })
  
  return { data, error }
}
```

**Request Examples:**

```json
// Mentor confirms session
{
  "session_id": "uuid",
  "action": "confirm"
}

// Mentor completes session and marks as paid
{
  "session_id": "uuid",
  "action": "complete",
  "payment_status": "paid"
}

// Student cancels (auto-refund)
{
  "session_id": "uuid",
  "action": "cancel"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session confirmed successfully",
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "payment_status": "pending",
    ...
  }
}
```

### Cancel Session

```typescript
const cancelSession = async (sessionId: string) => {
  return await manageSession({
    session_id: sessionId,
    action: 'cancel'
  })
}
```

---

## ⭐ Feedback/Reviews APIs

### Submit Feedback (Student Only)

```typescript
const submitFeedback = async (reviewData: {
  expert_id: string
  booking_id: string
  rating: number  // 1-5
  comment: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      user_id: user!.id
    })
    .select()
    .single()
  
  return { data, error }
}
```

### Get Mentor Feedback

```typescript
const getMentorFeedback = async (mentorId: string, page = 1, limit = 10) => {
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `, { count: 'exact' })
    .eq('expert_id', mentorId)
    .order('created_at', { ascending: false })
    .range(from, to)
  
  return { 
    data, 
    error,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}
```

---

## 🔒 Authorization (Automatic via RLS)

All authorization is handled automatically through **Row Level Security policies**:

### Students Can:
- ✅ Create bookings for themselves
- ✅ View their own bookings
- ✅ Cancel their bookings
- ✅ Submit reviews for completed sessions

### Mentors Can:
- ✅ Create/update their mentor profile
- ✅ View bookings received
- ✅ Confirm/complete/cancel bookings
- ✅ View their reviews

### Everyone Can:
- ✅ View all mentor profiles
- ✅ View all reviews
- ✅ View all categories

---

## 🔧 Environment Setup

**No custom environment variables needed!** Supabase is already configured in:
- `src/integrations/supabase/client.ts`

The following are automatically available:
```typescript
SUPABASE_URL=https://hnevrdlcqhmsfubakljg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Database Schema

### Tables Created:

1. **profiles** (Users)
   - Maps to `auth.users`
   - Additional fields: full_name, avatar_url, role

2. **expert_profiles** (Mentors)
   - Extends profiles for mentors
   - Fields: category, experience, pricing, bio, availability

3. **bookings** (Sessions)
   - Links students and mentors
   - Fields: session_time, duration, status, payment_status

4. **reviews** (Feedback)
   - Student feedback on mentors
   - Fields: rating (1-5), comment

5. **user_roles**
   - Stores user roles for advanced permissions
   - Used for admin access control

---

## 🚀 Testing the APIs

### Using the Frontend

All APIs are ready to use in your React app:

```typescript
import { supabase } from '@/integrations/supabase/client'

// Example: Book a session
const handleBooking = async () => {
  const { data, error } = await supabase.functions.invoke('book-session', {
    body: {
      mentor_id: selectedMentor.id,
      session_time: new Date().toISOString(),
      duration: 60,
      session_type: '1-on-1 Video Call'
    }
  })
  
  if (error) {
    console.error('Booking failed:', error)
  } else {
    console.log('Booking success:', data)
  }
}
```

---

## 📝 Notes

1. **No JWT/Bcrypt Implementation Needed**: Supabase handles this automatically and more securely
2. **RLS > Middleware**: Row Level Security is more secure than custom middleware
3. **Auto-Generated APIs**: Most CRUD operations don't need custom endpoints
4. **Edge Functions**: Only needed for complex business logic (booking with availability check)
5. **Real-time Updates**: You can add real-time subscriptions using `supabase.channel()`

---

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/hnevrdlcqhmsfubakljg
- **Authentication Settings**: https://supabase.com/dashboard/project/hnevrdlcqhmsfubakljg/auth/providers
- **Database Tables**: https://supabase.com/dashboard/project/hnevrdlcqhmsfubakljg/editor
- **Edge Functions Logs**: 
  - book-session: https://supabase.com/dashboard/project/hnevrdlcqhmsfubakljg/functions/book-session/logs
  - manage-session: https://supabase.com/dashboard/project/hnevrdlcqhmsfubakljg/functions/manage-session/logs
