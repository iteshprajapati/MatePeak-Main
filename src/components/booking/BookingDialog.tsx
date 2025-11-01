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
import { createBooking } from "@/services/bookingService";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
  mentorImage: string;
  services: any;
  servicePricing: any;
  timezone?: string;
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

  const handleClose = () => {
    // Reset state when closing
    setStep(1);
    setSelectedService(null);
    setSelectedDateTime(null);
    setBookingDetails(null);
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
        toast.success(
          selectedService.type === "digitalProducts"
            ? "Purchase successful!"
            : selectedService.type === "chatAdvice"
            ? "Message sent successfully!"
            : "Booking created successfully!"
        );
        handleClose();

        // Navigate to appropriate page based on service type
        if (selectedService.type === "chatAdvice") {
          navigate(`/chat/${mentorId}`); // Navigate to chat interface
        } else {
          navigate(`/booking-success?id=${result.data?.id}`);
        }
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
    if (step > 1) {
      setStep((step - 1) as BookingStep);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
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
    </Dialog>
  );
}
