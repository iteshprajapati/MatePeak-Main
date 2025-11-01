import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
  ArrowRight,
  User,
  Video,
} from "lucide-react";
import { format } from "date-fns";

interface BookingSuccessModalProps {
  open: boolean;
  onClose: () => void;
  bookingDetails: {
    mentorName: string;
    serviceName: string;
    date: string;
    time: string;
    timezone?: string;
    duration: number;
    userEmail: string;
  };
  onViewBookings: () => void;
}

export default function BookingSuccessModal({
  open,
  onClose,
  bookingDetails,
  onViewBookings,
}: BookingSuccessModalProps) {
  const formattedDate = bookingDetails.date
    ? format(new Date(bookingDetails.date), "EEEE, MMMM d, yyyy")
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-y-auto max-h-[85vh] my-8 border-gray-200 rounded-3xl">
        {/* Success Header - Clean & Professional */}
        <div className="bg-gray-900 text-white px-6 py-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-3">
            <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold mb-1">Booking Confirmed</h2>
          <p className="text-gray-300 text-sm">
            Your session has been successfully scheduled
          </p>
        </div>

        {/* Content - Matching Dashboard Style */}
        <div className="p-6 space-y-4">
          {/* Session Details Card - Clean Design */}
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white shadow-sm">
            {/* Mentor Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Mentor
                </p>
                <p className="font-bold text-gray-900 truncate">
                  {bookingDetails.mentorName}
                </p>
              </div>
            </div>

            {/* Service Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Service
                </p>
                <p className="font-semibold text-gray-900 text-sm">
                  {bookingDetails.serviceName}
                </p>
              </div>
            </div>

            {/* Date & Time - Prominent Display */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {bookingDetails.time}
                    {bookingDetails.timezone && (
                      <span className="text-gray-600 font-normal">
                        {" "}
                        ({bookingDetails.timezone})
                      </span>
                    )}
                    <span className="text-gray-600 font-normal">
                      {" "}
                      • {bookingDetails.duration} min
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Beta Badge */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
              <p className="text-xs font-semibold text-green-800">
                FREE Session - Beta Launch Special
              </p>
            </div>
          </div>

          {/* Email Confirmation - Subtle */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-start gap-3">
            <Mail className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                Confirmation Email Sent
              </p>
              <p className="text-xs text-gray-600">
                Check{" "}
                <span className="font-semibold text-gray-900">
                  {bookingDetails.userEmail}
                </span>
              </p>
            </div>
          </div>

          {/* What's Next - Professional List */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
              What Happens Next
            </p>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Your mentor will be notified and can view the session details
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  You'll receive reminders 24 hours and 1 hour before the
                  session
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Meeting link will be available in your dashboard before the
                  session
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons - Dashboard Style */}
          <div className="flex gap-3 pt-1">
            <Button
              onClick={onViewBookings}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-10 font-semibold shadow-none"
            >
              View My Bookings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-xl h-10 border-gray-300 hover:bg-gray-50 font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
