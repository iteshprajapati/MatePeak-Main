import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
  ArrowRight,
  User,
  Video,
  X,
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
    <Dialog
      open={open}
      onOpenChange={(open) => {
        // Only allow closing via explicit button clicks, not backdrop or ESC
        if (!open) return;
      }}
    >
      <DialogContent
        className="sm:max-w-[600px] max-h-[92vh] p-0 border-0 rounded-2xl shadow-xl my-4 flex flex-col overflow-hidden focus-visible:outline-none"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Custom Close Button - White Color */}
        <DialogPrimitive.Close className="absolute right-4 top-4 z-20 rounded-sm opacity-90 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-white">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        {/* Success Header - Matching Dashboard */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-6 text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-3 shadow-lg">
              <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">
              Session Booked!
            </h2>
            <p className="text-gray-300 text-sm">
              Your session has been successfully scheduled
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Content - Matching Dashboard Style */}
          <div className="p-5 space-y-4 bg-gray-50">
            {/* Session Details Card - Matching Dashboard */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Mentor & Service Info */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Mentor
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {bookingDetails.mentorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Service
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {bookingDetails.serviceName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date & Time - Highlighted Section */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Calendar className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Date
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {formattedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Clock className="h-4 w-4 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Time
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {bookingDetails.time}
                      <span className="text-gray-600 font-normal text-xs block">
                        {bookingDetails.timezone &&
                          `${bookingDetails.timezone} • `}
                        {bookingDetails.duration} min
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Beta Badge */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200 p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
                  <p className="text-xs font-bold text-green-900">
                    FREE Session - Beta Launch Special
                  </p>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-0.5">
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

            {/* What's Next */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                What Happens Next
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2
                      className="h-2.5 w-2.5 text-green-600"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-xs text-gray-700 leading-relaxed">
                    Your mentor will be notified and can view session details
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2
                      className="h-2.5 w-2.5 text-green-600"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-xs text-gray-700 leading-relaxed">
                    You'll receive reminders 24 hours and 1 hour before the
                    session
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2
                      className="h-2.5 w-2.5 text-green-600"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-xs text-gray-700 leading-relaxed">
                    Meeting link will be available in your dashboard
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={onViewBookings}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-10 font-semibold shadow-sm"
              >
                View My Bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-xl h-10 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
