import { useEffect, useState } from "react";
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
  Filter,
  Eye,
  Search,
  ArrowUpDown,
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

type SessionStatus = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status";

const SessionManagement = ({ mentorProfile }: SessionManagementProps) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SessionStatus>("all");
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

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", mentorProfile.id)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load sessions. Please try again.",
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
          session.id === sessionId
            ? { ...session, status: newStatus }
            : session
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
        description: error.message || "Failed to update session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, sessionId: null, action: null });
    }
  };

  const openConfirmDialog = (sessionId: string, action: "accept" | "decline") => {
    setConfirmDialog({ open: true, sessionId, action });
  };

  // Filter, search, and sort sessions
  const filteredAndSortedSessions = sessions
    .filter((session) => {
      // Status filter
      if (filter !== "all" && session.status !== filter) return false;

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
      completed: { label: "Completed", className: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={`${config.className} border-0`}>{config.label}</Badge>
    );
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your bookings and upcoming sessions
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions by name, email, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as SessionStatus)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-gray-600" />
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Sort by" />
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
          </div>

          {/* Results Count */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedSessions.length} of {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              {searchQuery && (
                <span className="ml-2 text-gray-900 font-medium">
                  matching "{searchQuery}"
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredAndSortedSessions.length > 0 ? (
          filteredAndSortedSessions.map((session) => (
            <Card key={session.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.session_type || "1-on-1 Session"}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.scheduled_date, session.scheduled_time)}</span>
                          </div>
                          {isUpcoming(session.scheduled_date, session.scheduled_time) && session.status === "confirmed" && (
                            <Badge className="bg-blue-100 text-blue-800 border-0">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(session.status || "pending")}
                    </div>

                    {session.message && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {session.message}
                      </p>
                    )}

                    {session.total_amount && (
                      <p className="text-sm font-medium text-gray-900">
                        Price: ${session.total_amount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailsModal({ open: true, session })}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    
                    {session.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => openConfirmDialog(session.id, "accept")}
                          disabled={actionLoading === session.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConfirmDialog(session.id, "decline")}
                          disabled={actionLoading === session.id}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
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
          <Card className="border-gray-200">
            <CardContent className="p-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sessions found
                </h3>
                <p className="text-sm text-gray-600">
                  {filter === "all"
                    ? "You don't have any sessions yet. They will appear here once students book with you."
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
        confirmText={confirmDialog.action === "accept" ? "Accept Session" : "Decline Session"}
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
