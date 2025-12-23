import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Video,
  MessageSquare,
  RotateCcw,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface MySessionsProps {
  studentProfile: any;
}

export default function MySessions({ studentProfile }: MySessionsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, activeTab]);

  const fetchSessions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          expert_profiles (
            id,
            full_name,
            username,
            profile_picture_url,
            expertise,
            hourly_rate
          )
        `
        )
        .eq("student_id", user.id)
        .order("session_date", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];
    const now = new Date();

    // Filter by tab
    switch (activeTab) {
      case "upcoming":
        filtered = filtered.filter(
          (s) => new Date(s.session_date) > now && s.status !== "cancelled"
        );
        break;
      case "past":
        filtered = filtered.filter(
          (s) => new Date(s.session_date) <= now || s.status === "completed"
        );
        break;
      case "cancelled":
        filtered = filtered.filter((s) => s.status === "cancelled");
        break;
      // 'all' shows everything
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.expert_profiles?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          s.expert_profiles?.expertise?.some((e: string) =>
            e.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          s.message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Session cancelled successfully");
      fetchSessions();
    } catch (error: any) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session");
    }
  };

  const exportToCSV = () => {
    const csv = [
      [
        "Date",
        "Time",
        "Mentor",
        "Expertise",
        "Duration",
        "Status",
        "Price",
      ].join(","),
      ...filteredSessions.map((s) =>
        [
          formatDate(s.session_date),
          formatTime(s.session_date),
          s.expert_profiles?.full_name || "",
          s.expert_profiles?.expertise?.[0] || "",
          `${s.duration || 60} min`,
          s.status,
          `$${s.total_price || 0}`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sessions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Sessions exported successfully");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by mentor, expertise, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="ghost"
          onClick={exportToCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">
            Upcoming (
            {
              sessions.filter(
                (s) =>
                  new Date(s.session_date) > new Date() &&
                  s.status !== "cancelled"
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="past">
            Past (
            {
              sessions.filter(
                (s) =>
                  new Date(s.session_date) <= new Date() ||
                  s.status === "completed"
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({sessions.filter((s) => s.status === "cancelled").length}
            )
          </TabsTrigger>
          <TabsTrigger value="all">All ({sessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Sessions Found
                </h3>
                <p className="text-gray-600 text-center">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : `No ${activeTab} sessions to display`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Mentor Avatar */}
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                        {session.expert_profiles?.profile_picture_url ? (
                          <img
                            src={session.expert_profiles.profile_picture_url}
                            alt={session.expert_profiles.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold">
                            {session.expert_profiles?.full_name?.charAt(0) ||
                              "M"}
                          </div>
                        )}
                      </div>

                      {/* Session Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {session.expert_profiles?.full_name || "Mentor"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {session.expert_profiles?.expertise?.join(", ") ||
                                "Expert"}
                            </p>
                          </div>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.session_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(session.session_date)} •{" "}
                              {session.duration || 60} min
                            </span>
                          </div>
                          {session.total_price && (
                            <div className="font-medium text-blue-600">
                              ${session.total_price}
                            </div>
                          )}
                        </div>

                        {session.message && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            "{session.message}"
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {session.status === "confirmed" &&
                            new Date(session.session_date) > new Date() && (
                              <>
                                <Button
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Video className="h-4 w-4" />
                                  Join Session
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Message
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleCancelSession(session.id)
                                  }
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </Button>
                              </>
                            )}

                          {session.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline">
                                Awaiting Confirmation
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelSession(session.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel Request
                              </Button>
                            </>
                          )}

                          {session.status === "completed" && (
                            <>
                              <Button size="sm" variant="outline">
                                Write Review
                              </Button>
                              <Button size="sm" variant="outline">
                                Book Again
                              </Button>
                            </>
                          )}

                          {session.status === "cancelled" &&
                            new Date(session.session_date) > new Date() && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Rebook
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {filteredSessions.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredSessions.length} of {sessions.length} sessions
              </span>
              <span className="font-medium text-gray-900">
                Total Spent: $
                {filteredSessions
                  .reduce((sum, s) => sum + (s.total_price || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
