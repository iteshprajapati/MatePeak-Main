import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Clock,
  XCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAvailabilityProps {
  mentorId: string;
  mentorName?: string;
  mentorTimezone?: string;
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

interface DaySchedule {
  date: Date;
  dateStr: string;
  dayName: string;
  isToday: boolean;
  isBlocked: boolean;
  slots: { start: string; end: string }[];
  blockedReason?: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Timezone utilities
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const getTimezoneOffset = (timezone: string) => {
  const now = new Date();
  const tzString = now.toLocaleString('en-US', { timeZone: timezone });
  const tzDate = new Date(tzString);
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: getUserTimezone() }));
  return (tzDate.getTime() - localDate.getTime()) / (1000 * 60 * 60);
};

const convertTime = (time: string, fromTz: string, toTz: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const offset = getTimezoneOffset(toTz) - getTimezoneOffset(fromTz);
  let newHours = hours + offset;
  
  if (newHours < 0) newHours += 24;
  if (newHours >= 24) newHours -= 24;
  
  return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export default function ProfileAvailability({ mentorId, mentorName, mentorTimezone = "GMT+00:00" }: ProfileAvailabilityProps) {
  const [loading, setLoading] = useState(true);
  const [recurringSlots, setRecurringSlots] = useState<AvailabilitySlot[]>([]);
  const [specificSlots, setSpecificSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [selectedView, setSelectedView] = useState<'week' | 'recurring'>('week');
  const [showUserTimezone, setShowUserTimezone] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const navigate = useNavigate();

  const userTimezone = getUserTimezone();
  const displayTimezone = showUserTimezone ? userTimezone : mentorTimezone;

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

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

  const formatTime = (time: string) => {
    const convertedTime = showUserTimezone ? convertTime(time, mentorTimezone, userTimezone) : time;
    return new Date(`2000-01-01T${convertedTime}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getWeekSchedule = (): DaySchedule[] => {
    const schedule: DaySchedule[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();
      
      // Check if date is blocked
      const blocked = blockedDates.find(b => b.date === dateStr);
      
      // Get slots for this date
      const slots: { start: string; end: string }[] = [];
      
      // Add specific slots for this exact date
      specificSlots.forEach(slot => {
        if (slot.specific_date === dateStr) {
          slots.push({ start: slot.start_time, end: slot.end_time });
        }
      });
      
      // Add recurring slots for this day of week
      if (!blocked) {
        recurringSlots.forEach(slot => {
          if (slot.day_of_week === dayOfWeek) {
            slots.push({ start: slot.start_time, end: slot.end_time });
          }
        });
      }

      // Sort slots by start time
      slots.sort((a, b) => a.start.localeCompare(b.start));

      schedule.push({
        date,
        dateStr,
        dayName: DAYS_OF_WEEK[dayOfWeek],
        isToday: date.getTime() === today.getTime(),
        isBlocked: !!blocked,
        slots,
        blockedReason: blocked?.reason
      });
    }

    return schedule;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const handleBookSlot = (date: string, startTime: string, endTime: string) => {
    // Navigate to booking page with pre-filled information
    const bookingData = {
      mentorId,
      mentorName,
      date,
      startTime,
      endTime,
      timezone: showUserTimezone ? userTimezone : mentorTimezone
    };
    
    // Store booking data in session storage for the booking page
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    // Navigate to booking page
    navigate(`/booking/${mentorId}`, { 
      state: bookingData 
    });
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

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return blockedDates.some((blocked) => blocked.date === dateStr);
  };

  const groupedRecurring = groupSlotsByDay(recurringSlots);
  const weekSchedule = getWeekSchedule();
  const hasAnyAvailability = recurringSlots.length > 0 || specificSlots.length > 0;

  if (loading) {
    return (
      <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Loading skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timezone Toggle */}
      {hasAnyAvailability && (
        <Card className="shadow-none border border-gray-200 bg-white rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Showing times in:
                </span>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  {showUserTimezone ? userTimezone : mentorTimezone}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserTimezone(!showUserTimezone)}
                className="border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Switch to {showUserTimezone ? "Mentor's" : "My"} Timezone
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Tabs */}
      {hasAnyAvailability && (
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedView('week')}
            className={selectedView === 'week' ? 'bg-matepeak-primary hover:bg-matepeak-secondary' : 'border-gray-300'}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Week View
          </Button>
          <Button
            variant={selectedView === 'recurring' ? 'default' : 'outline'}
            onClick={() => setSelectedView('recurring')}
            className={selectedView === 'recurring' ? 'bg-matepeak-primary hover:bg-matepeak-secondary' : 'border-gray-300'}
          >
            <Clock className="h-4 w-4 mr-2" />
            Recurring Schedule
          </Button>
        </div>
      )}

      {/* Week View */}
      {selectedView === 'week' && hasAnyAvailability && (
        <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
                {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')} className="border-gray-300">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="border-gray-300">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')} className="border-gray-300">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {weekSchedule.map((day) => (
                <div
                  key={day.dateStr}
                  className={`p-4 rounded-xl border ${
                    day.isToday
                      ? 'border-matepeak-primary bg-matepeak-yellow/10'
                      : day.isBlocked
                      ? 'border-red-200 bg-red-50'
                      : day.slots.length > 0
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">{day.dayName.substring(0, 3).toUpperCase()}</h3>
                      {day.isToday && (
                        <Badge variant="outline" className="border-matepeak-primary text-matepeak-primary text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {day.isBlocked ? (
                    <div className="flex items-start gap-2 text-red-600">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Unavailable</p>
                        {day.blockedReason && (
                          <p className="text-xs text-red-500 mt-1">{day.blockedReason}</p>
                        )}
                      </div>
                    </div>
                  ) : day.slots.length > 0 ? (
                    <div className="space-y-2">
                      {day.slots.map((slot, idx) => {
                        const slotKey = `${day.dateStr}-${idx}`;
                        const duration = calculateDuration(slot.start, slot.end);
                        return (
                          <div
                            key={idx}
                            className={`group relative flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                              hoveredSlot === slotKey
                                ? 'bg-matepeak-yellow/20 border-matepeak-primary shadow-sm scale-105'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                            onMouseEnter={() => setHoveredSlot(slotKey)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            onClick={() => handleBookSlot(day.dateStr, slot.start, slot.end)}
                          >
                            <Clock className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${
                              hoveredSlot === slotKey ? 'text-matepeak-primary' : 'text-gray-600'
                            }`} />
                            <div className="flex-grow">
                              <span className="text-xs font-medium text-gray-900 block">
                                {formatTime(slot.start)} - {formatTime(slot.end)}
                              </span>
                              <span className="text-xs text-gray-500">{duration} min</span>
                            </div>
                            <Button
                              size="sm"
                              className={`opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs ${
                                hoveredSlot === slotKey
                                  ? 'bg-matepeak-primary hover:bg-matepeak-secondary'
                                  : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookSlot(day.dateStr, slot.start, slot.end);
                              }}
                            >
                              Book
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No availability</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Schedule View */}
      {selectedView === 'recurring' && recurringSlots.length > 0 && (
        <Card className="shadow-none border-0 bg-gray-50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Weekly Recurring Schedule</h2>
            </div>

            <div className="space-y-3">
              {Object.entries(groupedRecurring).map(([dayNum, slots]) => (
                <div
                  key={dayNum}
                  className="p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        {DAYS_OF_WEEK[parseInt(dayNum)]}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => {
                          const duration = calculateDuration(slot.start_time, slot.end_time);
                          return (
                            <Badge
                              key={slot.id}
                              variant="outline"
                              className="group border-gray-300 text-gray-700 bg-white text-xs px-3 py-2 hover:bg-matepeak-yellow/20 hover:border-matepeak-primary transition-all duration-200 cursor-default"
                            >
                              <Clock className="h-3 w-3 mr-1.5" />
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              <span className="ml-2 text-gray-500">({duration}m)</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
