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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Loader2,
  User
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

export default function CustomTimeRequests({ mentorProfile }: CustomTimeRequestsProps) {
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

      const { data, error } = await supabase
        .from("booking_requests")
        .select(`
          *,
          profiles!booking_requests_mentee_id_fkey (
            full_name,
            email
          )
        `)
        .eq("mentor_id", mentorProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
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

      const newStatus = respondDialog.action === "approve" ? "approved" : "declined";

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
          <Badge className="bg-green-100 text-green-800 border-green-200">
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

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

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
      {/* Header with Stats */}
      <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Custom Time Requests
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage time slot requests from students
              </p>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold text-gray-700">Filter by Status:</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500 ml-auto">
              {filteredRequests.length} {filteredRequests.length === 1 ? "request" : "requests"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
          <CardContent className="p-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {statusFilter !== "all" ? statusFilter : ""} requests
              </h3>
              <p className="text-gray-500">
                {statusFilter === "pending"
                  ? "You don't have any pending time requests at the moment."
                  : "Time requests from students will appear here."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className={`shadow-sm border-2 transition-all hover:shadow-md ${
                request.status === "pending"
                  ? "border-yellow-200 bg-yellow-50/30"
                  : "border-gray-200 bg-white"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {request.profiles?.full_name || "Unknown Student"}
                      </h3>
                      <p className="text-sm text-gray-600">{request.profiles?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested {getTimeAgo(request.created_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatDate(request.requested_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Time</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatTime(request.requested_start_time)} -{" "}
                        {formatTime(request.requested_end_time)}
                      </p>
                    </div>
                  </div>
                </div>

                {request.message && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Student's Message:
                    </p>
                    <p className="text-sm text-blue-800">{request.message}</p>
                  </div>
                )}

                {request.mentor_response && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-gray-900 mb-1">
                      Your Response:
                    </p>
                    <p className="text-sm text-gray-700">{request.mentor_response}</p>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() =>
                        setRespondDialog({
                          open: true,
                          request,
                          action: "approve",
                        })
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      onClick={() =>
                        setRespondDialog({
                          open: true,
                          request,
                          action: "decline",
                        })
                      }
                      variant="outline"
                      className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={respondDialog.open} onOpenChange={(open) => {
        if (!open) {
          setRespondDialog({ open: false, request: null, action: null });
          setMentorResponse("");
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {respondDialog.action === "approve" ? "Approve" : "Decline"} Time Request
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
                <p className="text-sm font-semibold text-gray-900 mb-2">Request Details:</p>
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong> {formatDate(respondDialog.request.requested_date)}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Time:</strong> {formatTime(respondDialog.request.requested_start_time)} -{" "}
                  {formatTime(respondDialog.request.requested_end_time)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">
                  Response Message {respondDialog.action === "decline" && "(Required)"}
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
              disabled={responding || (respondDialog.action === "decline" && !mentorResponse)}
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
