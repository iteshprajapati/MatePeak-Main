import { useEffect, useState } from "react";
import { Calendar, Star, TrendingUp, Clock, Edit, Eye, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

type TimePeriod = "today" | "week" | "month" | "all";

interface DashboardOverviewProps {
  mentorProfile: any;
}

interface Stats {
  totalSessions: number;
  upcomingSessions: number;
  totalEarnings: number;
  averageRating: number;
  completionRate: number;
}

const DashboardOverview = ({ mentorProfile }: DashboardOverviewProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");

  useEffect(() => {
    fetchDashboardData();
  }, [mentorProfile, timePeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Calculate date range based on selected period
      const now = new Date();
      let startDate: Date | null = null;

      switch (timePeriod) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
        case "all":
        default:
          startDate = null;
          break;
      }

      // Fetch sessions data
      let query = supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", mentorProfile.id);

      // Apply date filter if not "all time"
      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data: sessions, error: sessionsError } = await query;

      if (sessionsError) throw sessionsError;

      // Calculate stats
      const upcoming = sessions?.filter(
        (s) => {
          const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
          return sessionDate > now && s.status === "confirmed";
        }
      ) || [];
      const completed = sessions?.filter((s) => s.status === "completed") || [];
      const total = sessions?.length || 0;

      // Calculate total earnings
      const earnings = completed.reduce((sum, session) => {
        return sum + (session.total_amount || 0);
      }, 0);

      // Fetch average rating from reviews (if reviews table exists)
      let avgRating = 0;
      try {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("expert_id", mentorProfile.id);
        
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          avgRating = totalRating / reviews.length;
        }
      } catch {
        // Reviews table might not exist yet
        avgRating = 0;
      }

      // Calculate completion rate
      const completionRate = total > 0 ? (completed.length / total) * 100 : 0;

      setStats({
        totalSessions: total,
        upcomingSessions: upcoming.length,
        totalEarnings: earnings,
        averageRating: avgRating,
        completionRate: Math.round(completionRate),
      });

      // Set upcoming sessions for calendar
      setUpcomingSessions(upcoming.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      icon: Calendar,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Upcoming",
      value: stats.upcomingSessions,
      icon: Clock,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Earnings",
      value: "Coming Soon",
      icon: Sparkles,
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
      isComingSoon: true,
    },
    {
      title: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      suffix: stats.averageRating > 0 ? "/ 5.0" : "",
    },
  ];

  const formatDate = (scheduledDate: string, scheduledTime: string) => {
    try {
      const date = new Date(`${scheduledDate}T${scheduledTime}`);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Date not set";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {mentorProfile.full_name?.split(' ')[0] || mentorProfile.full_name || 'Mentor'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your mentoring sessions today
        </p>
      </div>

      {/* Time Period Filters */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="today" className="data-[state=active]:bg-white">
                Today
              </TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-white">
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-white">
                This Month
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className={`border-gray-200 hover:shadow-md transition-shadow ${stat.isComingSoon ? 'relative overflow-hidden' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <div className="flex items-baseline mt-2">
                          <p className={`text-2xl font-semibold ${stat.isComingSoon ? 'text-purple-600' : 'text-gray-900'}`}>
                            {stat.value}
                          </p>
                          {stat.suffix && (
                            <span className="ml-2 text-sm text-gray-500">
                              {stat.suffix}
                            </span>
                          )}
                        </div>
                        {stat.isComingSoon && (
                          <p className="text-xs text-gray-500 mt-1">
                            Feature under development
                          </p>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.iconColor} ${stat.isComingSoon ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Quick Actions Card */}
      <Card className="border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600 mt-1">
            Common tasks to manage your mentoring profile
          </p>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Update Availability */}
            <button
              onClick={() => {
                // Navigate to profile management with availability section
                const event = new CustomEvent('navigateToTab', { detail: 'profile' });
                window.dispatchEvent(event);
              }}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-900 transition-colors">
                <Edit className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Update Availability
                </h4>
                <p className="text-xs text-gray-600">
                  Manage your calendar and time slots
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* View Public Profile */}
            <button
              onClick={() => {
                if (mentorProfile.username) {
                  window.open(`/mentor/${mentorProfile.username}`, '_blank');
                }
              }}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-900 transition-colors">
                <Eye className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  View Public Profile
                </h4>
                <p className="text-xs text-gray-600">
                  See how students view your profile
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Message Support */}
            <button
              onClick={() => {
                window.location.href = 'mailto:support@sparkmentorconnect.com';
              }}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-900 transition-colors">
                <MessageCircle className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Message Support
                </h4>
                <p className="text-xs text-gray-600">
                  Get help from our support team
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card className="border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Sessions
            </h3>
          </div>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.session_type || "1-on-1 Session"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(session.scheduled_date, session.scheduled_time)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900">
                  No upcoming sessions
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your upcoming sessions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Summary
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Completion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Session Completion Rate
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Profile Status */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Profile Status
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your profile is active and visible to students
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Quick Tips
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Keep your availability updated for more bookings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Respond to inquiries within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Complete your profile to attract more students</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
