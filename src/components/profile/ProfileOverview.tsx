import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Target, 
  Handshake,
  DollarSign,
  Video,
  MessageSquare,
  FileText,
  Star,
  Quote
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
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
            {mentor.introduction || mentor.bio || "No introduction provided yet."}
          </p>
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
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
              {mentor.motivation}
            </p>
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
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
              {mentor.teaching_experience}
            </p>
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
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <ServiceIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
                        {service.hasFreeDemo && (
                          <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                            Free Demo Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-base font-semibold text-gray-900">
                      <DollarSign className="h-4 w-4" />
                      <span>{service.price}</span>
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
