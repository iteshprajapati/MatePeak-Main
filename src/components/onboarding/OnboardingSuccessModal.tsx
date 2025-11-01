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
import {
  Share2,
  Eye,
  Settings,
  CheckCircle2,
  Sparkles,
  Calendar,
  TrendingUp,
  Share,
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
      showSuccessToast("Profile link copied!", {
        description: "Share it with your network",
      });
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-matepeak-primary via-matepeak-secondary to-orange-500 p-8 text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/lovable-uploads/c98e9036-c4eb-453e-8a08-f96d3ddb9b61.png')] opacity-5 bg-cover bg-center"></div>

          <DialogHeader className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold text-white">
                Profile Successfully Created!
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/90 text-base">
              Your mentor profile is now live and ready to receive bookings from
              students worldwide.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-6">
          {/* Profile Card Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-matepeak-primary" />
                <h3 className="font-semibold text-lg text-gray-900">
                  Your Mentor Profile Card
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewPublicProfile}
                className="text-matepeak-primary hover:text-matepeak-secondary"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Live
              </Button>
            </div>

            {loading ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="flex flex-col justify-center items-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-matepeak-primary"></div>
                    <Sparkles className="h-6 w-6 text-matepeak-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 font-medium">
                    Preparing your profile card...
                  </p>
                </CardContent>
              </Card>
            ) : mentorCard ? (
              <div className="flex justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 rounded-xl border-2 border-gray-200">
                <div className="w-full max-w-sm transform hover:scale-105 transition-transform duration-300">
                  <MentorCard mentor={mentorCard} />
                </div>
              </div>
            ) : (
              <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
                <CardContent className="text-center py-12 space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-orange-100 p-4 rounded-full">
                      <Eye className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Card Preview Loading...
                    </h4>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Your profile is live and ready! Click below to view your
                      profile page.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleViewPublicProfile}
                    className="mt-2 border-orange-300 hover:bg-orange-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Your Live Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border border-gray-200 hover:border-matepeak-primary/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-matepeak-primary mb-1">
                  {mentorCard?.reviewCount || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                  Reviews
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:border-matepeak-primary/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-matepeak-primary mb-1">
                  {mentorCard?.rating ? mentorCard.rating.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                  Rating
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:border-matepeak-primary/50 transition-colors">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-matepeak-primary mb-1">
                  ₹{mentorCard?.price || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                  Per Session
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50 hover:border-gray-400"
              onClick={handleViewPublicProfile}
            >
              <Eye className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">View Profile</div>
                <div className="text-xs text-gray-500">
                  See how students see you
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50 hover:border-gray-400"
              onClick={handleShareProfile}
            >
              <Share className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">Share Profile</div>
                <div className="text-xs text-gray-500">Spread the word</div>
              </div>
            </Button>
          </div>

          {/* Next Steps Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-lg text-gray-900">
                  Get Started & Grow Your Profile
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <div className="bg-green-100 p-1.5 rounded-full mt-0.5">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 mb-1">
                      Set Your Availability
                    </div>
                    <div className="text-xs text-gray-600">
                      Add your available time slots so students can book
                      sessions with you
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 mb-1">
                      Complete Your Profile
                    </div>
                    <div className="text-xs text-gray-600">
                      Add more details to increase visibility and attract more
                      students
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                  <div className="bg-orange-100 p-1.5 rounded-full mt-0.5">
                    <Share2 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 mb-1">
                      Share Your Profile
                    </div>
                    <div className="text-xs text-gray-600">
                      Promote your profile on social media to reach more
                      students
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary CTA */}
          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-matepeak-primary to-matepeak-secondary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
            onClick={handleGoToDashboard}
          >
            <Settings className="h-5 w-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSuccessModal;
