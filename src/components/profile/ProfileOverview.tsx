import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Target, 
  Handshake,
  Video,
  MessageSquare,
  FileText,
  Star,
  Quote,
  IndianRupee,
  CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileOverviewProps {
  mentor: any;
  stats: {
    averageRating: number;
    reviewCount: number;
  };
}

export default function ProfileOverview({ mentor, stats }: ProfileOverviewProps) {
  const [featuredReviews, setFeaturedReviews] = useState<any[]>([]);
  const [showMore, setShowMore] = useState({
    introduction: false,
    motivation: false,
    teaching_experience: false,
  });

  useEffect(() => {
    fetchFeaturedReviews();
  }, [mentor.id]);

  const fetchFeaturedReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating, comment, created_at, user_id")
        .eq("expert_id", mentor.id)
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        // Fetch user details for each review
        const reviewsWithProfiles = await Promise.all(
          data.map(async (review) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", review.user_id)
              .single();
            
            return {
              ...review,
              profiles: profile || { full_name: "Anonymous", avatar_url: null }
            };
          })
        );
        setFeaturedReviews(reviewsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const getServicesList = () => {
    const services = [];
    if (mentor.service_pricing?.oneOnOneSession?.enabled) {
      services.push({
        name: "1-on-1 Sessions",
        price: mentor.service_pricing.oneOnOneSession.price,
        hasFreeDemo: mentor.service_pricing.oneOnOneSession.hasFreeDemo,
        icon: Video,
      });
    }
    if (mentor.service_pricing?.chatAdvice?.enabled) {
      services.push({
        name: "Chat Advice",
        price: mentor.service_pricing.chatAdvice.price,
        hasFreeDemo: mentor.service_pricing.chatAdvice.hasFreeDemo,
        icon: MessageSquare,
      });
    }
    if (mentor.service_pricing?.digitalProducts?.enabled) {
      services.push({
        name: "Digital Products",
        price: mentor.service_pricing.digitalProducts.price,
        hasFreeDemo: false,
        icon: FileText,
      });
    }
    if (mentor.service_pricing?.notes?.enabled) {
      services.push({
        name: "Notes & Resources",
        price: mentor.service_pricing.notes.price,
        hasFreeDemo: false,
        icon: FileText,
      });
    }
    return services;
  };

  const services = getServicesList();

  return (
    <div className="space-y-6">
      {/* How I'd Describe Myself */}
      <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Quote className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">How I'd Describe Myself</h2>
          </div>
          <p className={`text-gray-700 leading-relaxed text-sm whitespace-pre-line ${!showMore.introduction ? 'line-clamp-3' : ''}`}>
            {mentor.introduction || mentor.bio || "No introduction provided yet."}
          </p>
          {((mentor.introduction || mentor.bio || '').split('\n').length > 3 || (mentor.introduction || mentor.bio || '').length > 250) && (
            <button
              className="text-xs text-matepeak-primary font-medium focus:outline-none border-b border-gray-200"
              style={{paddingBottom: '1px', marginTop: '0'}}
              onClick={() => setShowMore((prev) => ({ ...prev, introduction: !prev.introduction }))}
            >
              {showMore.introduction ? 'Show less' : 'Show more'}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Why I Became a Mentor */}
      {mentor.motivation && (
        <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Why I Became a Mentor</h2>
            </div>
            <p className={`text-gray-700 leading-relaxed text-sm whitespace-pre-line ${!showMore.motivation ? 'line-clamp-3' : ''}`}>
              {mentor.motivation}
            </p>
            {(mentor.motivation.split('\n').length > 3 || mentor.motivation.length > 250) && (
              <button
                className="text-xs text-matepeak-primary font-medium focus:outline-none border-b border-gray-200"
                style={{paddingBottom: '1px', marginTop: '0'}}
                onClick={() => setShowMore((prev) => ({ ...prev, motivation: !prev.motivation }))}
              >
                {showMore.motivation ? 'Show less' : 'Show more'}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teaching Experience */}
      {mentor.teaching_experience && (
        <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">An Ideal Relationship To Me</h2>
            </div>
            <p className={`text-gray-700 leading-relaxed text-sm whitespace-pre-line ${!showMore.teaching_experience ? 'line-clamp-3' : ''}`}>
              {mentor.teaching_experience}
            </p>
            {(mentor.teaching_experience.split('\n').length > 3 || mentor.teaching_experience.length > 250) && (
              <button
                className="text-xs text-matepeak-primary font-medium focus:outline-none border-b border-gray-200"
                style={{paddingBottom: '1px', marginTop: '0'}}
                onClick={() => setShowMore((prev) => ({ ...prev, teaching_experience: !prev.teaching_experience }))}
              >
                {showMore.teaching_experience ? 'Show less' : 'Show more'}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* What I Offer */}
      {services.length > 0 && (
        <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Handshake className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Services & Pricing</h2>
            </div>
            <div className="space-y-3">
              {services.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                      <ServiceIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
                        <div className="flex items-center gap-0.5 text-lg font-bold text-gray-900 flex-shrink-0">
                          <IndianRupee className="h-4 w-4" />
                          <span>{service.price}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {service.name === "1-on-1 Sessions" && "Live video sessions tailored to your learning pace"}
                        {service.name === "Chat Advice" && "Get quick guidance via text chat whenever you need"}
                        {service.name === "Digital Products" && "Access curated resources and learning materials"}
                        {service.name === "Notes & Resources" && "Download study materials and practice exercises"}
                      </p>
                      {service.hasFreeDemo && (
                        <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Free Demo Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Reviews */}
      {featuredReviews.length > 0 && (
        <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Asif's Community</h2>
              </div>
              {stats.averageRating > 0 && (
                <div className="text-sm text-gray-600">
                  ({stats.reviewCount})
                </div>
              )}
            </div>

            <div className="space-y-4">
              {featuredReviews.map((review, index) => (
                <div key={index}>
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm">
                        {review.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {review.profiles?.full_name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                  {index < featuredReviews.length - 1 && <div className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
