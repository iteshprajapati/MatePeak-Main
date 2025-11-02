import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileReviewsProps {
  mentorId: string;
  stats: {
    averageRating: number;
    reviewCount: number;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  mentor_reply: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function ProfileReviews({ mentorId, stats }: ProfileReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const REVIEWS_PER_PAGE = 10;

  useEffect(() => {
    fetchReviews();
  }, [mentorId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const from = (page - 1) * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("reviews")
        .select("id, rating, comment, mentor_reply, created_at, user_id", { count: "exact" })
        .eq("expert_id", mentorId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch user profiles for each review
      if (data && data.length > 0) {
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
        setReviews(reviewsWithProfiles as any);
      } else {
        setReviews([]);
      }

      setHasMore((count || 0) > page * REVIEWS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistribution = () => {
    // This would ideally come from a database query
    // For now, we'll just show the average
    return null;
  };

  if (loading && page === 1) {
    return (
      <Card className="shadow-sm border-0 bg-gray-50 rounded-2xl">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="shadow-sm border-0 bg-gray-50 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Student Reviews
              </h2>
              <p className="text-sm text-gray-600">
                Based on {stats.reviewCount} {stats.reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(stats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <Card className="shadow-sm border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-gray-900 text-white text-sm font-medium">
                        {review.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-grow">
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {review.profiles?.full_name || "Anonymous"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Comment */}
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {review.comment}
                      </p>

                      {/* Mentor Reply */}
                      {review.mentor_reply && (
                        <div className="mt-3 pl-3 border-l-2 border-gray-300 bg-white p-3 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-3.5 w-3.5 text-gray-600" />
                            <span className="font-medium text-xs text-gray-900">
                              Mentor's Response
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {review.mentor_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {index < reviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No reviews yet</p>
            <p className="text-xs text-gray-500 mt-2">
              Be the first to book a session and leave a review!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
