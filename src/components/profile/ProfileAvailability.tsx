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
  Globe,
  Bell,
  MessageSquare,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Helper to get date string in local timezone (avoids UTC conversion)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Timezone utilities
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
};

const getTimezoneOffset = (timezone: string) => {
  // If timezone is not a valid IANA timezone, treat as UTC
  if (!isValidTimezone(timezone)) {
    console.warn(`Invalid timezone: ${timezone}, using UTC`);
    return 0;
  }
  
  try {
    const now = new Date();
    const tzString = now.toLocaleString('en-US', { timeZone: timezone });
    const tzDate = new Date(tzString);
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: getUserTimezone() }));
    return (tzDate.getTime() - localDate.getTime()) / (1000 * 60 * 60);
  } catch (e) {
    console.error(`Error calculating timezone offset for ${timezone}:`, e);
    return 0;
  }
};

const convertTime = (time: string, fromTz: string, toTz: string): string => {
  // If either timezone is invalid, return original time
  if (!isValidTimezone(fromTz) || !isValidTimezone(toTz)) {
    return time;
  }
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const offset = getTimezoneOffset(toTz) - getTimezoneOffset(fromTz);
    let newHours = hours + offset;
    
    if (newHours < 0) newHours += 24;
    if (newHours >= 24) newHours -= 24;
    
    return `${String(Math.floor(newHours)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } catch (e) {
    console.error('Error converting time:', e);
    return time;
  }
};

export default function ProfileAvailability({ mentorId, mentorName, mentorTimezone = "UTC" }: ProfileAvailabilityProps) {
  const [loading, setLoading] = useState(true);
  const [recurringSlots, setRecurringSlots] = useState<AvailabilitySlot[]>([]);
  const [specificSlots, setSpecificSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [selectedView, setSelectedView] = useState<'week' | 'recurring'>('week');
  const [showUserTimezone, setShowUserTimezone] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  
  // Session Type Selector state
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<string>("all");
  
  // Request Custom Time state
  const [customTimeDialogOpen, setCustomTimeDialogOpen] = useState(false);
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedStartTime, setRequestedStartTime] = useState("");
  const [requestedEndTime, setRequestedEndTime] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  
  // Availability Alerts state
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertDaysPreference, setAlertDaysPreference] = useState<string[]>([]);
  const [submittingAlert, setSubmittingAlert] = useState(false);
  
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

      // Check if user has active alert subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: alertData } = await supabase
          .from("availability_alerts")
          .select("*")
          .eq("mentee_id", user.id)
          .eq("mentor_id", mentorId)
          .eq("is_active", true)
          .single();

        if (alertData) {
          setAlertsEnabled(true);
          setAlertEmail(alertData.email);
          setAlertDaysPreference(alertData.preferred_days || []);
        }
      }
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
      const dateStr = getLocalDateString(date); // Use local timezone helper
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

  // Handle custom time request submission
  const handleCustomTimeRequest = async () => {
    if (!requestedDate || !requestedStartTime || !requestedEndTime) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmittingRequest(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to request custom time");
        return;
      }

      // Create custom time request record
      const { error } = await supabase
        .from("booking_requests")
        .insert({
          mentee_id: user.id,
          mentor_id: mentorId,
          requested_date: requestedDate,
          requested_start_time: requestedStartTime,
          requested_end_time: requestedEndTime,
          message: requestMessage,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Time request sent successfully! The mentor will respond within 24 hours.");
      setCustomTimeDialogOpen(false);
      
      // Reset form
      setRequestedDate("");
      setRequestedStartTime("");
      setRequestedEndTime("");
      setRequestMessage("");
    } catch (error) {
      console.error("Error submitting time request:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Handle availability alert subscription
  const handleAlertSubscription = async () => {
    if (!alertEmail || alertDaysPreference.length === 0) {
      toast.error("Please provide email and select preferred days");
      return;
    }

    try {
      setSubmittingAlert(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to enable alerts");
        return;
      }

      // Create or update alert subscription
      const { error } = await supabase
        .from("availability_alerts")
        .upsert({
          mentee_id: user.id,
          mentor_id: mentorId,
          email: alertEmail,
          preferred_days: alertDaysPreference,
          is_active: true
        }, {
          onConflict: 'mentee_id,mentor_id'
        });

      if (error) throw error;

      setAlertsEnabled(true);
      toast.success("Availability alerts enabled! You'll be notified when new slots are added.");
      setAlertDialogOpen(false);
    } catch (error) {
      console.error("Error setting up alerts:", error);
      toast.error("Failed to enable alerts. Please try again.");
    } finally {
      setSubmittingAlert(false);
    }
  };

  // Toggle alert day preference
  const toggleAlertDay = (day: string) => {
    setAlertDaysPreference(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
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
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <Button
              variant={selectedView === 'week' ? 'default' : 'ghost'}
              onClick={() => setSelectedView('week')}
              size="sm"
              className={`rounded-lg transition-all ${
                selectedView === 'week' 
                  ? 'bg-white text-gray-900 shadow-sm hover:bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Week View
            </Button>
            <Button
              variant={selectedView === 'recurring' ? 'default' : 'ghost'}
              onClick={() => setSelectedView('recurring')}
              size="sm"
              className={`rounded-lg transition-all ${
                selectedView === 'recurring' 
                  ? 'bg-white text-gray-900 shadow-sm hover:bg-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Recurring Schedule
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomTimeDialogOpen(true)}
              className="border-2 border-matepeak-primary text-matepeak-primary hover:bg-matepeak-primary hover:text-white transition-all duration-200 font-semibold"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Custom Time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertDialogOpen(true)}
              className={`border-2 transition-all duration-200 font-semibold ${
                alertsEnabled
                  ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-600'
                  : 'border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500'
              }`}
            >
              <Bell className={`h-4 w-4 mr-2 ${alertsEnabled ? 'fill-green-600' : ''}`} />
              {alertsEnabled ? 'Alerts Active' : 'Get Notified'}
            </Button>
          </div>
        </div>
      )}

      {/* Week View */}
      {selectedView === 'week' && hasAnyAvailability && (
        <Card className="shadow-sm border border-gray-200 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
                  {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Click on any time slot to book</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateWeek('prev')} 
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToCurrentWeek} 
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-4"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateWeek('next')} 
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {weekSchedule.map((day) => (
                <div
                  key={day.dateStr}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    day.isToday
                      ? 'border-matepeak-primary bg-matepeak-yellow/5 shadow-sm'
                      : day.isBlocked
                      ? 'border-red-200 bg-red-50/50'
                      : day.slots.length > 0
                      ? 'border-green-200 bg-green-50/30 hover:border-green-300 hover:shadow-sm'
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div className="mb-3 pb-2.5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm">{day.dayName}</h3>
                      {day.isToday && (
                        <Badge className="bg-matepeak-primary text-white text-xs px-1.5 py-0">
                          Today
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  {day.isBlocked ? (
                    <div className="flex items-start gap-2 p-2.5 bg-red-100/50 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-red-900">Blocked</p>
                        {day.blockedReason && (
                          <p className="text-xs text-red-600 mt-0.5">{day.blockedReason}</p>
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
                            className={`group relative flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              hoveredSlot === slotKey
                                ? 'bg-matepeak-yellow/10 border-matepeak-primary shadow-md transform scale-[1.02]'
                                : 'bg-green-50/50 border-green-200 hover:bg-green-50 hover:border-green-300 hover:shadow-sm'
                            }`}
                            onMouseEnter={() => setHoveredSlot(slotKey)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            onClick={() => handleBookSlot(day.dateStr, slot.start, slot.end)}
                          >
                            <div className={`p-1.5 rounded-lg transition-colors ${
                              hoveredSlot === slotKey ? 'bg-matepeak-primary/10' : 'bg-gray-100'
                            }`}>
                              <Clock className={`h-3.5 w-3.5 transition-colors ${
                                hoveredSlot === slotKey ? 'text-matepeak-primary' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-grow">
                              <span className="text-xs font-semibold text-gray-900 block">
                                {formatTime(slot.start)} - {formatTime(slot.end)}
                              </span>
                              <span className="text-xs text-gray-500">{duration} min</span>
                            </div>
                            <Button
                              size="sm"
                              className={`opacity-0 group-hover:opacity-100 transition-all h-7 text-xs font-semibold ${
                                hoveredSlot === slotKey
                                  ? 'bg-matepeak-primary hover:bg-matepeak-secondary text-white'
                                  : 'bg-gray-900 hover:bg-gray-800 text-white'
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
                    <div className="flex items-center justify-center py-4">
                      <p className="text-xs text-gray-400">No availability</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Schedule View */}
      {selectedView === 'recurring' && recurringSlots.length > 0 && (
        <Card className="shadow-sm border border-gray-200 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-matepeak-yellow/10 rounded-xl">
                <Clock className="h-5 w-5 text-matepeak-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Weekly Recurring Schedule</h2>
                <p className="text-xs text-gray-500 mt-0.5">Regular availability that repeats every week</p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(groupedRecurring).map(([dayNum, slots]) => (
                <div
                  key={dayNum}
                  className="group p-4 bg-green-50/30 rounded-xl border-2 border-green-200 hover:border-green-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-gray-900 mb-2.5 text-sm">
                        {DAYS_OF_WEEK[parseInt(dayNum)]}s
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => {
                          const duration = calculateDuration(slot.start_time, slot.end_time);
                          return (
                            <div
                              key={slot.id}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-50/50 border-2 border-green-200 rounded-lg hover:bg-matepeak-yellow/10 hover:border-matepeak-primary transition-all duration-200 group/slot"
                            >
                              <div className="p-1 bg-white rounded-md group-hover/slot:bg-matepeak-yellow/20 transition-colors">
                                <Clock className="h-3 w-3 text-gray-600 group-hover/slot:text-matepeak-primary transition-colors" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-gray-900 block">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </span>
                                <span className="text-xs text-gray-500">{duration} min</span>
                              </div>
                            </div>
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

      {/* Custom Time Request Dialog */}
      <Dialog open={customTimeDialogOpen} onOpenChange={setCustomTimeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request Custom Time</DialogTitle>
            <DialogDescription>
              Don't see a suitable time? Request a custom session time and {mentorName} will get back to you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="request-date">Preferred Date</Label>
              <Input
                id="request-date"
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="request-start">Start Time</Label>
                <Input
                  id="request-start"
                  type="time"
                  value={requestedStartTime}
                  onChange={(e) => setRequestedStartTime(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-end">End Time</Label>
                <Input
                  id="request-end"
                  type="time"
                  value={requestedEndTime}
                  onChange={(e) => setRequestedEndTime(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-message">Message (Optional)</Label>
              <Textarea
                id="request-message"
                placeholder="Add any specific requirements or questions..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="border-gray-300 min-h-[100px]"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> The mentor will review your request and respond via email. You'll be notified once they confirm availability.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomTimeDialogOpen(false)}
              disabled={submittingRequest}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomTimeRequest}
              disabled={submittingRequest}
              className="bg-matepeak-primary hover:bg-matepeak-primary/90"
            >
              {submittingRequest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Alerts Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Get Availability Alerts</DialogTitle>
            <DialogDescription>
              Receive notifications when {mentorName} adds new availability slots that match your preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-email">Email Address</Label>
              <Input
                id="alert-email"
                type="email"
                placeholder="your.email@example.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Days (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant="outline"
                    onClick={() => toggleAlertDay(day)}
                    className={`justify-start transition-all ${
                      alertDaysPreference.includes(day)
                        ? 'bg-matepeak-primary text-white border-matepeak-primary hover:bg-matepeak-primary/90 hover:text-white'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className={`h-4 w-4 mr-2 ${
                      alertDaysPreference.includes(day) ? 'opacity-100' : 'opacity-0'
                    }`} />
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Bell className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm text-green-900">
                  <strong>You'll be notified when:</strong> New slots are added on your preferred days or existing slots become available.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertDialogOpen(false)}
              disabled={submittingAlert}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAlertSubscription}
              disabled={submittingAlert}
              className="bg-matepeak-primary hover:bg-matepeak-primary/90"
            >
              {submittingAlert ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Alerts
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
