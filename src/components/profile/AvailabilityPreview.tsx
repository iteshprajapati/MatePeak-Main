import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock,
  Zap,
  TrendingUp,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityPreviewProps {
  mentorId: string;
  expertiseTags: string[];
}

interface NextSlot {
  date: string;
  time: string;
  day: string;
}

export default function AvailabilityPreview({ mentorId, expertiseTags }: AvailabilityPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [nextSlots, setNextSlots] = useState<NextSlot[]>([]);

  useEffect(() => {
    fetchNextAvailableSlots();
  }, [mentorId]);

  const fetchNextAvailableSlots = async () => {
    try {
      setLoading(true);

      // Fetch recurring availability
      const { data: recurring, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", mentorId)
        .eq("is_recurring", true)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Calculate next available slots based on recurring schedule
      const today = new Date();
      const slots: NextSlot[] = [];
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      if (recurring && recurring.length > 0) {
        // Find next occurrences of each day
        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + i);
          const dayOfWeek = targetDate.getDay();

          const daySlots = recurring.filter(slot => slot.day_of_week === dayOfWeek);
          
          if (daySlots.length > 0) {
            const firstSlot = daySlots[0];
            slots.push({
              date: targetDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              time: formatTime(firstSlot.start_time),
              day: daysOfWeek[dayOfWeek],
            });
          }

          if (slots.length >= 4) break;
        }
      }

      setNextSlots(slots);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-8">
      {/* Next Available Slots */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-matepeak-yellow to-yellow-300 rounded-lg shadow-sm">
              <Calendar className="h-5 w-5 text-matepeak-primary" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Next Available</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-matepeak-primary" />
            </div>
          ) : nextSlots.length > 0 ? (
            <>
              <div className="space-y-3">
                {nextSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl 
                      hover:from-matepeak-yellow/20 hover:to-matepeak-yellow/10 
                      transition-all duration-300 cursor-pointer border border-gray-100 
                      hover:border-matepeak-yellow/30 group hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-matepeak-primary transition-colors">
                          {slot.day}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{slot.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-white border-matepeak-primary text-matepeak-primary px-3 py-1.5"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 text-sm text-matepeak-primary font-semibold 
                hover:bg-matepeak-yellow/10 rounded-lg transition-colors">
                See Full Calendar →
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-600 text-center py-6 bg-gray-50 rounded-lg">
              Contact mentor for availability
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills & Specializations */}
      {expertiseTags && expertiseTags.length > 0 && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-sm">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Skills</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {expertiseTags.slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-matepeak-primary text-matepeak-primary 
                    hover:bg-matepeak-yellow/20 px-3 py-1.5 text-sm transition-colors cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
              {expertiseTags.length > 8 && (
                <Badge variant="outline" className="text-gray-600 px-3 py-1.5 text-sm">
                  +{expertiseTags.length - 8}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg shadow-sm">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Quick Stats</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white 
              rounded-lg hover:from-matepeak-yellow/10 hover:to-white transition-colors">
              <span className="text-gray-600 font-medium">Response Rate</span>
              <span className="font-semibold text-matepeak-primary">~24hrs</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white 
              rounded-lg hover:from-matepeak-yellow/10 hover:to-white transition-colors">
              <span className="text-gray-600 font-medium">Session Format</span>
              <span className="font-semibold text-matepeak-primary">Video/Chat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
