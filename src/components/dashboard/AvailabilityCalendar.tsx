import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Loader2,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM format
  end_time: string;
  is_recurring: boolean;
  specific_date?: string; // YYYY-MM-DD format
}

interface AvailabilityCalendarProps {
  mentorProfile: any;
}

const AvailabilityCalendar = ({ mentorProfile }: AvailabilityCalendarProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newSlots, setNewSlots] = useState<Partial<AvailabilitySlot>[]>([
    {
      start_time: "09:00",
      end_time: "10:00",
      is_recurring: false,
    },
  ]);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // Helper to get date string in local timezone (avoids UTC conversion)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchAvailability();
  }, [mentorProfile]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // Fetch availability slots
      const { data: slots, error: slotsError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("expert_id", mentorProfile.id);

      if (slotsError) throw slotsError;

      // Fetch blocked dates
      const { data: blocked, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("date")
        .eq("expert_id", mentorProfile.id);

      if (blockedError) throw blockedError;

      setAvailabilitySlots(slots || []);
      setBlockedDates(blocked?.map((b) => b.date) || []);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDate) return;
    if (!mentorProfile?.id) {
      toast({
        title: "Error",
        description: "Mentor profile not found",
        variant: "destructive",
      });
      return;
    }

    // Prevent selecting a date in the past
    const now = new Date();
    const selectedIsToday =
      getLocalDateString(selectedDate) === getLocalDateString(now);
    const selectedIsPast =
      selectedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (selectedIsPast) {
      toast({
        title: "Invalid Date",
        description: "Cannot set availability for a past date.",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < newSlots.length; i++) {
      const newSlot = newSlots[i];
      if (!newSlot.start_time || !newSlot.end_time) {
        toast({
          title: "Missing Time",
          description: `Please set both start and end time for slot ${i + 1}`,
          variant: "destructive",
        });
        return;
      }

      // Prevent backward time (end before start)
      if (newSlot.start_time >= newSlot.end_time) {
        toast({
          title: "Invalid Time Range",
          description: `End time must be after start time for slot ${i + 1}`,
          variant: "destructive",
        });
        return;
      }

      // Prevent selecting a time in the past for today
      if (selectedIsToday) {
        const [nowH, nowM] = [now.getHours(), now.getMinutes()];
        const nowMinutes = nowH * 60 + nowM;
        const [startH, startM] = newSlot.start_time.split(":").map(Number);
        const [endH, endM] = newSlot.end_time.split(":").map(Number);
        const slotStartMinutes = startH * 60 + startM;
        const slotEndMinutes = endH * 60 + endM;
        if (slotEndMinutes <= nowMinutes) {
          toast({
            title: "Invalid Time",
            description: `Slot ${
              i + 1
            } ends in the past. Please select a future time.`,
            variant: "destructive",
          });
          return;
        }
        if (slotStartMinutes < nowMinutes) {
          toast({
            title: "Invalid Time",
            description: `Slot ${
              i + 1
            } starts in the past. Please select a future time.`,
            variant: "destructive",
          });
          return;
        }
      }

      // Check for very short slots (less than 15 minutes)
      const [startHours, startMins] = newSlot.start_time.split(":").map(Number);
      const [endHours, endMins] = newSlot.end_time.split(":").map(Number);
      const durationMinutes =
        endHours * 60 + endMins - (startHours * 60 + startMins);
      if (durationMinutes < 15) {
        toast({
          title: "Slot Too Short",
          description: `Slot ${
            i + 1
          } is less than 15 minutes. Please increase the duration.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Check for overlapping slots between new slots
    for (let i = 0; i < newSlots.length; i++) {
      for (let j = i + 1; j < newSlots.length; j++) {
        const slot1 = newSlots[i];
        const slot2 = newSlots[j];

        if (
          slot1.start_time &&
          slot1.end_time &&
          slot2.start_time &&
          slot2.end_time
        ) {
          const overlap =
            (slot1.start_time >= slot2.start_time &&
              slot1.start_time < slot2.end_time) ||
            (slot1.end_time > slot2.start_time &&
              slot1.end_time <= slot2.end_time) ||
            (slot1.start_time <= slot2.start_time &&
              slot1.end_time >= slot2.end_time);

          if (overlap) {
            toast({
              title: "Overlapping Time Slots",
              description: `Slot ${i + 1} and slot ${
                j + 1
              } overlap with each other`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    // Check for overlapping with existing slots
    const dayOfWeek = selectedDate.getDay();
    const specificDate = newSlots[0].is_recurring
      ? null
      : getLocalDateString(selectedDate); // Use local timezone helper

    const relevantSlots = availabilitySlots.filter((slot) => {
      if (newSlots[0].is_recurring) {
        return slot.is_recurring && slot.day_of_week === dayOfWeek;
      } else {
        return (
          slot.specific_date === specificDate ||
          (slot.is_recurring && slot.day_of_week === dayOfWeek)
        );
      }
    });

    for (let i = 0; i < newSlots.length; i++) {
      const newSlot = newSlots[i];
      const overlappingSlot = relevantSlots.find((slot) => {
        const newStart = newSlot.start_time!;
        const newEnd = newSlot.end_time!;
        const existingStart = slot.start_time;
        const existingEnd = slot.end_time;

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (overlappingSlot) {
        toast({
          title: "Overlapping Time Slot",
          description: `Slot ${i + 1} (${newSlot.start_time} - ${
            newSlot.end_time
          }) overlaps with existing slot (${overlappingSlot.start_time} - ${
            overlappingSlot.end_time
          })`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setSaving(true);

      const slotsToInsert = newSlots.map((slot) => ({
        expert_id: mentorProfile.id,
        day_of_week: dayOfWeek,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_recurring: slot.is_recurring,
        specific_date: specificDate,
      }));

      const { error } = await supabase
        .from("availability_slots")
        .insert(slotsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${newSlots.length} slot${
          newSlots.length > 1 ? "s" : ""
        } added successfully`,
      });

      // Close dialog and reset new slots after successful addition
      console.log("About to close dialog");
      setDialogOpen(false);
      setNewSlots([
        {
          start_time: "09:00",
          end_time: "10:00",
          is_recurring: false,
        },
      ]);
      fetchAvailability();
      console.log("Dialog should be closed now");
    } catch (error: any) {
      console.error("Error adding slot:", error);
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewSlotField = () => {
    // Find the latest end time from both existing slots and new slots
    let suggestedStartTime = "09:00";

    // Check existing slots for the selected date
    if (selectedDate) {
      const availability = getAvailabilityForDate(selectedDate);
      const allEndTimes = [
        ...availability.slots.map((slot) => slot.end_time),
        ...newSlots
          .filter((slot) => slot.end_time)
          .map((slot) => slot.end_time!),
      ];

      if (allEndTimes.length > 0) {
        // Find the latest end time and sort properly
        const sortedEndTimes = allEndTimes.sort((a, b) => {
          const [aHours, aMinutes] = a.split(":").map(Number);
          const [bHours, bMinutes] = b.split(":").map(Number);
          return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
        });
        const latestEndTime = sortedEndTimes[sortedEndTimes.length - 1];
        if (latestEndTime) {
          suggestedStartTime = latestEndTime;
        }
      }
    }

    // If only new slots exist, use the last new slot's end time
    if (newSlots.length > 0 && !selectedDate) {
      const lastSlot = newSlots[newSlots.length - 1];
      if (lastSlot.end_time) {
        suggestedStartTime = lastSlot.end_time;
      }
    }

    // Calculate suggested end time (30 minutes after start time)
    const [hours, minutes] = suggestedStartTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 30;

    // Handle edge case: don't go past 23:30 (so end time doesn't exceed 24:00)
    if (totalMinutes >= 24 * 60) {
      // If we're already at or past 23:30, suggest a shorter slot
      const maxStartMinutes = 23 * 60 + 30; // 23:30
      const currentStartMinutes = hours * 60 + minutes;

      if (currentStartMinutes >= maxStartMinutes) {
        // Set to last 30 minutes of the day
        setNewSlots([
          ...newSlots,
          {
            start_time: "23:30",
            end_time: "23:59",
            is_recurring: newSlots[0].is_recurring,
          },
        ]);
        return;
      } else {
        // Set end time to 23:59
        setNewSlots([
          ...newSlots,
          {
            start_time: suggestedStartTime,
            end_time: "23:59",
            is_recurring: newSlots[0].is_recurring,
          },
        ]);
        return;
      }
    }

    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    const suggestedEndTime = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;

    setNewSlots([
      ...newSlots,
      {
        start_time: suggestedStartTime,
        end_time: suggestedEndTime,
        is_recurring: newSlots[0].is_recurring, // Use same recurring setting
      },
    ]);
  };

  const handleRemoveSlotField = (index: number) => {
    if (newSlots.length > 1) {
      setNewSlots(newSlots.filter((_, i) => i !== index));
    }
  };

  const handleUpdateSlotField = (
    index: number,
    field: keyof AvailabilitySlot,
    value: any
  ) => {
    const updated = [...newSlots];
    updated[index] = { ...updated[index], [field]: value };
    setNewSlots(updated);
  };

  const handleBlockDate = async (date: Date) => {
    const dateStr = getLocalDateString(date); // Use local timezone helper

    try {
      if (blockedDates.includes(dateStr)) {
        // Unblock date
        const { error } = await supabase
          .from("blocked_dates")
          .delete()
          .eq("expert_id", mentorProfile.id)
          .eq("date", dateStr);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Date unblocked",
        });
      } else {
        // Block date
        const { error } = await supabase.from("blocked_dates").insert([
          {
            expert_id: mentorProfile.id,
            date: dateStr,
            reason: "Blocked by mentor",
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Date blocked",
        });
      }

      fetchAvailability();
    } catch (error: any) {
      console.error("Error toggling block:", error);
      toast({
        title: "Error",
        description: "Failed to update blocked date",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from("availability_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability slot removed",
      });

      fetchAvailability();
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive",
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getAvailabilityForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = getLocalDateString(date); // Use local timezone helper

    // Check if date is blocked
    if (blockedDates.includes(dateStr)) {
      return { blocked: true, slots: [] };
    }

    // Get recurring slots for this day of week
    const recurringSlots = availabilitySlots.filter(
      (slot) => slot.is_recurring && slot.day_of_week === dayOfWeek
    );

    // Get specific slots for this exact date
    const specificSlots = availabilitySlots.filter(
      (slot) => !slot.is_recurring && slot.specific_date === dateStr
    );

    return {
      blocked: false,
      slots: [...recurringSlots, ...specificSlots],
    };
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Availability Calendar
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your availability and block dates
          </p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Your timezone</p>
        </div>
      </div>

      {/* Empty State */}
      {!loading &&
        availabilitySlots.length === 0 &&
        blockedDates.length === 0 && (
          <Card className="border-gray-200 bg-gradient-to-br from-rose-50 to-orange-50">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm">
                <CalendarIcon className="h-8 w-8 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Availability Set Yet
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                Set your available time slots so students can book sessions with
                you. Click any date on the calendar below to get started.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Tip: Use recurring slots for weekly schedules</span>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Calendar Header */}
      <Card className="border-gray-200 max-w-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="border-gray-300 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-base font-semibold text-gray-900">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="border-gray-300 h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-700 py-1.5"
              >
                {day.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {loading
              ? // Loading skeleton
                Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="aspect-square border border-gray-200 rounded-2xl bg-gray-50 animate-pulse"
                  />
                ))
              : days.map((date, index) => {
                  if (!date) {
                    return (
                      <div key={`empty-${index}`} className="aspect-square" />
                    );
                  }

                  const availability = getAvailabilityForDate(date);
                  const today = isToday(date);

                  return (
                    <div
                      key={date.toISOString()}
                      className={`aspect-square border rounded-2xl p-1 transition-all cursor-pointer hover:shadow-sm ${
                        today
                          ? "border-2 border-gray-900 bg-gray-50"
                          : availability.blocked
                          ? "border border-red-300 bg-red-50"
                          : availability.slots.length > 0
                          ? "border border-green-300 bg-green-50"
                          : "border border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => {
                        setSelectedDate(date);
                        // Reset slots when opening dialog
                        setNewSlots([
                          {
                            start_time: "09:00",
                            end_time: "10:00",
                            is_recurring: false,
                          },
                        ]);
                        setDialogOpen(true);
                      }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-xs font-semibold text-gray-900">
                          {date.getDate()}
                        </div>
                        {availability.blocked ? (
                          <div className="w-1 h-1 bg-red-500 rounded-full mt-0.5" />
                        ) : availability.slots.length > 0 ? (
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-gray-900 bg-gray-50 rounded" />
              <span className="text-xs text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-green-200 bg-green-50 rounded" />
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-red-200 bg-red-50 rounded" />
              <span className="text-xs text-gray-600">Blocked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Slot Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          // Only allow closing if open is false and user clicked the close button
          if (!open) setDialogOpen(false);
        }}
      >
        <DialogContent
          className="w-full max-w-3xl max-h-[90vh] flex flex-col"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              Manage Availability -{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Existing Slots */}
            {selectedDate &&
              (() => {
                const availability = getAvailabilityForDate(selectedDate);
                return (
                  <>
                    {availability.slots.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Current Availability
                        </h4>
                        {availability.slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-900">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              {slot.is_recurring && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-green-200 text-green-700"
                                >
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSlot(slot.id!)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Block/Unblock Date */}
                    <Button
                      variant="outline"
                      onClick={() => handleBlockDate(selectedDate)}
                      className={`w-full ${
                        availability.blocked
                          ? "border-green-300 text-green-700 hover:bg-green-50"
                          : "border-red-300 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {availability.blocked
                        ? "Unblock This Date"
                        : "Block This Date"}
                    </Button>
                  </>
                );
              })()}

            {/* Add New Slot */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Add New Slots
                </h4>
                {newSlots.length > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    New slots will be suggested based on previous slot times
                  </p>
                )}
              </div>

              {/* Multiple Slot Fields in Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="space-y-3 p-4 bg-gray-50 rounded-lg relative"
                  >
                    {newSlots.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSlotField(index)}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {newSlots.length > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-medium text-gray-600">
                          Slot {index + 1}
                        </div>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                    )}
                    {/* Start Time */}
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select
                        value={slot.start_time}
                        onValueChange={(value) =>
                          handleUpdateSlotField(index, "start_time", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {timeSlots
                            .filter((time) => {
                              // If today, only allow future times
                              if (
                                selectedDate &&
                                getLocalDateString(selectedDate) ===
                                  getLocalDateString(new Date())
                              ) {
                                const [h, m] = time.split(":").map(Number);
                                const now = new Date();
                                const nowMinutes =
                                  now.getHours() * 60 + now.getMinutes();
                                const slotMinutes = h * 60 + m;
                                return slotMinutes >= nowMinutes;
                              }
                              return true;
                            })
                            .map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* End Time */}
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select
                        value={slot.end_time}
                        onValueChange={(value) =>
                          handleUpdateSlotField(index, "end_time", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {timeSlots
                            .filter((time) => {
                              // Only allow end times after start time
                              if (slot.start_time && time > slot.start_time) {
                                // If today, only allow future times
                                if (
                                  selectedDate &&
                                  getLocalDateString(selectedDate) ===
                                    getLocalDateString(new Date())
                                ) {
                                  const [h, m] = time.split(":").map(Number);
                                  const now = new Date();
                                  const nowMinutes =
                                    now.getHours() * 60 + now.getMinutes();
                                  const slotMinutes = h * 60 + m;
                                  return slotMinutes > nowMinutes;
                                }
                                return true;
                              }
                              return false;
                            })
                            .map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {slot.start_time &&
                        slot.end_time &&
                        slot.start_time >= slot.end_time && (
                          <p className="text-xs text-red-600">
                            End time must be after start time
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Button */}
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddNewSlotField}
                  className="h-8 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Another Slot
                </Button>
              </div>

              {/* Recurring - Applies to all slots */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">
                    Repeat weekly on this day
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Applies to all slots above
                  </p>
                </div>
                <Switch
                  checked={newSlots[0].is_recurring}
                  onCheckedChange={(checked) => {
                    setNewSlots(
                      newSlots.map((slot) => ({
                        ...slot,
                        is_recurring: checked,
                      }))
                    );
                  }}
                />
              </div>

              {/* Add Button */}
              <Button
                onClick={() => {
                  console.log("Main Add Slots button clicked");
                  handleAddSlot();
                }}
                disabled={saving}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add {newSlots.length} Slot{newSlots.length > 1 ? "s" : ""}
                    {(() => {
                      // Calculate total duration for display
                      const totalMinutes = newSlots.reduce((total, slot) => {
                        if (slot.start_time && slot.end_time) {
                          const [startHours, startMins] = slot.start_time
                            .split(":")
                            .map(Number);
                          const [endHours, endMins] = slot.end_time
                            .split(":")
                            .map(Number);
                          return (
                            total +
                            (endHours * 60 +
                              endMins -
                              (startHours * 60 + startMins))
                          );
                        }
                        return total;
                      }, 0);

                      if (totalMinutes > 0) {
                        const hours = Math.floor(totalMinutes / 60);
                        const mins = totalMinutes % 60;
                        let durationText = "";
                        if (hours > 0) durationText += `${hours}h `;
                        if (mins > 0) durationText += `${mins}m`;
                        return durationText ? ` (${durationText.trim()})` : "";
                      }
                      return "";
                    })()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailabilityCalendar;
