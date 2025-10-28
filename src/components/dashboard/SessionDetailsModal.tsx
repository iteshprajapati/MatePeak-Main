import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, DollarSign, User, Mail, Phone, MessageSquare, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SessionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  session: any;
}

const SessionDetailsModal = ({ open, onClose, session }: SessionDetailsModalProps) => {
  if (!session) return null;

  const formatDate = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateTime);
    } catch {
      return "Date not set";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Session Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`px-3 py-1 text-sm font-medium border ${getStatusColor(session.status)}`}>
              {session.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
            <p className="text-sm text-gray-600">
              Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
            </p>
          </div>

          <Separator />

          {/* Session Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Session Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="p-2 rounded-lg bg-white">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Date & Time</p>
                  <p className="text-sm text-gray-900 mt-1 font-medium">
                    {formatDate(session.scheduled_date, session.scheduled_time)}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="p-2 rounded-lg bg-white">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Duration</p>
                  <p className="text-sm text-gray-900 mt-1 font-medium">
                    {session.duration || 60} minutes
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="p-2 rounded-lg bg-white">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Total Amount</p>
                  <p className="text-sm text-gray-900 mt-1 font-medium">
                    ${session.total_amount?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Session Type */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="p-2 rounded-lg bg-white">
                  <Video className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Session Type</p>
                  <p className="text-sm text-gray-900 mt-1 font-medium">
                    {session.session_type || "1-on-1 Video Call"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
            
            <div className="space-y-3">
              {/* Student Name */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Full Name</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {session.student_name || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Student Email */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {session.student_email || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Student Phone */}
              {session.student_phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Phone</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {session.student_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes/Message */}
          {session.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Student Message
                </h3>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {session.notes}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Meeting Link */}
          {session.meeting_link && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Meeting Link</h3>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium break-all"
                  >
                    {session.meeting_link}
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Additional Information */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Booking ID</p>
              <p className="text-gray-900 font-medium mt-1">{session.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="text-gray-900 font-medium mt-1">
                {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailsModal;
