import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
  Smartphone,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  SelectedService,
  SelectedDateTime,
  BookingDetails,
} from "./BookingDialog";
import { supabase } from "@/integrations/supabase/client";

interface BookingConfirmationProps {
  selectedService: SelectedService;
  selectedDateTime: SelectedDateTime | null;
  mentorName: string;
  onSubmit: (details: BookingDetails) => void;
  onChangeDateTime: () => void;
  isSubmitting?: boolean;
}

export default function BookingConfirmation({
  selectedService,
  selectedDateTime,
  mentorName,
  onSubmit,
  onChangeDateTime,
  isSubmitting = false,
}: BookingConfirmationProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");

        // Fetch profile data for name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) {
          setName(profile.full_name);
        }
      }
    };

    fetchUserData();
  }, []);

  const platformFee = 10;
  const basePrice = selectedService.price;
  const total = basePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      phone,
      purpose,
      addRecording: false,
    });
  };

  const isFormValid = name && email && purpose;

  // Check if this service type needs date/time
  const needsDateTime = selectedService.type === "oneOnOneSession";

  // Determine the appropriate label for purpose field
  const getPurposeLabel = () => {
    switch (selectedService.type) {
      case "chatAdvice":
        return "What would you like to discuss?";
      case "digitalProducts":
        return "What are you looking to achieve with this product?";
      case "notes":
        return "What topics are you interested in?";
      default:
        return "What is the call about?";
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Processing...";
    switch (selectedService.type) {
      case "digitalProducts":
        return "Confirm Booking (FREE)";
      case "chatAdvice":
        return "Confirm Booking (FREE)";
      case "notes":
        return "Confirm Booking (FREE)";
      default:
        return "Confirm Booking (FREE)";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
      {/* FREE Beta Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white rounded-full p-2 flex-shrink-0">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-green-900 font-bold text-base">
              🎉 Beta Launch Special - 100% FREE!
            </p>
            <p className="text-green-700 text-sm">
              All sessions are completely free during our beta period. No
              payment required!
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1.5">
          Confirm Your Booking
        </h3>
        <p className="text-sm text-gray-600">
          Review your details and complete your booking
        </p>
      </div>

      {/* Service & DateTime Summary */}
      <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm">
        {/* Service Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base mb-1.5">
              {selectedService.name}
            </h4>
            <p className="text-sm text-gray-600 font-medium">
              {selectedService.type === "oneOnOneSession" &&
                `Video Call • ${selectedService.duration} mins`}
              {selectedService.type === "chatAdvice" &&
                "Text-based Mentoring Session"}
              {selectedService.type === "digitalProducts" && "Digital Download"}
              {selectedService.type === "notes" && "Session Notes & Materials"}
            </p>
          </div>
          <div className="bg-green-500 text-white rounded-xl px-4 py-2 shadow-sm">
            <p className="text-xl font-bold">FREE</p>
            <p className="text-xs opacity-90 line-through">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {needsDateTime && selectedDateTime && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="space-y-2">
              {/* Date */}
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="font-semibold text-gray-900">
                  {format(selectedDateTime.date, "EEE, d MMM yyyy")}
                </span>
              </div>
              {/* Time */}
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {selectedDateTime.time} ({selectedDateTime.timezone})
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onChangeDateTime}
              className="text-sm font-semibold rounded-xl border-gray-300 hover:bg-gray-900 hover:text-white"
            >
              Change
            </Button>
          </div>
        )}
      </div>

      {/* User Details Form */}
      <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm">
        <h4 className="font-bold text-gray-900 text-base mb-4">Your Details</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-900"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1.5"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Please confirm your email address. All session confirmations,
              reminders, and notifications will be sent here.
            </p>
          </div>

          <div>
            <Label
              htmlFor="purpose"
              className="text-sm font-medium text-gray-900"
            >
              {getPurposeLabel()}
            </Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={
                selectedService.type === "chatAdvice"
                  ? "Briefly describe what you'd like to discuss in the chat..."
                  : selectedService.type === "digitalProducts"
                  ? "Tell us about your goals..."
                  : "Briefly describe what you'd like to discuss"
              }
              className="mt-1.5 min-h-[120px]"
              required
            />
          </div>
        </div>
      </div>

      {/* Receive booking details on phone - Coming soon */}
      {selectedService.type === "oneOnOneSession" && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Smartphone className="h-4 w-4 flex-shrink-0" />
          <p>
            Receive booking details on phone{" "}
            <span className="font-light text-gray-500">
              (coming soon! we are working on it)
            </span>
          </p>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm">
        {/* Price Header */}
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-gray-900 text-base">Order Summary</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="text-sm font-medium hover:bg-white rounded-lg"
          >
            {showOrderSummary ? "Hide" : "View Details"}
            {showOrderSummary ? (
              <ChevronUp className="ml-1.5 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1.5 h-4 w-4" />
            )}
          </Button>
        </div>

        {showOrderSummary && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                1 × {selectedService.name}
              </span>
              <span className="font-semibold text-gray-400 line-through">
                ₹{basePrice.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Beta Discount</span>
              <span className="font-semibold text-green-600">-100%</span>
            </div>
            <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-base">Total</span>
              <div className="text-right">
                <span className="font-bold text-green-600 text-2xl">FREE</span>
                <p className="text-xs text-gray-400 line-through">
                  ₹{total.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          getSubmitButtonText()
        )}
      </Button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2.5 text-xs text-gray-500 bg-gray-50 rounded-xl py-3">
        <Lock className="h-3.5 w-3.5" />
        <span className="font-medium">
          Payments are 100% secure & encrypted
        </span>
      </div>

      {/* Terms */}
      <div className="text-center pb-2">
        <p className="text-xs text-gray-500">
          By confirming, you agree to our{" "}
          <a href="#" className="text-gray-700 hover:underline font-medium">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-gray-700 hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </form>
  );
}
