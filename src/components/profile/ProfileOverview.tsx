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
    <div className="space-y-8">
      {/* How I'd Describe Myself */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-matepeak-yellow to-yellow-300 rounded-xl shadow-sm">
              <Quote className="h-6 w-6 text-matepeak-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">How I'd Describe Myself</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
            {mentor.introduction || mentor.bio || "No introduction provided yet."}
          </p>
        </CardContent>
      </Card>

      {/* Why I Became a Mentor */}
      {mentor.motivation && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl shadow-sm">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why I Became a Mentor</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
              {mentor.motivation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teaching Experience */}
      {mentor.teaching_experience && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl shadow-sm">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Teaching Experience</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
              {mentor.teaching_experience}
            </p>
          </CardContent>
        </Card>
      )}

      {/* What I Offer */}
      {services.length > 0 && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-sm">
                <Handshake className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Services & Pricing</h2>
            </div>
            <div className="space-y-4">
              {services.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl 
                      hover:from-matepeak-yellow/20 hover:to-matepeak-yellow/10 transition-all duration-300 
                      border border-gray-100 hover:border-matepeak-yellow/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-matepeak-primary rounded-lg group-hover:bg-matepeak-secondary transition-colors">
                        <ServiceIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                        {service.hasFreeDemo && (
                          <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1">
                            Free Demo Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xl font-bold text-matepeak-primary">
                      <DollarSign className="h-6 w-6" />
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
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl shadow-sm">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Reviews</h2>
              </div>
              {stats.averageRating > 0 && (
                <div className="flex items-center gap-2 bg-matepeak-yellow/10 px-4 py-2 rounded-lg">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({stats.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {featuredReviews.map((review, index) => (
                <div key={index}>
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl 
                    hover:from-matepeak-yellow/10 hover:to-white transition-all duration-300 border border-gray-100">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-matepeak-primary to-matepeak-secondary 
                        text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {review.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg text-gray-900">
                          {review.profiles?.full_name || "Anonymous"}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                  {index < featuredReviews.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
