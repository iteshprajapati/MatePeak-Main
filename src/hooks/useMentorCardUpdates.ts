import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

/**
 * Hook to listen for real-time changes to mentor profiles
 * and update the local cache/state accordingly
 */
export function useMentorCardUpdates(
  onUpdate?: (mentorId: string) => void
) {
  useEffect(() => {
    // Subscribe to expert_profiles changes
    const channel = supabase
      .channel("mentor-card-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "expert_profiles",
        },
        (payload) => {
          console.log("Mentor profile updated:", payload);
          
          if (payload.eventType === "INSERT") {
            toast.success("New mentor profile created!");
          } else if (payload.eventType === "UPDATE") {
            toast.info("Mentor profile updated");
          }
          
          // Notify parent component if callback provided
          if (onUpdate && payload.new) {
            const newData = payload.new as any;
            if (newData.id) {
              onUpdate(newData.id as string);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

/**
 * Hook to listen for review changes and update mentor ratings
 */
export function useMentorReviewUpdates(
  mentorId?: string,
  onRatingUpdate?: () => void
) {
  useEffect(() => {
    if (!mentorId) return;

    const channel = supabase
      .channel(`mentor-reviews-${mentorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `mentor_id=eq.${mentorId}`,
        },
        (payload) => {
          console.log("Review updated for mentor:", payload);
          
          if (payload.eventType === "INSERT") {
            toast.success("New review received!");
          }
          
          // Notify parent to refresh rating
          if (onRatingUpdate) {
            onRatingUpdate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorId, onRatingUpdate]);
}

/**
 * Hook to track mentor profile completeness in real-time
 */
export function useProfileCompleteness(mentorId?: string) {
  useEffect(() => {
    if (!mentorId) return;

    const checkCompleteness = async () => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select("profile_completeness_score")
        .eq("id", mentorId)
        .single();

      if (error) {
        console.error("Error fetching completeness score:", error);
        return;
      }

      const score = data?.profile_completeness_score || 0;
      
      // Show encouragement based on score
      if (score < 40) {
        toast.warning("Complete your profile to increase visibility!", {
          description: `Profile is ${score}% complete`,
        });
      } else if (score < 70) {
        toast.info("Good progress! Add more details to stand out.", {
          description: `Profile is ${score}% complete`,
        });
      }
    };

    checkCompleteness();
  }, [mentorId]);
}
