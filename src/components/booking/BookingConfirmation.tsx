import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Video,
  Lock,
  Star,
  Loader2,
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
  const [addRecording, setAddRecording] = useState(false);
  const [receiveOnPhone, setReceiveOnPhone] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

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

  const recordingPrice = 300;
  const platformFee = 10;
  const basePrice = selectedService.price;
  const total = basePrice + (addRecording ? recordingPrice : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      phone,
      purpose,
      addRecording,
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
        return "Complete Purchase";
      case "chatAdvice":
        return "Send Message";
      case "notes":
        return "Purchase Notes";
      default:
        return "Confirm and Pay";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service & DateTime Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg mb-1">
              {selectedService.name}
            </h4>
            <p className="text-sm text-gray-600">
              {selectedService.type === "oneOnOneSession" &&
                `Video Call | ${selectedService.duration}mins`}
              {selectedService.type === "chatAdvice" &&
                "Text-based Mentoring Session"}
              {selectedService.type === "digitalProducts" && "Digital Download"}
              {selectedService.type === "notes" && "Session Notes & Materials"}
            </p>
          </div>
        </div>

        {needsDateTime && selectedDateTime && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {format(selectedDateTime.date, "EEE, d MMM")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {selectedDateTime.time} ({selectedDateTime.timezone})
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onChangeDateTime}
              className="text-sm"
            >
              Change
            </Button>
          </div>
        )}
      </div>

      {/* User Details Form */}
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
          <Label htmlFor="email" className="text-sm font-medium text-gray-900">
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
            className="mt-1.5 min-h-[80px]"
            required
          />
        </div>
      </div>

      {/* Add-ons - Only show recording for video sessions */}
      {selectedService.type === "oneOnOneSession" && (
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Checkbox
              id="recording"
              checked={addRecording}
              onCheckedChange={(checked) => setAddRecording(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="recording"
                className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
              >
                Get session recording
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  4.9
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1">
                ₹{recordingPrice} | Retain your learnings better
              </p>
              <div className="flex items-start gap-2 mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                <Video className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>AI powered:</strong> Summaries highlighting key
                  insights and action items
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="phone"
              checked={receiveOnPhone}
              onCheckedChange={(checked) =>
                setReceiveOnPhone(checked as boolean)
              }
            />
            <label
              htmlFor="phone"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Receive booking details on phone
            </label>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="border-2 border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="text-sm"
          >
            Order Summary
            {showOrderSummary ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </div>

        {showOrderSummary && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">1 × {selectedService.name}</span>
              <span className="font-medium text-gray-900">
                ₹{basePrice.toLocaleString("en-IN")}
              </span>
            </div>
            {addRecording && selectedService.type === "oneOnOneSession" && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Add on: Recording</span>
                <span className="font-medium text-gray-900">
                  ₹{recordingPrice}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                Platform fee
                <span className="text-xs">(info)</span>
              </span>
              <span className="font-medium text-green-600">
                ₹{platformFee} FREE
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Discount Code */}
      <button
        type="button"
        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
      >
        Add Discount Code
      </button>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>Payments are 100% secure & encrypted</span>
      </div>

      {/* Terms */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By confirming, you agree to our{" "}
          <a href="#" className="text-gray-700 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-gray-700 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </form>
  );
}
