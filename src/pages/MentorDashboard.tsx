import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ProfileManagement from "@/components/dashboard/ProfileManagement";
import SessionManagement from "@/components/dashboard/SessionManagement";
import ReviewsManagement from "@/components/dashboard/ReviewsManagement";
import AvailabilityCalendar from "@/components/dashboard/AvailabilityCalendar";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import SessionMessaging from "@/components/dashboard/SessionMessaging";
import StudentDirectory from "@/components/dashboard/StudentDirectory";
import { useToast } from "@/hooks/use-toast";

type DashboardView = "overview" | "profile" | "sessions" | "reviews" | "availability" | "calendar" | "messages" | "students";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndProfile();
  }, [username]); // Re-run if username in URL changes

  const checkAuthAndProfile = async () => {
    try {
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the dashboard",
          variant: "destructive",
        });
        navigate("/expert/login");
        return;
      }

      setUser(session.user);

      // Fetch mentor profile
      const { data: profile, error: profileError } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      if (!profile) {
        // Profile doesn't exist, redirect to onboarding
        toast({
          title: "Complete your profile",
          description: "Please complete the onboarding process first",
        });
        navigate("/expert/onboarding");
        return;
      }

      // Check if accessing via old route (/mentor/dashboard or /expert/dashboard)
      // and redirect to username-based route
      if (!username && profile.username) {
        navigate(`/dashboard/${profile.username}`, { replace: true });
        return;
      }

      // Security check: Verify the username in URL matches the logged-in user's profile
      if (username && profile.username !== username) {
        toast({
          title: "Access Denied",
          description: "You can only access your own dashboard",
          variant: "destructive",
        });
        // Redirect to their own dashboard
        navigate(`/dashboard/${profile.username}`, { replace: true });
        return;
      }

      setMentorProfile(profile);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard. Please try again.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setMentorProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!mentorProfile || !user) {
    return null;
  }

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      mentorProfile={mentorProfile}
      user={user}
    >
      {activeView === "overview" && (
        <DashboardOverview 
          mentorProfile={mentorProfile} 
          onNavigate={(view) => setActiveView(view as DashboardView)}
        />
      )}
      {activeView === "profile" && (
        <ProfileManagement
          mentorProfile={mentorProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      {activeView === "sessions" && (
        <SessionManagement mentorProfile={mentorProfile} />
      )}
      {activeView === "reviews" && (
        <ReviewsManagement mentorProfile={mentorProfile} />
      )}
      {activeView === "availability" && (
        <AvailabilityCalendar mentorProfile={mentorProfile} />
      )}
      {activeView === "calendar" && (
        <SessionCalendar mentorProfile={mentorProfile} />
      )}
      {activeView === "messages" && (
        <SessionMessaging mentorProfile={mentorProfile} />
      )}
      {activeView === "students" && (
        <StudentDirectory mentorProfile={mentorProfile} />
      )}
    </DashboardLayout>
  );
};

export default MentorDashboard;
