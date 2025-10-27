# Matepeak Backend Usage Examples

Complete examples showing how to use the backend services in your React components.

---

## 🔐 Authentication Examples

### Signup Component

```typescript
import { useState } from 'react';
import { signup } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'mentor'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signup(formData);
    
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message
      });
      navigate('/');
    } else {
      toast({
        title: "Signup Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value as any})}
      >
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Login Component

```typescript
import { useState } from 'react';
import { login } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({ email, password });
    
    if (result.success) {
      toast({
        title: "Welcome back!",
        description: result.message
      });
      navigate('/');
    } else {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Route Component

```typescript
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/authService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## 👨‍🏫 Mentor Listing Examples

### Mentor List Component with Filters

```typescript
import { useState, useEffect } from 'react';
import { getMentors, getCategories } from '@/services/mentorService';
import { MentorCard } from '@/components/MentorCard';

export function MentorList() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: undefined,
    maxPrice: undefined
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadMentors();
  }, [filters]);

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data);
    }
  };

  const loadMentors = async () => {
    setLoading(true);
    const result = await getMentors(filters);
    if (result.success) {
      setMentors(result.data);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Find Your Mentor</h1>
      
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="Min Price"
          onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
        />
        
        <input
          type="number"
          placeholder="Max Price"
          onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
        />
      </div>

      {/* Mentor Grid */}
      {loading ? (
        <p>Loading mentors...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {mentors.map(mentor => (
            <MentorCard 
              key={mentor.id} 
              mentor={mentor}
              averageRating={mentor.averageRating}
              totalReviews={mentor.totalReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📅 Booking Session Example

### Book Session Component

```typescript
import { useState } from 'react';
import { bookSession } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function BookSessionForm({ mentorId }: { mentorId: string }) {
  const [formData, setFormData] = useState({
    session_time: '',
    duration: 60,
    session_type: '1-on-1 Video Call',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await bookSession({
      mentor_id: mentorId,
      session_time: new Date(formData.session_time).toISOString(),
      duration: formData.duration,
      session_type: formData.session_type,
      message: formData.message
    });

    if (result.success) {
      toast({
        title: "Booking Successful!",
        description: result.message
      });
      navigate('/my-sessions');
    } else {
      toast({
        title: "Booking Failed",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book a Session</h2>
      
      <input
        type="datetime-local"
        value={formData.session_time}
        onChange={(e) => setFormData({...formData, session_time: e.target.value})}
        required
      />
      
      <select
        value={formData.duration}
        onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
      >
        <option value={30}>30 minutes</option>
        <option value={60}>60 minutes</option>
        <option value={90}>90 minutes</option>
      </select>
      
      <select
        value={formData.session_type}
        onChange={(e) => setFormData({...formData, session_type: e.target.value})}
      >
        <option value="1-on-1 Video Call">1-on-1 Video Call</option>
        <option value="Chat Advice">Chat Advice</option>
        <option value="Email Consultation">Email Consultation</option>
      </select>
      
      <textarea
        placeholder="Message to mentor (optional)"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Book Session'}
      </button>
    </form>
  );
}
```

---

## 📋 Session Management Examples

### My Sessions Dashboard

```typescript
import { useState, useEffect } from 'react';
import { getMySessions, confirmSession, cancelSession } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';

export function MySessionsDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const result = await getMySessions();
    if (result.success) {
      setSessions(result.data);
    }
    setLoading(false);
  };

  const handleConfirm = async (sessionId: string) => {
    const result = await confirmSession(sessionId);
    
    if (result.success) {
      toast({
        title: "Session Confirmed",
        description: result.message
      });
      loadSessions(); // Refresh list
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      const result = await cancelSession(sessionId);
      
      if (result.success) {
        toast({
          title: "Session Cancelled",
          description: result.message
        });
        loadSessions(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  };

  if (loading) return <div>Loading sessions...</div>;

  return (
    <div>
      <h1>My Sessions</h1>
      
      {sessions.length === 0 ? (
        <p>No sessions yet</p>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="border p-4 rounded">
              <h3>{session.expert.full_name}</h3>
              <p>Time: {new Date(session.session_time).toLocaleString()}</p>
              <p>Duration: {session.duration} minutes</p>
              <p>Status: {session.status}</p>
              <p>Payment: {session.payment_status}</p>
              
              <div className="mt-2 space-x-2">
                {session.status === 'pending' && (
                  <>
                    <button onClick={() => handleConfirm(session.id)}>
                      Confirm
                    </button>
                    <button onClick={() => handleCancel(session.id)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## ⭐ Review Submission Example

```typescript
import { useState } from 'react';
import { submitReview } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';

export function SubmitReviewForm({ 
  mentorId, 
  bookingId, 
  onSuccess 
}: { 
  mentorId: string;
  bookingId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitReview({
      expert_id: mentorId,
      booking_id: bookingId,
      rating,
      comment
    });

    if (result.success) {
      toast({
        title: "Review Submitted!",
        description: result.message
      });
      onSuccess();
    } else {
      toast({
        title: "Failed to Submit Review",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>
      
      <div>
        <label>Rating: {rating} / 5</label>
        <input
          type="range"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
      </div>
      
      <textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
```

---

## 🔄 Real-time Session Updates

For real-time updates when sessions are confirmed/cancelled:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeSessions() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    // Initial load
    loadSessions();

    // Subscribe to changes
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Session updated:', payload);
          loadSessions(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id);
    
    setSessions(data || []);
  };

  return sessions;
}
```

---

## 🔐 Role-Based Rendering

```typescript
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole() {
  const [role, setRole] = useState<'student' | 'mentor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setRole(data?.role || 'student');
      }
      setLoading(false);
    };

    loadRole();
  }, []);

  return { role, loading };
}

// Usage in component
export function Dashboard() {
  const { role, loading } = useUserRole();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {role === 'mentor' ? (
        <MentorDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}
```

---

## 📊 Key Takeaways

1. **Authentication is automatic** - Supabase handles JWT, password hashing, sessions
2. **Use the service files** - All logic is encapsulated in service files
3. **Error handling** - All services return `{ success, error, data }` format
4. **Real-time updates** - Use Supabase channels for live data
5. **RLS security** - Authorization is automatic via database policies

All code is production-ready and secure! 🚀
