import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Search,
  ArrowUpDown,
  Download,
  CalendarCheck,
  Users,
  ClockAlert,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import SessionDetailsModal from "./SessionDetailsModal";

interface SessionManagementProps {
  mentorProfile: any;
}

type SessionStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";
type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "status";
type DateRange = "all" | "today" | "week" | "month";

const SessionManagement = ({ mentorProfile }: SessionManagementProps) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SessionStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    sessionId: string | null;
    action: "accept" | "decline" | null;
  }>({
    open: false,
    sessionId: null,
    action: null,
  });
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    session: any;
  }>({
    open: false,
    session: null,
  });

  useEffect(() => {
    fetchSessions();
  }, [mentorProfile]);

  // Helper function to format session type display name
  const formatSessionType = (sessionType: string | null | undefined) => {
    if (!sessionType) return "1 on 1 Session";

    // Convert camelCase or other formats to readable format
    const typeMap: Record<string, string> = {
      oneonesession: "1 on 1 Session",
      oneOnOneSession: "1 on 1 Session",
      "one-on-one": "1 on 1 Session",
      group: "Group Session",
      groupsession: "Group Session",
      workshop: "Workshop",
      consultation: "Consultation",
    };

    // Check if we have a mapping (case-insensitive)
    const lowerType = sessionType.toLowerCase();
    if (typeMap[lowerType]) {
      return typeMap[lowerType];
    }

    // Check exact match
    if (typeMap[sessionType]) {
      return typeMap[sessionType];
    }

    // Otherwise, format camelCase to Title Case with spaces
    return sessionType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper function to check if date is within range
  const isWithinDateRange = (
    scheduledDate: string,
    scheduledTime: string,
    range: DateRange
  ) => {
    if (range === "all") return true;

    if (!scheduledDate) return false;

    try {
      // Parse the session date and time
      const sessionDateTime = new Date(
        `${scheduledDate}T${scheduledTime || "00:00"}`
      );

      // Get current date components
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();

      // Get session date components
      const sessionYear = sessionDateTime.getFullYear();
      const sessionMonth = sessionDateTime.getMonth();
      const sessionDate = sessionDateTime.getDate();

      switch (range) {
        case "today":
          // Check if same year, month, and date
          return (
            sessionYear === currentYear &&
            sessionMonth === currentMonth &&
            sessionDate === currentDate
          );

        case "week":
          // Get start of current week (Monday)
          const currentDay = now.getDay();
          const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust when Sunday (0)
          const weekStart = new Date(
            currentYear,
            currentMonth,
            currentDate + diff,
            0,
            0,
            0,
            0
          );

          // Get end of current week (Sunday)
          const weekEnd = new Date(
            currentYear,
            currentMonth,
            currentDate + diff + 6,
            23,
            59,
            59,
            999
          );

          return sessionDateTime >= weekStart && sessionDateTime <= weekEnd;

        case "month":
          // Check if same year and month
          return sessionYear === currentYear && sessionMonth === currentMonth;

        default:
          return true;
      }
    } catch (error) {
      console.error("Date parsing error:", error, {
        scheduledDate,
        scheduledTime,
      });
      return false;
    }
  };

  // Calculate statistics using useMemo for performance - respecting date range filter
  const statistics = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Filter sessions by current date range first
    const dateFilteredSessions = sessions.filter((s) =>
      isWithinDateRange(s.scheduled_date, s.scheduled_time, dateRange)
    );

    const pending = dateFilteredSessions.filter(
      (s) => s.status === "pending"
    ).length;
    const thisWeek = dateFilteredSessions.filter((s) => {
      try {
        const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      } catch {
        return false;
      }
    }).length;

    const upcoming = dateFilteredSessions.filter((s) => {
      try {
        const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
        return sessionDate > now && s.status === "confirmed";
      } catch {
        return false;
      }
    }).length;

    return {
      total: dateFilteredSessions.length,
      pending,
      thisWeek,
      upcoming,
    };
  }, [sessions, dateRange]);

  // Get status counts for tab badges - respecting date range filter
  const statusCounts = useMemo(() => {
    const dateFilteredSessions = sessions.filter((s) =>
      isWithinDateRange(s.scheduled_date, s.scheduled_time, dateRange)
    );

    return {
      all: dateFilteredSessions.length,
      pending: dateFilteredSessions.filter((s) => s.status === "pending")
        .length,
      confirmed: dateFilteredSessions.filter((s) => s.status === "confirmed")
        .length,
      completed: dateFilteredSessions.filter((s) => s.status === "completed")
        .length,
      cancelled: dateFilteredSessions.filter((s) => s.status === "cancelled")
        .length,
    };
  }, [sessions, dateRange]);

  // Get upcoming sessions (next 3) - respecting date range filter
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => {
        try {
          const sessionDate = new Date(
            `${s.scheduled_date}T${s.scheduled_time}`
          );
          // Must be future, confirmed, AND within selected date range
          return (
            sessionDate > now &&
            s.status === "confirmed" &&
            isWithinDateRange(s.scheduled_date, s.scheduled_time, dateRange)
          );
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
        const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  }, [sessions, dateRange]);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      // Paginated query - fetch only latest 100 sessions for performance
      // For mentors with 1000+ sessions, this prevents timeout and memory issues
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", mentorProfile.id)
        .order("scheduled_date", { ascending: false })
        .limit(100); // Limit to 100 most recent sessions

      if (error) throw error;

      setSessions(data || []);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (
    sessionId: string,
    action: "accept" | "decline"
  ) => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Invalid session ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(sessionId);

      const newStatus = action === "accept" ? "confirmed" : "cancelled";

      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, status: newStatus } : session
        )
      );

      toast({
        title: action === "accept" ? "Session confirmed" : "Session declined",
        description:
          action === "accept"
            ? "The session has been confirmed successfully"
            : "The session has been declined",
      });
    } catch (error: any) {
      console.error("Error updating session:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, sessionId: null, action: null });
    }
  };

  const openConfirmDialog = (
    sessionId: string,
    action: "accept" | "decline"
  ) => {
    setConfirmDialog({ open: true, sessionId, action });
  };

  // Filter, search, and sort sessions
  const filteredAndSortedSessions = sessions
    .filter((session) => {
      // Status filter
      if (filter !== "all" && session.status !== filter) return false;

      // Date range filter
      if (
        !isWithinDateRange(
          session.scheduled_date,
          session.scheduled_time,
          dateRange
        )
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          session.session_type,
          session.student_name,
          session.student_email,
          session.notes,
          session.status,
        ].filter(Boolean);

        const matches = searchFields.some((field) =>
          String(field).toLowerCase().includes(query)
        );

        if (!matches) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime() -
            new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime()
          );
        case "date-asc":
          return (
            new Date(`${a.scheduled_date}T${a.scheduled_time}`).getTime() -
            new Date(`${b.scheduled_date}T${b.scheduled_time}`).getTime()
          );
        case "amount-desc":
          return (b.total_amount || 0) - (a.total_amount || 0);
        case "amount-asc":
          return (a.total_amount || 0) - (b.total_amount || 0);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return 0;
      }
    });

  // Export to CSV function
  const exportToCSV = () => {
    try {
      const headers = [
        "Date & Time",
        "Session Type",
        "Student Name",
        "Student Email",
        "Status",
        "Amount",
        "Message",
      ];

      const csvData = filteredAndSortedSessions.map((session) => [
        formatDate(session.scheduled_date, session.scheduled_time),
        formatSessionType(session.session_type),
        session.student_name || "N/A",
        session.student_email || "N/A",
        session.status || "pending",
        session.total_amount ? `₹${session.total_amount.toFixed(2)}` : "N/A",
        (session.message || "").replace(/,/g, ";"), // Replace commas to avoid CSV issues
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `sessions_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredAndSortedSessions.length} sessions to CSV`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get time remaining for upcoming session
  const getTimeRemaining = (scheduledDate: string, scheduledTime: string) => {
    try {
      const sessionDate = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      const diffMs = sessionDate.getTime() - now.getTime();

      if (diffMs < 0) return "Past";

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      if (diffHours > 0)
        return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;

      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `in ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
    } catch {
      return "";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pending",
        className: "bg-yellow-50 text-yellow-700 border-0 rounded-md",
      },
      confirmed: {
        label: "Confirmed",
        className: "bg-green-50 text-green-700 border-0 rounded-md",
      },
      completed: {
        label: "Completed",
        className: "bg-blue-50 text-blue-700 border-0 rounded-md",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 border-0 rounded-md",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-50 text-gray-700 border-0 rounded-md",
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (scheduledDate: string, scheduledTime: string) => {
    if (!scheduledDate || !scheduledTime) return "Date not set";
    try {
      const date = new Date(`${scheduledDate}T${scheduledTime}`);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  const isUpcoming = (scheduledDate: string, scheduledTime: string) => {
    if (!scheduledDate || !scheduledTime) return false;
    try {
      const sessionDate = new Date(`${scheduledDate}T${scheduledTime}`);
      return sessionDate > new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Matching DashboardOverview */}
      <div className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Session Management
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your bookings and upcoming sessions
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={filteredAndSortedSessions.length === 0}
            className="bg-gray-900 hover:bg-gray-800 rounded-xl h-11 text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Matching DashboardOverview Style */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Sessions */}
          <Card className="group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Sessions
                  </p>
                  <div className="flex items-baseline mt-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.total}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="h-6 w-6 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Sessions */}
          <Card className="group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pending
                  </p>
                  <div className="flex items-baseline mt-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.pending}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClockAlert className="h-6 w-6 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card className="group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    This Week
                  </p>
                  <div className="flex items-baseline mt-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.thisWeek}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarCheck className="h-6 w-6 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Upcoming
                  </p>
                  <div className="flex items-baseline mt-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.upcoming}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="h-6 w-6 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Sessions Widget - Matching DashboardOverview Card Style */}
      {!loading && upcomingSessions.length > 0 && (
        <Card className="bg-gray-100 border-0 rounded-2xl shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-rose-400" />
              <h3 className="text-sm font-semibold text-gray-700">Next Up</h3>
            </div>
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-rose-300 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {formatSessionType(session.session_type)}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatDate(
                        session.scheduled_date,
                        session.scheduled_time
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rose-50 text-rose-700 border-0 rounded-md text-xs">
                      {getTimeRemaining(
                        session.scheduled_date,
                        session.scheduled_time
                      )}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailsModal({ open: true, session })}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Filter Tabs - Matching DashboardOverview Time Period Style */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Sessions
          {statusCounts.all > 0 && (
            <span className="ml-1.5 opacity-75">({statusCounts.all})</span>
          )}
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === "pending"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending
          {statusCounts.pending > 0 && (
            <span className="ml-1.5 opacity-75">({statusCounts.pending})</span>
          )}
        </button>
        <button
          onClick={() => setFilter("confirmed")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === "confirmed"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Confirmed
          {statusCounts.confirmed > 0 && (
            <span className="ml-1.5 opacity-75">
              ({statusCounts.confirmed})
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === "completed"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Completed
          {statusCounts.completed > 0 && (
            <span className="ml-1.5 opacity-75">
              ({statusCounts.completed})
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === "cancelled"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Cancelled
          {statusCounts.cancelled > 0 && (
            <span className="ml-1.5 opacity-75">
              ({statusCounts.cancelled})
            </span>
          )}
        </button>
      </div>

      {/* Date Range Filter - Matching DashboardOverview */}
      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={() => setDateRange("today")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            dateRange === "today"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setDateRange("week")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            dateRange === "week"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setDateRange("month")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            dateRange === "month"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setDateRange("all")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            dateRange === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Time
        </button>
      </div>

      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sessions by name, email, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 bg-white rounded-xl h-11"
          />
        </div>

        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-full md:w-52">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest First)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
            <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
            <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {(searchQuery || filter !== "all" || dateRange !== "all") && (
        <div className="flex items-center gap-2 px-1">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {filteredAndSortedSessions.length}
            </span>{" "}
            of {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span className="ml-1">
                matching{" "}
                <span className="font-medium text-gray-900">
                  "{searchQuery}"
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-gray-200 rounded-2xl shadow-none">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredAndSortedSessions.length > 0 ? (
          filteredAndSortedSessions.map((session) => (
            <Card
              key={session.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left Section - Session Info */}
                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-base font-bold text-gray-900">
                            {formatSessionType(session.session_type)}
                          </h3>
                          {isUpcoming(
                            session.scheduled_date,
                            session.scheduled_time
                          ) &&
                            session.status === "confirmed" && (
                              <Badge className="bg-blue-50 text-blue-700 border-0 rounded-lg text-xs px-2 py-0.5">
                                Upcoming
                              </Badge>
                            )}
                        </div>

                        {/* Date and Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="font-medium">
                            {formatDate(
                              session.scheduled_date,
                              session.scheduled_time
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {getStatusBadge(session.status || "pending")}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Users className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <span className="font-medium">
                          {session.student_name || "Student"}
                        </span>
                      </div>
                      {session.student_email && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                          {session.student_email}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {session.message && (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Message
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {session.message}
                        </p>
                      </div>
                    )}

                    {/* Amount */}
                    {session.total_amount && session.total_amount > 0 && (
                      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                        <span className="text-xs font-semibold text-green-700">
                          Amount: ₹{session.total_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailsModal({ open: true, session })}
                      className="flex-1 lg:flex-none border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl h-9 text-sm font-medium"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </Button>

                    {session.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            openConfirmDialog(session.id, "accept")
                          }
                          disabled={actionLoading === session.id}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 shadow-sm hover:shadow text-sm font-medium"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openConfirmDialog(session.id, "decline")
                          }
                          disabled={actionLoading === session.id}
                          className="flex-1 lg:flex-none border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl h-9 text-sm font-medium"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Decline
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 rounded-2xl shadow-none">
            <CardContent className="p-16">
              <div className="text-center max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm mb-5">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No sessions found
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {filter === "all" && dateRange === "all"
                    ? "You don't have any sessions yet. When students book sessions with you, they will appear here."
                    : dateRange !== "all"
                    ? `No ${
                        filter !== "all" ? filter : ""
                      } sessions found for ${
                        dateRange === "today"
                          ? "today"
                          : dateRange === "week"
                          ? "this week"
                          : "this month"
                      }.`
                    : `You don't have any ${filter} sessions.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, sessionId: null, action: null })
        }
        onConfirm={() => {
          if (confirmDialog.sessionId && confirmDialog.action) {
            handleSessionAction(confirmDialog.sessionId, confirmDialog.action);
          }
        }}
        title={
          confirmDialog.action === "accept"
            ? "Confirm Session"
            : "Decline Session"
        }
        description={
          confirmDialog.action === "accept"
            ? "Are you sure you want to accept this session? The student will be notified and the session will be confirmed."
            : "Are you sure you want to decline this session? This action cannot be undone and the student will be notified."
        }
        confirmText={
          confirmDialog.action === "accept"
            ? "Accept Session"
            : "Decline Session"
        }
        variant={confirmDialog.action === "decline" ? "destructive" : "default"}
      />

      {/* Session Details Modal */}
      <SessionDetailsModal
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, session: null })}
        session={detailsModal.session}
      />
    </div>
  );
};

export default SessionManagement;
