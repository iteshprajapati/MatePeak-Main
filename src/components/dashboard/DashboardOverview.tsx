import { useEffect, useState } from "react";
import { Calendar, Star, TrendingUp, Clock, Edit, Eye, MessageCircle, ArrowRight, IndianRupee } from "lucide-react";
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
      iconColor: "text-rose-400",
    },
    {
      title: "Upcoming",
      value: stats.upcomingSessions,
      icon: Clock,
      iconColor: "text-rose-400",
    },
    {
      title: "Earnings",
      value: "Coming Soon",
      icon: IndianRupee,
      iconColor: "text-rose-400",
      isComingSoon: true,
    },
    {
      title: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      iconColor: "text-rose-400",
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
    <div className="space-y-6">
      {/* Clean Welcome Section - No Background */}
      <div className="py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {mentorProfile.full_name?.split(' ')[0] || mentorProfile.full_name || 'Mentor'}!
        </h1>
        <p className="text-gray-600 text-sm">
          Here's what's happening with your mentoring sessions
        </p>
      </div>

      {/* Time Period Filters - Improved Design */}
      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={() => setTimePeriod("today")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            timePeriod === "today"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimePeriod("week")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            timePeriod === "week"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimePeriod("month")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            timePeriod === "month"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimePeriod("all")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            timePeriod === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Time
        </button>
      </div>

      {/* Stats Grid - MentorLoop Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-gray-100 border-0 rounded-2xl shadow-none">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className={`
                    group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200
                    ${stat.isComingSoon ? 'relative overflow-hidden' : ''}
                  `}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {stat.title}
                        </p>
                        <div className="flex items-baseline mt-3">
                          <p className={`${stat.isComingSoon ? 'text-2xl font-extrabold' : 'text-3xl font-bold'} ${stat.isComingSoon ? 'text-gray-700' : 'text-gray-900'}`}>
                            {stat.value}
                          </p>
                          {stat.suffix && (
                            <span className="ml-2 text-sm font-medium text-gray-500">
                              {stat.suffix}
                            </span>
                          )}
                        </div>
                        {stat.isComingSoon && (
                          <p className="text-xs text-gray-600 mt-2 font-medium">
                            Feature under development
                          </p>
                        )}
                      </div>
                      {!stat.isComingSoon && (
                        <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Quick Actions - Compact Design */}
      <Card className="bg-gray-100 border-0 rounded-2xl shadow-none">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Update Availability */}
            <button
              onClick={() => {
                const event = new CustomEvent('navigateToTab', { detail: 'profile' });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-rose-300 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-rose-50 transition-colors">
                <Edit className="h-4 w-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Update Availability
                </p>
              </div>
            </button>

            {/* View Public Profile */}
            <button
              onClick={() => {
                if (mentorProfile.username) {
                  window.open(`/mentor/${mentorProfile.username}`, '_blank');
                }
              }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-rose-300 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-rose-50 transition-colors">
                <Eye className="h-4 w-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  View Profile
                </p>
              </div>
            </button>

            {/* Message Support */}
            <button
              onClick={() => {
                window.location.href = 'mailto:support@sparkmentorconnect.com';
              }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-rose-300 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-rose-50 transition-colors">
                <MessageCircle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Get Support
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout for Sessions and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none hover:shadow-sm transition-shadow">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">
              Upcoming Sessions
            </h3>
            <p className="text-sm text-gray-600 mt-1">Your next confirmed bookings</p>
          </div>
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm hover:border-gray-300 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {session.session_type || "1-on-1 Session"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(session.scheduled_date, session.scheduled_time)}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  No upcoming sessions
                </p>
                <p className="text-xs text-gray-500">
                  Your upcoming sessions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary - Improved Visual Design */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-none hover:shadow-sm transition-shadow">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">
              Performance Summary
            </h3>
            <p className="text-sm text-gray-600 mt-1">Your session insights</p>
          </div>
          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Completion Rate - Visual Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <TrendingUp className="h-4 w-4 text-rose-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Completion Rate
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-rose-400 to-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Profile Status - Icon Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Profile Active
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Visible to students
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Insights - Icon Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <div className="inline-flex p-2 rounded-lg bg-white mb-2">
                    <Calendar className="h-4 w-4 text-rose-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stats.totalSessions}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Total</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <div className="inline-flex p-2 rounded-lg bg-white mb-2">
                    <Star className="h-4 w-4 text-rose-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">Rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
