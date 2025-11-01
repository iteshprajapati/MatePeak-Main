import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SimilarMentors from "./SimilarMentors";

interface AvailabilityPreviewProps {
  mentorId: string;
  onSeeMore?: () => void;
  mentor?: any;
}

interface AvailableDate {
  date: Date;
  day: string;
  dateStr: string;
  timeslotCount: number;
}

interface Language {
  language: string;
  level: string;
}

interface DayStatus {
  date: Date;
  status: "available" | "blocked" | "unavailable";
  timeslotCount: number;
}

export default function AvailabilityPreview({
  mentorId,
  onSeeMore,
  mentor,
}: AvailabilityPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [languages, setLanguages] = useState<Language[]>([]);
  const [calendarDays, setCalendarDays] = useState<DayStatus[]>([]);
  const [showAllDates, setShowAllDates] = useState(false);

  useEffect(() => {
    fetchAvailability();
    fetchLanguages();
  }, [mentorId]);

  const fetchLanguages = async () => {
    try {
      console.log("Fetching languages for mentor:", mentorId);
      const { data: profileData, error } = await supabase
        .from("expert_profiles")
        .select("languages")
        .eq("id", mentorId)
        .single();

      if (error) {
        console.error("Error fetching languages:", error);
        throw error;
      }

      console.log("Languages data received:", profileData?.languages);

      if (profileData && profileData.languages) {
        setLanguages(profileData.languages);
      }
    } catch (error) {
      console.error("Error in fetchLanguages:", error);
    }
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);

      // Create dates in local timezone at midnight
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const todayStr = getLocalDateString(now);

      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      endOfMonth.setHours(0, 0, 0, 0);
      const endDateStr = getLocalDateString(endOfMonth);

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
        .gte("specific_date", todayStr)
        .lte("specific_date", endDateStr);

      if (specificError) throw specificError;

      // Fetch blocked dates
      const { data: blocked, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("expert_id", mentorId)
        .gte("date", todayStr)
        .lte("date", endDateStr);

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
          const checkDate = new Date(now);
          checkDate.setDate(now.getDate() + i);
          checkDate.setHours(0, 0, 0, 0);
          const dateStr = getLocalDateString(checkDate);

          if (!blockedDates.has(dateStr)) {
            const dayOfWeek = checkDate.getDay();
            const daySlots = recurring.filter(
              (slot) => slot.day_of_week === dayOfWeek
            );

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
          const date = parseDateString(dateStr);
          return {
            date,
            day: date
              .toLocaleDateString("en-US", { weekday: "short" })
              .toUpperCase(),
            dateStr: date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            }),
            timeslotCount: count,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 6); // Show only next 6 available dates

      setAvailableDates(datesArray);

      // Generate calendar days for the month
      generateCalendarDays(dateMap, blockedDates);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get date string in YYYY-MM-DD format in local timezone
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string in local timezone
  const parseDateString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const generateCalendarDays = (
    availabilityMap: Map<string, number>,
    blockedDates: Set<string>
  ) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first and last day of month in local timezone
    const firstDay = new Date(year, month, 1);
    firstDay.setHours(0, 0, 0, 0);

    const lastDay = new Date(year, month + 1, 0);
    lastDay.setHours(0, 0, 0, 0);

    const daysInMonth = lastDay.getDate();

    const days: DayStatus[] = [];

    // Get today's date at midnight in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      // Create date string in YYYY-MM-DD format using local timezone
      const dateKey = getLocalDateString(date);
      const timeslotCount = availabilityMap.get(dateKey) || 0;

      let status: "available" | "blocked" | "unavailable" = "unavailable";

      // Check if date is in the past (comparing timestamps)
      if (date.getTime() < today.getTime()) {
        status = "unavailable";
      }
      // Check if date is blocked
      else if (blockedDates.has(dateKey)) {
        status = "blocked";
      }
      // Check if date has available timeslots
      else if (timeslotCount > 0) {
        status = "available";
      }
      // Otherwise it's unavailable
      else {
        status = "unavailable";
      }

      days.push({
        date,
        status,
        timeslotCount,
      });
    }

    setCalendarDays(days);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate total slots for current month from calendar days (not availableDates)
  const totalTimeslots = calendarDays
    .filter((day) => day.status === "available")
    .reduce((sum, day) => sum + day.timeslotCount, 0);

  const getDotColor = (status: "available" | "blocked" | "unavailable") => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "blocked":
        return "bg-red-500";
      case "unavailable":
        return "bg-gray-300";
    }
  };

  return (
    <>
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
            {totalTimeslots > 0 && (
              <p className="text-xs text-gray-500">
                {totalTimeslots} slots available this month
              </p>
            )}
          </div>

          {/* Calendar View */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="mb-4">
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before start of month */}
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const firstDayOfMonth = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      1
                    );
                    firstDayOfMonth.setHours(0, 0, 0, 0);

                    // Check if we're in the current month
                    const isCurrentMonth =
                      today.getFullYear() === currentMonth.getFullYear() &&
                      today.getMonth() === currentMonth.getMonth();

                    if (isCurrentMonth && today.getDate() > 7) {
                      // If we're past the first week, calculate how many days to show from previous week
                      const todayDayOfWeek = today.getDay();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - todayDayOfWeek);
                      startOfWeek.setHours(0, 0, 0, 0);

                      // Find how many empty cells we need for the week containing today
                      const emptyCount = startOfWeek.getDay();
                      return Array.from({ length: emptyCount }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ));
                    } else {
                      // Show full month if we're in first week or not current month
                      const emptyCount = firstDayOfMonth.getDay();
                      return Array.from({ length: emptyCount }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ));
                    }
                  })()}

                  {/* Calendar days */}
                  {calendarDays.map((day, index) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = day.date.getTime() < today.getTime();

                    // Check if we should show this day
                    const isCurrentMonth =
                      today.getFullYear() === currentMonth.getFullYear() &&
                      today.getMonth() === currentMonth.getMonth();

                    // If current month and past the first week, only show dates from the start of current week
                    if (isCurrentMonth && today.getDate() > 7) {
                      const todayDayOfWeek = today.getDay();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - todayDayOfWeek);
                      startOfWeek.setHours(0, 0, 0, 0);

                      // Skip dates before the start of this week
                      if (day.date.getTime() < startOfWeek.getTime()) {
                        return null;
                      }
                    }

                    return (
                      <div
                        key={index}
                        className={`aspect-square flex flex-col items-center justify-center relative p-1 rounded-lg transition-colors ${
                          isPast
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-gray-50 cursor-pointer"
                        }`}
                        title={`${day.date.toLocaleDateString()} - ${
                          day.status
                        } ${
                          day.timeslotCount > 0
                            ? `(${day.timeslotCount} slots)`
                            : ""
                        }`}
                      >
                        <span
                          className={`text-xs font-medium mb-1 ${
                            isPast ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          {day.date.getDate()}
                        </span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${getDotColor(
                            day.status
                          )}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-600">Blocked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-xs text-gray-600">Unavailable</span>
                  </div>
                </div>
              </div>

              {/* Next Available Dates Section */}
              {availableDates.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">
                    Next Available Dates
                  </h4>
                  <div className="space-y-2">
                    {availableDates
                      .slice(0, showAllDates ? availableDates.length : 3)
                      .map((dateInfo, index) => (
                        <div
                          key={index}
                          onClick={onSeeMore}
                          className="bg-green-50/50 rounded-lg p-3 hover:bg-green-50 transition-colors cursor-pointer border-2 border-green-200"
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
                                {dateInfo.timeslotCount} Timeslot
                                {dateInfo.timeslotCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Show More/Show Less Button */}
                  {availableDates.length > 3 && (
                    <button
                      onClick={() => setShowAllDates(!showAllDates)}
                      className="w-full mt-3 py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                    >
                      {showAllDates
                        ? "Show Less"
                        : `Show More (${availableDates.length - 3} more)`}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Languages Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-gray-600" />
              <h4 className="font-semibold text-sm text-gray-900">Languages</h4>
            </div>
            {languages && languages.length > 0 ? (
              <div className="space-y-2">
                {languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {lang.language}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-gray-400">
                No languages specified
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Similar Mentors - Only show if mentor data is available */}
      {mentor && (
        <div className="mt-6">
          <SimilarMentors
            currentMentorId={mentor.id}
            categories={mentor.categories || []}
            expertiseTags={mentor.expertise_tags || []}
          />
        </div>
      )}
    </>
  );
}
