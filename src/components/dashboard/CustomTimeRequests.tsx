import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  UserCircle,
  Award,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface CustomTimeRequestsProps {
  mentorProfile: any;
}

interface TimeRequest {
  id: string;
  mentee_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  message: string | null;
  status: "pending" | "approved" | "declined";
  mentor_response: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

type StatusFilter = "all" | "pending" | "approved" | "declined";

export default function CustomTimeRequests({
  mentorProfile,
}: CustomTimeRequestsProps) {
  const [requests, setRequests] = useState<TimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [respondDialog, setRespondDialog] = useState<{
    open: boolean;
    request: TimeRequest | null;
    action: "approve" | "decline" | null;
  }>({
    open: false,
    request: null,
    action: null,
  });
  const [mentorResponse, setMentorResponse] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [mentorProfile]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // First, try to fetch booking requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("mentor_id", mentorProfile.id)
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Error fetching booking requests:", requestsError);
        throw requestsError;
      }

      // Then fetch profile data for each request
      const requestsWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", request.mentee_id)
            .single();

          return {
            ...request,
            profiles: profileData || { full_name: "Unknown", email: "" },
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error fetching time requests:", error);
      toast.error("Failed to load time requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!respondDialog.request || !respondDialog.action) return;

    try {
      setResponding(true);

      const newStatus =
        respondDialog.action === "approve" ? "approved" : "declined";

      const { error } = await supabase
        .from("booking_requests")
        .update({
          status: newStatus,
          mentor_response: mentorResponse || null,
        })
        .eq("id", respondDialog.request.id);

      if (error) throw error;

      toast.success(
        `Request ${newStatus}! The student will be notified via email.`
      );

      // Refresh requests
      await fetchRequests();

      // Close dialog
      setRespondDialog({ open: false, request: null, action: null });
      setMentorResponse("");
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error("Failed to respond. Please try again.");
    } finally {
      setResponding(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:border-green-300 transition-colors">
            Approved
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Declined
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const isNewRequest = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    // Consider a request "new" if it's less than 48 hours old
    return diffHours < 48;
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const declinedCount = requests.filter((r) => r.status === "declined").length;

  if (loading) {
    return (
      <Card className="shadow-sm border border-gray-200 rounded-xl">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500">Loading time requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Matching Dashboard Style */}
      <div className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Time Requests
            </h1>
            <p className="text-gray-600 text-sm">
              Manage custom time slot requests from students
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-sm font-semibold">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            statusFilter === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Requests
          {requests.length > 0 && (
            <span className="ml-1.5 opacity-75">({requests.length})</span>
          )}
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            statusFilter === "approved"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Approved
          {approvedCount > 0 && (
            <span className="ml-1.5 opacity-75">({approvedCount})</span>
          )}
        </button>
        <button
          onClick={() => setStatusFilter("declined")}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            statusFilter === "declined"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Declined
          {declinedCount > 0 && (
            <span className="ml-1.5 opacity-75">({declinedCount})</span>
          )}
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {statusFilter !== "all" ? statusFilter : ""} requests
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {statusFilter === "pending"
                  ? "You don't have any pending requests at the moment."
                  : "Time requests from students will appear here."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-6 transition-all duration-200 hover:bg-gray-50/50 ${
                    request.status === "pending"
                      ? "bg-blue-50/20 border-l-2 border-blue-300"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ring-2 ring-gray-50">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {request.profiles?.full_name || "Unknown Student"}
                            </h3>
                            {isNewRequest(request.created_at) && (
                              <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0 h-4 leading-none">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {request.profiles?.email}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Date & Time Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700">
                            {formatDate(request.requested_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700">
                            {formatTime(request.requested_start_time)} -{" "}
                            {formatTime(request.requested_end_time)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(request.created_at)}
                        </span>
                      </div>

                      {/* Messages */}
                      {request.message && (
                        <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <UserCircle className="h-3.5 w-3.5" />
                            Mentee's Message
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {request.mentor_response && (
                        <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            Your Response
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {request.mentor_response}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {request.status === "pending" && (
                        <div className="flex gap-2.5 mt-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              setRespondDialog({
                                open: true,
                                request,
                                action: "approve",
                              })
                            }
                            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 rounded-lg shadow-sm transition-all hover:shadow"
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              setRespondDialog({
                                open: true,
                                request,
                                action: "decline",
                              })
                            }
                            variant="outline"
                            className="h-9 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-xs font-semibold px-5 rounded-lg transition-all"
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Dialog */}
      <Dialog
        open={respondDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRespondDialog({ open: false, request: null, action: null });
            setMentorResponse("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {respondDialog.action === "approve" ? "Approve" : "Decline"} Time
              Request
            </DialogTitle>
            <DialogDescription>
              {respondDialog.action === "approve"
                ? "Confirm that you can accommodate this time slot. The student will be notified."
                : "Let the student know why this time doesn't work. They can submit another request."}
            </DialogDescription>
          </DialogHeader>

          {respondDialog.request && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Request Details:
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong>{" "}
                  {formatDate(respondDialog.request.requested_date)}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Time:</strong>{" "}
                  {formatTime(respondDialog.request.requested_start_time)} -{" "}
                  {formatTime(respondDialog.request.requested_end_time)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">
                  Response Message{" "}
                  {respondDialog.action === "decline" && "(Required)"}
                </Label>
                <Textarea
                  id="response"
                  placeholder={
                    respondDialog.action === "approve"
                      ? "Add a confirmation message (optional)..."
                      : "Let the student know why this time doesn't work..."
                  }
                  value={mentorResponse}
                  onChange={(e) => setMentorResponse(e.target.value)}
                  className="border-gray-300 min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRespondDialog({ open: false, request: null, action: null });
                setMentorResponse("");
              }}
              disabled={responding}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={
                responding ||
                (respondDialog.action === "decline" && !mentorResponse)
              }
              className={
                respondDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {responding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {respondDialog.action === "approve" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
