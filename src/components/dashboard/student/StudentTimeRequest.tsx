import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchBookingRequests, type BookingRequest } from "@/services/bookingRequestService";

interface StudentTimeRequestProps {
  studentProfile: any;
}

export default function StudentTimeRequest({ studentProfile }: StudentTimeRequestProps) {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const requestsData = await fetchBookingRequests(user.id);
      setRequests(requestsData);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load time requests");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatName = (name?: string) => {
    if (!name) return "Mentor";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || "pending").toLowerCase();
    const variants: Record<string, { className: string; icon: any; text: string }> = {
      pending: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
        text: "Pending",
      },
      approved: {
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        text: "Approved",
      },
      declined: {
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        text: "Declined",
      },
      rejected: {
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        text: "Declined",
      },
    };
    const cfg = variants[normalized] || variants.pending;
    const Icon = cfg.icon;
    return (
      <Badge className={`inline-flex items-center gap-1 border ${cfg.className} rounded-md text-xs px-2 py-0.5`}>
        <Icon className="h-3 w-3" />
        {cfg.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading time requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Time Requests</h2>
        <p className="text-sm text-gray-600 mt-1">Your requested time slots sent to mentors</p>
      </div>

      {requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Time Requests Yet</h3>
            <p className="text-gray-600 text-center">You don’t have any time requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {request.mentor?.profile_picture_url ? (
                          <img
                            src={request.mentor.profile_picture_url}
                            alt={formatName(request.mentor?.full_name)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white text-lg font-bold">
                            {formatName(request.mentor?.full_name).charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {formatName(request.mentor?.full_name)}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {request.mentor?.headline || "Expert"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(request.status)}</div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(request.requested_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatTime(request.requested_start_time)} - {formatTime(request.requested_end_time)}
                      </span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                      <p className="text-sm text-gray-700">{request.message}</p>
                    </div>
                  )}

                  {request.mentor_response && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-blue-700 mb-1">Mentor Response</p>
                      <p className="text-sm text-blue-800">{request.mentor_response}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
