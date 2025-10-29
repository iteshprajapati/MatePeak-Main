import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { MessageSquare, Send, Star } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual feedback submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Thank you for your feedback! 🎉", {
        description: "We appreciate you taking the time to help us improve.",
      });
      
      // Reset form
      setFormData({ email: "", subject: "", message: "" });
      setRating(0);
      onClose();
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] bg-white border-gray-200 shadow-xl p-0">
        <DialogHeader className="space-y-2 px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-matepeak-primary via-matepeak-secondary to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900 mb-0.5">
                Share Your Feedback
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Help us improve MatePeak with your insights
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5">
          {/* Rating Section */}
          <div className="space-y-2 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <Label className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <span>Rate your experience</span>
              <span className="text-gray-500 font-normal text-xs">(Optional)</span>
            </Label>
            <div className="flex gap-2 justify-center py-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-matepeak-primary focus:ring-offset-2 rounded-full p-1"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "text-gray-300 hover:text-gray-400"
                    } transition-all duration-200`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center py-1 px-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-md border border-amber-200/50">
                <p className="text-xs text-gray-700 font-semibold">
                  {rating === 5 && "Excellent! 🎉"}
                  {rating === 4 && "Great! 😊"}
                  {rating === 3 && "Good 👍"}
                  {rating === 2 && "Fair 😐"}
                  {rating === 1 && "Needs Improvement 😕"}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="feedback-email" className="text-xs font-semibold text-gray-900">
                Email <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-9 border-gray-300 focus:border-matepeak-primary focus:ring-matepeak-primary text-sm"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="feedback-subject" className="text-xs font-semibold text-gray-900">
                Subject <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="feedback-subject"
                type="text"
                placeholder="Topic"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full h-9 border-gray-300 focus:border-matepeak-primary focus:ring-matepeak-primary text-sm"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="feedback-message" className="text-xs font-semibold text-gray-900">
              Your Feedback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="feedback-message"
              placeholder="Share your thoughts, suggestions, or report issues..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full min-h-[90px] resize-none border-gray-300 focus:border-matepeak-primary focus:ring-matepeak-primary text-sm"
              required
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {formData.message.length}/500
              </p>
              {formData.message.length > 450 && (
                <p className="text-xs text-orange-500 font-medium">
                  Almost at limit
                </p>
              )}
            </div>
          </div>

          {/* Submit Button - Centered */}
          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              className="w-full max-w-xs h-10 bg-gradient-to-r from-matepeak-primary via-matepeak-secondary to-orange-500 hover:opacity-90 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-gray-600 font-medium">
              Your feedback is <span className="text-emerald-700 font-bold">100% confidential</span> and helps us improve MatePeak
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
