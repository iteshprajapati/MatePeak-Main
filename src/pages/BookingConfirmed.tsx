import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Video,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";

interface BookingDetails {
  id: string;
  student_id: string;
  mentor_id: string;
  service_type: string;
  service_name: string;
  date: string;
  time_slot: string;
  duration: number;
  status: string;
  created_at: string;
  mentor_name: string;
  mentor_email: string;
  mentor_image: string;
  student_name: string;
  student_email: string;
}

const BookingConfirmed = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [userRole, setUserRole] = useState<"student" | "mentor" | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError("Please log in to view this booking confirmation.");
          setLoading(false);
          return;
        }

        // Validate booking ID
        if (!bookingId) {
          setError("Invalid booking ID.");
          setLoading(false);
          return;
        }

        // Fetch booking details with mentor and student info
        const { data: bookingData, error: bookingError } = await supabase
          .from("booking_requests")
          .select(
            `
            id,
            student_id,
            mentor_id,
            service_type,
            service_name,
            date,
            time_slot,
            duration,
            status,
            created_at,
            mentor:expert_profiles!booking_requests_mentor_id_fkey(
              full_name,
              email,
              avatar_url
            ),
            student:profiles!booking_requests_student_id_fkey(
              full_name,
              email
            )
          `
          )
          .eq("id", bookingId)
          .single();

        if (bookingError) {
          console.error("Booking fetch error:", bookingError);
          setError(
            "Unable to find booking details. Please check your bookings in the dashboard."
          );
          setLoading(false);
          return;
        }

        if (!bookingData) {
          setError("Booking not found.");
          setLoading(false);
          return;
        }

        // Verify user has access to this booking
        const userId = session.user.id;
        if (
          bookingData.student_id !== userId &&
          bookingData.mentor_id !== userId
        ) {
          setError("You don't have permission to view this booking.");
          setLoading(false);
          return;
        }

        // Determine user role
        setUserRole(bookingData.student_id === userId ? "student" : "mentor");

        // Extract mentor and student data (Supabase returns single object, not array)
        const mentorData = Array.isArray(bookingData.mentor)
          ? bookingData.mentor[0]
          : bookingData.mentor;
        const studentData = Array.isArray(bookingData.student)
          ? bookingData.student[0]
          : bookingData.student;

        // Format booking data
        const formattedBooking: BookingDetails = {
          id: bookingData.id,
          student_id: bookingData.student_id,
          mentor_id: bookingData.mentor_id,
          service_type: bookingData.service_type,
          service_name: bookingData.service_name,
          date: bookingData.date,
          time_slot: bookingData.time_slot,
          duration: bookingData.duration,
          status: bookingData.status,
          created_at: bookingData.created_at,
          mentor_name: mentorData?.full_name || "Unknown Mentor",
          mentor_email: mentorData?.email || "",
          mentor_image: mentorData?.avatar_url || "",
          student_name: studentData?.full_name || "Unknown Student",
          student_email: studentData?.email || "",
        };

        setBooking(formattedBooking);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
          <Card className="p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-medium text-gray-700">
                Loading booking details...
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Card className="p-8 max-w-md w-full mx-4 shadow-sm border border-gray-200">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                <p className="text-gray-600">{error || "Booking not found."}</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Format date and time
  const bookingDate = new Date(booking.date);
  const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy");
  const isStudent = userRole === "student";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4 shadow-md">
              <CheckCircle className="w-11 h-11 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-base text-gray-600">
              {isStudent
                ? "Your session has been successfully booked"
                : "You have a new booking request"}
            </p>
          </div>

          {/* Main Booking Card */}
          <Card className="overflow-hidden shadow-sm border border-gray-200 bg-white">
            {/* Clean Header */}
            <div className="bg-emerald-500 p-6 text-white">
              <div className="flex items-center gap-4">
                {booking.mentor_image && (
                  <img
                    src={booking.mentor_image}
                    alt={booking.mentor_name}
                    className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-50 mb-1">
                    {isStudent ? "Session with" : "Session booked by"}
                  </p>
                  <h2 className="text-2xl font-bold">
                    {isStudent ? booking.mentor_name : booking.student_name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-6">
              {/* Service Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Service Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Service Type</p>
                      <p className="font-semibold text-gray-900">
                        {booking.service_name}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {booking.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Schedule
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold text-gray-900">
                        {booking.time_slot}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {isStudent ? "Mentor" : "Student"}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {isStudent ? booking.mentor_name : booking.student_name}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 break-all">
                        {isStudent
                          ? booking.mentor_email
                          : booking.student_email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  What's Next?
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      You'll receive a confirmation email with all the details
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      A reminder will be sent 24 hours before the session
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Another reminder will arrive 1 hour before</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      Meeting link will be available in your dashboard
                    </span>
                  </li>
                </ul>
              </div>

              {/* Booking ID */}
              <div className="text-center py-3 border-t">
                <p className="text-xs text-gray-500">
                  Booking ID:{" "}
                  <span className="font-mono text-gray-700">{booking.id}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={() =>
                  navigate(isStudent ? "/dashboard" : "/mentor/dashboard")
                }
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </Card>

          {/* Additional Help */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Need help?{" "}
              <a
                href="mailto:support@sparkmentorconnect.com"
                className="text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmed;
