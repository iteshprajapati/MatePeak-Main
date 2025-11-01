import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ServiceSelection from "./ServiceSelection";
import DateTimeSelection from "./DateTimeSelection";
import BookingConfirmation from "./BookingConfirmation";
import BookingSuccessModal from "./BookingSuccessModal";
import { createBooking } from "@/services/bookingService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
  mentorImage: string;
  services: any;
  servicePricing: any;
  timezone?: string;
  averageRating?: number;
  totalReviews?: number;
}

export type BookingStep = 1 | 2 | 3;

export interface SelectedService {
  type: "oneOnOneSession" | "chatAdvice" | "digitalProducts" | "notes";
  name: string;
  duration: number; // in minutes
  price: number;
  hasFreeDemo?: boolean;
}

export interface SelectedDateTime {
  date: Date;
  time: string;
  timezone: string;
}

export interface BookingDetails {
  name: string;
  email: string;
  phone?: string;
  purpose: string;
  addRecording?: boolean;
}

export default function BookingDialog({
  open,
  onOpenChange,
  mentorId,
  mentorName,
  mentorImage,
  services,
  servicePricing,
  timezone = "Asia/Kolkata",
  averageRating = 0,
  totalReviews = 0,
}: BookingDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] =
    useState<SelectedService | null>(null);
  const [selectedDateTime, setSelectedDateTime] =
    useState<SelectedDateTime | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const handleClose = () => {
    // Don't reset state if success modal is showing
    if (!showSuccessModal) {
      setStep(1);
      setSelectedService(null);
      setSelectedDateTime(null);
      setBookingDetails(null);
    }
    onOpenChange(false);
  };

  const handleServiceSelect = (service: SelectedService) => {
    setSelectedService(service);

    // For digital products and notes, skip date/time selection
    if (service.type === "digitalProducts" || service.type === "notes") {
      setStep(3);
    }
    // For chat advice, also skip date/time (chat doesn't need scheduling)
    else if (service.type === "chatAdvice") {
      setStep(3);
    }
    // Only video sessions need date/time selection
    else {
      setStep(2);
    }
  };

  const handleDateTimeSelect = (dateTime: SelectedDateTime) => {
    setSelectedDateTime(dateTime);
    setStep(3);
  };

  // Function to send confirmation emails
  const sendConfirmationEmails = async (
    bookingData: any,
    studentDetails: BookingDetails,
    serviceDetails: SelectedService
  ) => {
    try {
      const formattedDate = format(
        new Date(bookingData.scheduled_date),
        "EEEE, MMMM d, yyyy"
      );

      // Email to Student
      const studentEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #10b981; color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #111827; font-weight: 600; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${studentDetails.name},</p>
      <p>Great news! Your booking with <strong>${mentorName}</strong> has been confirmed.</p>
      
      <div class="card">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Session Details</h2>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceDetails.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${bookingData.scheduled_time} (${
        selectedDateTime?.timezone || timezone
      })</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${serviceDetails.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value" style="color: #10b981;">FREE - Beta Special</span>
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>What to expect:</strong><br>
        • You'll receive a reminder 24 hours before the session<br>
        • Another reminder will be sent 1 hour before<br>
        • Meeting link will be available in your dashboard
      </p>
    </div>
    
    <div class="footer">
      <p>Need help? <a href="mailto:support@sparkmentorconnect.com">Contact Support</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;

      // Send email to student
      await supabase.functions.invoke("send-email", {
        body: {
          to: studentDetails.email,
          subject: `Booking Confirmed: ${serviceDetails.name} with ${mentorName}`,
          html: studentEmailHtml,
        },
      });

      // Fetch mentor email
      const { data: mentorProfile } = await supabase
        .from("expert_profiles")
        .select("email, full_name")
        .eq("id", mentorId)
        .single();

      if (mentorProfile?.email) {
        // Email to Mentor
        const mentorEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #111827; color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #111827; font-weight: 600; }
    .message-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Booking Received</h1>
    </div>
    
    <div class="content">
      <p>Hi ${mentorProfile.full_name || "there"},</p>
      <p>You have a new booking from <strong>${
        studentDetails.name
      }</strong>.</p>
      
      <div class="card">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Session Details</h2>
        <div class="detail-row">
          <span class="detail-label">Student</span>
          <span class="detail-value">${studentDetails.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceDetails.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${bookingData.scheduled_time} (${
          selectedDateTime?.timezone || timezone
        })</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${serviceDetails.duration} minutes</span>
        </div>
      </div>
      
      ${
        studentDetails.purpose
          ? `
      <div class="message-box">
        <strong>Session Purpose:</strong><br>
        ${studentDetails.purpose}
      </div>
      `
          : ""
      }
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>Next Steps:</strong><br>
        • Review the session purpose above<br>
        • Check your dashboard for session details<br>
        • Prepare any materials needed
      </p>
    </div>
    
    <div class="footer">
      <p>Questions? <a href="mailto:support@sparkmentorconnect.com">Contact Support</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

        // Send email to mentor
        await supabase.functions.invoke("send-email", {
          body: {
            to: mentorProfile.email,
            subject: `New Booking: ${serviceDetails.name} with ${studentDetails.name}`,
            html: mentorEmailHtml,
          },
        });
      }

      console.log("Confirmation emails sent successfully");
    } catch (error) {
      console.error("Failed to send confirmation emails:", error);
      // Don't fail the booking if email fails
    }
  };

  const handleBookingSubmit = async (details: BookingDetails) => {
    if (!selectedService) return;

    setIsSubmitting(true);
    setBookingDetails(details);

    try {
      const recordingPrice = details.addRecording ? 300 : 0;
      const totalAmount = selectedService.price + recordingPrice;

      // For services without date/time, use immediate/null values
      let scheduledDate = null;
      let scheduledTime = null;

      if (selectedDateTime) {
        scheduledDate = selectedDateTime.date.toISOString().split("T")[0];
        scheduledTime = selectedDateTime.time;
      } else {
        // For digital products, chat, notes - use today's date
        scheduledDate = new Date().toISOString().split("T")[0];
        scheduledTime = "00:00"; // Placeholder time
      }

      const bookingData = {
        expert_id: mentorId,
        session_type: selectedService.type,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration: selectedService.duration,
        message: details.purpose,
        total_amount: totalAmount,
        user_name: details.name,
        user_email: details.email,
        user_phone: details.phone,
        add_recording: details.addRecording,
      };

      const result = await createBooking(bookingData);

      if (result.success) {
        // Store booking data for success modal BEFORE closing dialog
        setCreatedBooking(result.data);

        // Send confirmation emails (async, don't wait)
        sendConfirmationEmails(result.data, details, selectedService);

        // Show success modal first
        setShowSuccessModal(true);

        // Close booking dialog after a brief delay
        setTimeout(() => {
          handleClose();
        }, 100);
      } else {
        toast.error(result.error || "Failed to create booking");
      }
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 3 && selectedService) {
      // If on step 3, check if service needs date/time
      const needsDateTime = selectedService.type === "oneOnOneSession";

      if (needsDateTime) {
        // Go back to step 2 (date/time selection)
        setStep(2);
      } else {
        // Skip step 2 and go directly to step 1 (service selection)
        setStep(1);
      }
    } else if (step === 2) {
      // From step 2, always go back to step 1
      setStep(1);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return `Book a Session with ${mentorName}`;
      case 2:
        return "Select Date & Time";
      case 3:
        if (selectedService?.type === "digitalProducts") {
          return "Complete Purchase";
        } else if (selectedService?.type === "chatAdvice") {
          return "Send Message";
        } else if (selectedService?.type === "notes") {
          return "Purchase Session Notes";
        }
        return "Confirm Booking";
      default:
        return "Book a Session";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {step === 1 && mentorImage && (
              <img
                src={mentorImage}
                alt={mentorName}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}

            <DialogTitle className="text-xl font-bold text-gray-900 flex-1">
              {getStepTitle()}
            </DialogTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 1 && (
            <ServiceSelection
              services={services}
              servicePricing={servicePricing}
              onServiceSelect={handleServiceSelect}
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
          )}

          {step === 2 && selectedService && (
            <DateTimeSelection
              selectedService={selectedService}
              mentorId={mentorId}
              timezone={timezone}
              onDateTimeSelect={handleDateTimeSelect}
            />
          )}

          {step === 3 && selectedService && (
            <BookingConfirmation
              selectedService={selectedService}
              selectedDateTime={selectedDateTime}
              mentorName={mentorName}
              onSubmit={handleBookingSubmit}
              onChangeDateTime={() => setStep(2)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </DialogContent>

      {/* Success Modal */}
      {showSuccessModal &&
        createdBooking &&
        bookingDetails &&
        selectedService && (
          <BookingSuccessModal
            open={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              setCreatedBooking(null);
              // Reset all booking state
              setStep(1);
              setSelectedService(null);
              setSelectedDateTime(null);
              setBookingDetails(null);
            }}
            bookingDetails={{
              mentorName,
              serviceName: selectedService.name,
              date: createdBooking.scheduled_date,
              time: createdBooking.scheduled_time,
              timezone: selectedDateTime?.timezone || timezone,
              duration: selectedService.duration,
              userEmail: bookingDetails.email,
            }}
            onViewBookings={() => {
              setShowSuccessModal(false);
              setCreatedBooking(null);
              // Reset all booking state
              setStep(1);
              setSelectedService(null);
              setSelectedDateTime(null);
              setBookingDetails(null);
              navigate("/dashboard");
            }}
          />
        )}
    </Dialog>
  );
}
