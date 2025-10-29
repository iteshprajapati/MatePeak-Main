import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock,
  XCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";

interface ProfileAvailabilityProps {
  mentorId: string;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
}

interface BlockedDate {
  date: string;
  reason: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ProfileAvailability({ mentorId }: ProfileAvailabilityProps) {
  const [loading, setLoading] = useState(true);
  const [recurringSlots, setRecurringSlots] = useState<AvailabilitySlot[]>([]);
  const [specificSlots, setSpecificSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchAvailability();
  }, [mentorId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);

      // Fetch recurring availability slots
      const { data: recurring, error: recurringError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", mentorId)
        .eq("is_recurring", true)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (recurringError) throw recurringError;

      // Fetch specific date slots
      const { data: specific, error: specificError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", mentorId)
        .eq("is_recurring", false)
        .not("specific_date", "is", null)
        .order("specific_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (specificError) throw specificError;

      // Fetch blocked dates
      const { data: blocked, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("date, reason")
        .eq("expert_id", mentorId)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (blockedError) throw blockedError;

      setRecurringSlots(recurring || []);
      setSpecificSlots(specific || []);
      setBlockedDates(blocked || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDay = (slots: AvailabilitySlot[]) => {
    const grouped: { [key: number]: AvailabilitySlot[] } = {};
    slots.forEach((slot) => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    return grouped;
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return blockedDates.some((blocked) => blocked.date === dateStr);
  };

  const groupedRecurring = groupSlotsByDay(recurringSlots);

  if (loading) {
    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-matepeak-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Recurring Availability */}
      {recurringSlots.length > 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-matepeak-yellow rounded-lg">
                <CalendarIcon className="h-5 w-5 text-matepeak-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Weekly Schedule</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedRecurring).map(([dayNum, slots]) => (
                <div
                  key={dayNum}
                  className="p-4 bg-matepeak-light rounded-lg hover:bg-matepeak-yellow/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {DAYS_OF_WEEK[parseInt(dayNum)]}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <Badge
                            key={slot.id}
                            variant="outline"
                            className="bg-white border-matepeak-primary text-matepeak-primary"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specific Date Availability */}
      {specificSlots.length > 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-matepeak-yellow rounded-lg">
                <CalendarIcon className="h-5 w-5 text-matepeak-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Special Availability</h2>
            </div>

            <div className="space-y-3">
              {specificSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 bg-matepeak-light rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(slot.specific_date!).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white border-matepeak-primary text-matepeak-primary"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blocked/Unavailable Dates */}
      {blockedDates.length > 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Unavailable Dates</h2>
            </div>

            <div className="space-y-2">
              {blockedDates.map((blocked, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(blocked.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-gray-600 mt-1">{blocked.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Availability Message */}
      {recurringSlots.length === 0 && specificSlots.length === 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              This mentor hasn't set up their availability yet.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please contact them directly to schedule a session.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
