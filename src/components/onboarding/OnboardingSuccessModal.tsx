import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MentorCard from "@/components/MentorCard";
import { MentorProfile } from "@/components/MentorCard";
import { fetchMentorCardByUsername } from "@/services/mentorCardService";
import { Share2, Eye, Settings, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";

interface OnboardingSuccessModalProps {
  isOpen: boolean;
  username: string;
  onClose: () => void;
}

const OnboardingSuccessModal = ({
  isOpen,
  username,
  onClose,
}: OnboardingSuccessModalProps) => {
  const navigate = useNavigate();
  const [mentorCard, setMentorCard] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && username) {
      // Add a small delay to ensure database has committed the profile
      const timer = setTimeout(() => {
        loadMentorCard();
        triggerConfetti();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, username]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#4F46E5", "#F59E0B", "#10B981"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const loadMentorCard = async () => {
    try {
      setLoading(true);
      console.log("Loading mentor card for username:", username);
      
      const card = await fetchMentorCardByUsername(username);
      
      console.log("Mentor card loaded:", card);
      
      if (card) {
        setMentorCard(card);
      } else {
        console.warn("No mentor card found for username:", username);
        // Retry once after a delay
        setTimeout(async () => {
          const retryCard = await fetchMentorCardByUsername(username);
          if (retryCard) {
            setMentorCard(retryCard);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error loading mentor card:", error);
      toast.error("Could not load card preview, but your profile is live!");
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/mentor/${username}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Check out my mentor profile on Matepeak`,
        text: `I'm now mentoring on Matepeak! Book a session with me.`,
        url: profileUrl,
      }).catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    }
  };

  const handleViewPublicProfile = () => {
    window.open(`/mentor/${username}`, "_blank");
  };

  const handleGoToDashboard = () => {
    navigate(`/dashboard/${username}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-matepeak-primary via-matepeak-secondary to-orange-500 bg-clip-text text-transparent">
              Congratulations! 🎉
            </DialogTitle>
          </div>
          <DialogDescription className="text-lg">
            Your mentor profile is now live! Students can discover and book sessions with you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Profile Card Preview */}
          <div className="bg-gradient-to-br from-matepeak-primary/5 to-orange-500/5 p-6 rounded-lg border-2 border-dashed border-matepeak-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-matepeak-primary" />
              <h3 className="font-semibold text-lg">Your Mentor Card</h3>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matepeak-primary"></div>
                <p className="text-sm text-gray-500 ml-3">Loading your card...</p>
              </div>
            ) : mentorCard ? (
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <MentorCard mentor={mentorCard} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="text-gray-500">
                  <p className="mb-2">Preview temporarily unavailable</p>
                  <p className="text-sm">Your profile is live and ready to be discovered!</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleViewPublicProfile}
                  className="mt-4"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Your Live Profile
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleViewPublicProfile}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShareProfile}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-matepeak-primary to-matepeak-secondary hover:opacity-90"
              onClick={handleGoToDashboard}
            >
              <Settings className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 text-blue-900">
              🚀 What's Next?
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Set Your Availability:</strong> Add your available time slots so students can book sessions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Complete Your Profile:</strong> Add more details to increase your profile score and visibility
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Share Your Link:</strong> Promote your profile on social media to attract students
                </span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-matepeak-primary">
                {mentorCard?.reviewCount || 0}
              </div>
              <div className="text-xs text-gray-600">Reviews</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-matepeak-primary">
                {mentorCard?.rating || "New"}
              </div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-matepeak-primary">
                ₹{mentorCard?.price || 0}
              </div>
              <div className="text-xs text-gray-600">Starting Price</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSuccessModal;
