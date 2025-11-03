import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Star,
  Search,
  MessageSquare,
  BookOpen,
  TrendingUp,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StudentOverviewProps {
  studentProfile: any;
  onNavigate?: (view: string) => void;
}

type TimeFilter = "today" | "week" | "month" | "all";

export default function StudentOverview({
  studentProfile,
  onNavigate,
}: StudentOverviewProps) {
  // Removed time filter state
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    totalHours: 0,
    activeMentors: 0,
    pendingReviews: 0,
  });
  const [nextSession, setNextSession] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all bookings
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          expert_profiles (
            id,
            full_name,
            username,
            profile_picture_url,
            expertise
          )
        `
        )
        .eq("student_id", user.id)
        .order("session_date", { ascending: true });

      // Handle error but don't fail if it's just empty results
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching bookings:", error);
      }

      const bookingsList = bookings || [];
      const now = new Date();
      const upcoming = bookingsList.filter(
        (b) => new Date(b.session_date) > now && b.status !== "cancelled"
      );
      const completed = bookingsList.filter((b) => b.status === "completed");

      // Calculate stats
      const uniqueMentors = new Set(bookingsList.map((b) => b.expert_id)).size;
      const totalMinutes = completed.reduce(
        (sum, b) => sum + (b.duration || 60),
        0
      );

      // Get reviews to find pending
      const { data: reviews } = await supabase
        .from("reviews")
        .select("booking_id")
        .eq("student_id", user.id);

      const reviewedBookingIds = new Set(
        reviews?.map((r) => r.booking_id) || []
      );
      const pendingReviews = completed.filter(
        (b) => !reviewedBookingIds.has(b.id)
      ).length;

      setStats({
        upcomingSessions: upcoming.length,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        activeMentors: uniqueMentors,
        pendingReviews: pendingReviews,
      });

      setNextSession(upcoming[0] || null);
      setUpcomingSessions(upcoming.slice(0, 3));
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      // Don't show error toast for empty results, only real errors
      if (error.code !== "PGRST116") {
        toast.error("Failed to load dashboard data. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diff = sessionDate.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    return "soon";
  };

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Clean Welcome Section - No Background */}
      <div className="py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back,{" "}
            {studentProfile?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-gray-600 text-sm">
            Here's what's happening with your learning sessions
          </p>
        </div>
      </div>

      {/* Quick Actions - Compact Design */}
      <Card className="bg-gray-100 border-0 rounded-2xl shadow-none">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Browse Mentors */}
            <button
              onClick={() => (window.location.href = "/explore")}
              className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-left border border-gray-200 group"
            >
              <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-100 transition-colors">
                <BookOpen className="h-5 w-5 text-rose-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Browse Mentors
              </span>
            </button>

            {/* View Profile */}
            <button
              onClick={() => onNavigate?.("profile")}
              className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-left border border-gray-200 group"
            >
              <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-100 transition-colors">
                <Users className="h-5 w-5 text-rose-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                View Profile
              </span>
            </button>

            {/* Get Support */}
            <button
              onClick={() => onNavigate?.("messages")}
              className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-left border border-gray-200 group"
            >
              <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-100 transition-colors">
                <MessageSquare className="h-5 w-5 text-rose-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Get Support
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Next Session */}
      {nextSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Next Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  {nextSession.expert_profiles?.profile_picture_url ? (
                    <img
                      src={nextSession.expert_profiles.profile_picture_url}
                      alt={nextSession.expert_profiles.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold">
                      {nextSession.expert_profiles?.full_name?.charAt(0) || "M"}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {nextSession.expert_profiles?.full_name || "Mentor"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {nextSession.expert_profiles?.expertise?.[0] || "Expert"}
                  </p>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(nextSession.session_date)}</span>
                      <span className="text-blue-600 font-medium">
                        ({getTimeUntil(nextSession.session_date)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(nextSession.session_date)} •{" "}
                        {nextSession.duration || 60} minutes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1">Join Session</Button>
                <Button variant="outline" className="flex-1">
                  Message Mentor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Sessions Preview */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Upcoming Sessions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                      {session.expert_profiles?.profile_picture_url ? (
                        <img
                          src={session.expert_profiles.profile_picture_url}
                          alt={session.expert_profiles.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold">
                          {session.expert_profiles?.full_name?.charAt(0) || "M"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.expert_profiles?.full_name || "Mentor"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(session.session_date)} at{" "}
                        {formatTime(session.session_date)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      session.status === "confirmed" ? "default" : "secondary"
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.upcomingSessions === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Upcoming Sessions
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Book your first session with an expert mentor to start learning
            </p>
            <Button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Find Mentors
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
