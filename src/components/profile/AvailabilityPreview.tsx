import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityPreviewProps {
  mentorId: string;
  onSeeMore?: () => void;
}

interface AvailableDate {
  date: Date;
  day: string;
  dateStr: string;
  timeslotCount: number;
}

export default function AvailabilityPreview({ mentorId, onSeeMore }: AvailabilityPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAvailability();
  }, [mentorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      // Fetch recurring availability
      const { data: recurring, error: recurringError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", mentorId)
        .eq("is_recurring", true);

      if (recurringError) throw recurringError;

      // Fetch specific date slots
      const { data: specific, error: specificError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", mentorId)
        .eq("is_recurring", false)
        .gte("specific_date", now.toISOString().split("T")[0])
        .lte("specific_date", endOfMonth.toISOString().split("T")[0]);

      if (specificError) throw specificError;

      // Fetch blocked dates
      const { data: blocked, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("expert_id", mentorId)
        .gte("date", now.toISOString().split("T")[0])
        .lte("date", endOfMonth.toISOString().split("T")[0]);

      if (blockedError) throw blockedError;

      const blockedDates = new Set(blocked?.map((b) => b.date) || []);
      const dateMap = new Map<string, number>();

      // Process specific dates
      specific?.forEach((slot) => {
        if (slot.specific_date && !blockedDates.has(slot.specific_date)) {
          const count = dateMap.get(slot.specific_date) || 0;
          dateMap.set(slot.specific_date, count + 1);
        }
      });

      // Process recurring slots for the next 60 days
      if (recurring && recurring.length > 0) {
        for (let i = 0; i < 60; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() + i);
          const dateStr = date.toISOString().split("T")[0];
          
          if (!blockedDates.has(dateStr)) {
            const dayOfWeek = date.getDay();
            const daySlots = recurring.filter((slot) => slot.day_of_week === dayOfWeek);
            
            if (daySlots.length > 0) {
              const existingCount = dateMap.get(dateStr) || 0;
              dateMap.set(dateStr, existingCount + daySlots.length);
            }
          }
        }
      }

      // Convert to array and sort
      const datesArray: AvailableDate[] = Array.from(dateMap.entries())
        .map(([dateStr, count]) => {
          const date = new Date(dateStr + "T00:00:00");
          return {
            date,
            day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
            dateStr: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
            timeslotCount: count,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 6); // Show only next 6 available dates

      setAvailableDates(datesArray);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const totalTimeslots = availableDates.reduce((sum, d) => sum + d.timeslotCount, 0);

  return (
    <Card className="shadow-none border-0 bg-gray-50 rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              Availability On {monthNames[currentMonth.getMonth()]}
            </h3>
            <button 
              onClick={onSeeMore}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              See More
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Timeslots ({totalTimeslots})
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : availableDates.length > 0 ? (
          <div className="space-y-2">
            {availableDates.map((dateInfo, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">
                      {dateInfo.day}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {dateInfo.dateStr}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {dateInfo.timeslotCount} Timeslot{dateInfo.timeslotCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            No availability in the next 60 days
          </div>
        )}
      </CardContent>
    </Card>
  );
}
