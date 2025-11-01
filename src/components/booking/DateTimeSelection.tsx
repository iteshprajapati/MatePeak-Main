import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { SelectedService, SelectedDateTime } from "./BookingDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableTimeSlots, TimeSlot } from "@/services/bookingService";

interface DateTimeSelectionProps {
  selectedService: SelectedService;
  mentorId: string;
  timezone: string;
  onDateTimeSelect: (dateTime: SelectedDateTime) => void;
}

export default function DateTimeSelection({
  selectedService,
  mentorId,
  timezone,
  onDateTimeSelect,
}: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);
  const [weekStart, setWeekStart] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasAutoSelectedDate, setHasAutoSelectedDate] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState<Set<string>>(new Set());

  // Generate 7 days starting from today
  const visibleDates = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );

  // Check which dates have available slots
  useEffect(() => {
    checkDatesAvailability();
  }, [weekStart, mentorId, selectedService.duration]);

  const checkDatesAvailability = async () => {
    const datesWithAvailability = new Set<string>();

    for (const date of visibleDates) {
      const result = await getAvailableTimeSlots(
        mentorId,
        date,
        selectedService.duration
      );

      if (result.success && result.data.some((slot) => slot.available)) {
        datesWithAvailability.add(date.toISOString().split("T")[0]);
      }
    }

    setDatesWithSlots(datesWithAvailability);
  };

  // Auto-select the closest date with available slots
  useEffect(() => {
    if (!hasAutoSelectedDate) {
      autoSelectClosestAvailableDate();
    }
  }, [weekStart, hasAutoSelectedDate]);

  const autoSelectClosestAvailableDate = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      // Check next 14 days
      const checkDate = addDays(today, i);
      const result = await getAvailableTimeSlots(
        mentorId,
        checkDate,
        selectedService.duration
      );

      if (result.success && result.data.some((slot) => slot.available)) {
        // Found a date with available slots
        setSelectedDate(checkDate);
        setHasAutoSelectedDate(true);

        // Adjust week view if needed
        const daysDiff = Math.floor(
          (checkDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff >= 7) {
          setWeekStart(checkDate);
        }
        break;
      }
    }
  };

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate, mentorId, selectedService.duration]);

  const fetchTimeSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    setSelectedTime(null); // Reset selected time

    try {
      const result = await getAvailableTimeSlots(
        mentorId,
        selectedDate,
        selectedService.duration
      );

      if (result.success) {
        setTimeSlots(result.data);
      } else {
        console.error("Failed to fetch time slots:", result.error);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onDateTimeSelect({
        date: selectedDate,
        time: selectedTime,
        timezone: selectedTimezone,
      });
    }
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Group time slots by time of day
  const groupTimeSlots = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots
      .filter((slot) => slot.available)
      .forEach((slot) => {
        const hour = parseInt(slot.time.split(":")[0]);
        if (hour < 12) {
          morning.push(slot);
        } else if (hour < 17) {
          afternoon.push(slot);
        } else {
          evening.push(slot);
        }
      });

    return { morning, afternoon, evening };
  };

  const formatTimeRange = (time: string, duration: number) => {
    const [hours, minutes] = time.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    return `${time} - ${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1.5">
          Select Date & Time
        </h3>
        <p className="text-sm text-gray-600">
          Choose your preferred date and time slot
        </p>
      </div>

      {/* Service Summary */}
      <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm">
        {/* Service Info */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-base">
              {selectedService.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {selectedService.duration > 0 &&
                `${selectedService.duration} mins • `}
              Video Call
            </p>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              ₹{selectedService.price.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          When should we meet?
        </h3>

        <div className="flex items-center gap-3">
          {/* Week navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevWeek}
            className="h-9 w-9 p-0 hover:bg-white rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2 overflow-x-auto flex-1 pb-2 scrollbar-hide">
            {visibleDates.map((date, index) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isPast = isDatePast(date);
              const isToday = isSameDay(date, new Date());
              const dateStr = date.toISOString().split("T")[0];
              const hasAvailableSlots = datesWithSlots.has(dateStr);

              return (
                <button
                  key={index}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[75px] p-3.5 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : isPast
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : hasAvailableSlots
                      ? "border-green-400 bg-white hover:border-green-500 hover:shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300",
                    isToday &&
                      !isSelected &&
                      !hasAvailableSlots &&
                      "border-gray-400"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isSelected ? "text-gray-200" : "text-gray-600"
                    )}
                  >
                    {format(date, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold mt-1.5",
                      isSelected ? "text-white" : "text-gray-900"
                    )}
                  >
                    {format(date, "d MMM")}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="h-9 w-9 p-0 hover:bg-white rounded-xl"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm animate-fade-in">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Select time slot ({selectedService.duration} min session)
          </h3>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : timeSlots.filter((slot) => slot.available).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-0 shadow-sm">
              <p className="text-gray-600 font-medium">
                No available slots for this date
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Please select another date
              </p>
            </div>
          ) : (
            (() => {
              const { morning, afternoon, evening } = groupTimeSlots(timeSlots);
              return (
                <div className="space-y-5">
                  {morning.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-yellow-500">☀️</span> Morning
                        (Before 12 PM)
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {morning.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                                isSelected
                                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-400 text-gray-700 hover:shadow-sm"
                              )}
                            >
                              <div className="font-bold">{slot.time}</div>
                              <div
                                className={cn(
                                  "text-xs mt-0.5",
                                  isSelected ? "text-gray-300" : "text-gray-500"
                                )}
                              >
                                {formatTimeRange(
                                  slot.time,
                                  selectedService.duration
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {afternoon.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-orange-500">☀️</span> Afternoon
                        (12 PM - 5 PM)
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {afternoon.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                                isSelected
                                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-400 text-gray-700 hover:shadow-sm"
                              )}
                            >
                              <div className="font-bold">{slot.time}</div>
                              <div
                                className={cn(
                                  "text-xs mt-0.5",
                                  isSelected ? "text-gray-300" : "text-gray-500"
                                )}
                              >
                                {formatTimeRange(
                                  slot.time,
                                  selectedService.duration
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {evening.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-500">🌙</span> Evening (After
                        5 PM)
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {evening.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                "px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                                isSelected
                                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-400 text-gray-700 hover:shadow-sm"
                              )}
                            >
                              <div className="font-bold">{slot.time}</div>
                              <div
                                className={cn(
                                  "text-xs mt-0.5",
                                  isSelected ? "text-gray-300" : "text-gray-500"
                                )}
                              >
                                {formatTimeRange(
                                  slot.time,
                                  selectedService.duration
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Timezone Selection */}
      {selectedDate && selectedTime && (
        <div className="bg-gray-100 rounded-2xl p-5 border-0 shadow-sm animate-fade-in">
          <h3 className="text-base font-bold text-gray-900 mb-4">Timezone</h3>
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger className="w-full h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">
                (GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi
              </SelectItem>
              <SelectItem value="America/New_York">
                (GMT-5:00) Eastern Time (US & Canada)
              </SelectItem>
              <SelectItem value="America/Los_Angeles">
                (GMT-8:00) Pacific Time (US & Canada)
              </SelectItem>
              <SelectItem value="Europe/London">(GMT+0:00) London</SelectItem>
              <SelectItem value="Asia/Dubai">(GMT+4:00) Dubai</SelectItem>
              <SelectItem value="Asia/Singapore">
                (GMT+8:00) Singapore
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Continue Button */}
      {selectedDate && selectedTime && (
        <Button
          onClick={handleContinue}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-semibold rounded-xl shadow-sm animate-fade-in"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
