import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MentorCard from "@/components/MentorCard";
import { MentorProfile } from "@/components/MentorCard";
import { fetchMentorCardByUsername } from "@/services/mentorCardService";
import {
  Share2,
  Eye,
  Settings,
  CheckCircle2,
  Sparkles,
  Calendar,
  ArrowRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast-helpers";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";

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
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ["#4F46E5", "#F59E0B", "#10B981"];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
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
      showErrorToast("Could not load card preview", {
        description: "Your profile is live and ready!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/mentor/${username}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Check out my mentor profile on Matepeak`,
          text: `I'm now mentoring on Matepeak! Book a session with me.`,
          url: profileUrl,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(profileUrl);
      showSuccessToast("Link copied to clipboard!", {
        description: "Share it with your network",
      });
    }
  };

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/mentor/${username}`;
    navigator.clipboard.writeText(profileUrl);
    showSuccessToast("Profile link copied!", {
      description: "Ready to share",
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Success Header */}
        <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-full">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Profile Created Successfully!
              </h2>
              <p className="text-white/90 text-sm mt-0.5">
                You're now live and ready to accept bookings
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-5">
          {/* Profile Preview */}
          {mentorCard && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm text-gray-900">
                  Your Profile Card
                </h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="max-w-sm mx-auto">
                  <MentorCard mentor={mentorCard} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleViewPublicProfile}
              className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              <div className="text-center">
                <div className="font-semibold text-xs">View Live Profile</div>
                <div className="text-[10px] text-gray-500">
                  See how students see you
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              <div className="text-center">
                <div className="font-semibold text-xs">Copy Link</div>
                <div className="text-[10px] text-gray-500">
                  Share your profile
                </div>
              </div>
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Next Steps
              </h4>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">
                      Set availability:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Add time slots for bookings
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">
                      Share profile:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Promote on social media
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">
                      Update services:
                    </span>
                    <span className="text-gray-600">
                      {" "}
                      Customize your offerings
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary CTA */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleShareProfile}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              className="flex-1 bg-gray-900 hover:bg-gray-800"
              onClick={handleGoToDashboard}
            >
              <Settings className="h-4 w-4 mr-2" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSuccessModal;
