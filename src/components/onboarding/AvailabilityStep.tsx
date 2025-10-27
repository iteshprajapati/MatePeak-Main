import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Generate time slots in 15-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time24);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const TIMEZONES = [
  { value: "GMT-12:00", label: "(GMT-12:00) International Date Line West" },
  { value: "GMT-11:00", label: "(GMT-11:00) Midway Island, Samoa" },
  { value: "GMT-10:00", label: "(GMT-10:00) Hawaii" },
  { value: "GMT-09:00", label: "(GMT-09:00) Alaska" },
  { value: "GMT-08:00", label: "(GMT-08:00) Pacific Time (US & Canada)" },
  { value: "GMT-07:00", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  { value: "GMT-06:00", label: "(GMT-06:00) Central Time (US & Canada)" },
  { value: "GMT-05:00", label: "(GMT-05:00) Eastern Time (US & Canada)" },
  { value: "GMT-04:00", label: "(GMT-04:00) Atlantic Time (Canada)" },
  { value: "GMT-03:30", label: "(GMT-03:30) Newfoundland" },
  { value: "GMT-03:00", label: "(GMT-03:00) Brasilia, Buenos Aires" },
  { value: "GMT-02:00", label: "(GMT-02:00) Mid-Atlantic" },
  { value: "GMT-01:00", label: "(GMT-01:00) Azores, Cape Verde Islands" },
  { value: "GMT+00:00", label: "(GMT+00:00) London, Dublin, Lisbon" },
  { value: "GMT+01:00", label: "(GMT+01:00) Paris, Berlin, Rome" },
  { value: "GMT+02:00", label: "(GMT+02:00) Cairo, Athens, Istanbul" },
  { value: "GMT+03:00", label: "(GMT+03:00) Moscow, Kuwait, Riyadh" },
  { value: "GMT+03:30", label: "(GMT+03:30) Tehran" },
  { value: "GMT+04:00", label: "(GMT+04:00) Abu Dhabi, Muscat, Baku" },
  { value: "GMT+04:30", label: "(GMT+04:30) Kabul" },
  { value: "GMT+05:00", label: "(GMT+05:00) Islamabad, Karachi, Tashkent" },
  { value: "GMT+05:30", label: "(GMT+05:30) Mumbai, Kolkata, New Delhi" },
  { value: "GMT+05:45", label: "(GMT+05:45) Kathmandu" },
  { value: "GMT+06:00", label: "(GMT+06:00) Dhaka, Almaty" },
  { value: "GMT+06:30", label: "(GMT+06:30) Yangon, Cocos Islands" },
  { value: "GMT+07:00", label: "(GMT+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "GMT+08:00", label: "(GMT+08:00) Beijing, Singapore, Hong Kong" },
  { value: "GMT+09:00", label: "(GMT+09:00) Tokyo, Seoul" },
  { value: "GMT+09:30", label: "(GMT+09:30) Adelaide, Darwin" },
  { value: "GMT+10:00", label: "(GMT+10:00) Sydney, Melbourne, Brisbane" },
  { value: "GMT+11:00", label: "(GMT+11:00) Magadan, Solomon Islands" },
  { value: "GMT+12:00", label: "(GMT+12:00) Auckland, Wellington, Fiji" },
];

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  timeslots: TimeSlot[];
}

export default function AvailabilityStep({ form }: { form: UseFormReturn<any> }) {
  const [timeZone, setTimeZone] = useState("GMT+05:30");
  const [dayAvailability, setDayAvailability] = useState<DayAvailability[]>(
    DAYS.map(day => ({
      day,
      enabled: false,
      timeslots: [{ from: "09:00", to: "17:00" }]
    }))
  );

  // Get user's timezone on mount
  useEffect(() => {
    const now = new Date();
    const offset = -now.getTimezoneOffset() / 60;
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const minutes = (absOffset - hours) * 60;
    const gmtOffset = `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const matchedTz = TIMEZONES.find(tz => tz.value === gmtOffset);
    if (matchedTz) {
      setTimeZone(matchedTz.value);
    }
  }, []);

  // Update form value when availability changes
  useEffect(() => {
    const formattedAvailability = dayAvailability
      .filter(day => day.enabled && day.timeslots.length > 0)
      .flatMap(day => 
        day.timeslots.map(slot => ({
          day: day.day,
          from: slot.from,
          to: slot.to,
          timezone: timeZone
        }))
      );
    
    form.setValue("availability", formattedAvailability);
  }, [dayAvailability, timeZone, form]);

  const toggleDay = (dayIndex: number) => {
    setDayAvailability(prev => 
      prev.map((day, i) => 
        i === dayIndex ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const addTimeslot = (dayIndex: number) => {
    setDayAvailability(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, timeslots: [...day.timeslots, { from: "09:00", to: "17:00" }] }
          : day
      )
    );
  };

  const updateTimeslot = (dayIndex: number, slotIndex: number, field: 'from' | 'to', value: string) => {
    setDayAvailability(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              timeslots: day.timeslots.map((slot, j) =>
                j === slotIndex ? { ...slot, [field]: value } : slot
              )
            }
          : day
      )
    );
  };

  const removeTimeslot = (dayIndex: number, slotIndex: number) => {
    setDayAvailability(prev =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, timeslots: day.timeslots.filter((_, j) => j !== slotIndex) }
          : day
      )
    );
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Availability</h3>
      </div>

      {/* Timezone Selection */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900">Set your timezone</h4>
        <p className="text-sm text-gray-600">
          A correct timezone is essential to coordinate lessons with international students
        </p>
        
        <div className="space-y-2">
          <label htmlFor="timezone" className="text-sm font-medium text-gray-700">
            Choose your timezone
          </label>
          <Select value={timeZone} onValueChange={setTimeZone}>
            <SelectTrigger 
              id="timezone" 
              className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
            >
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="bg-background max-h-[300px]">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Availability Section */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1">Set your availability</h4>
          <p className="text-sm text-gray-600">
            Availability shows your potential working hours. Students can book lessons at these times.
          </p>
        </div>

        {/* Days List */}
        <div className="space-y-6">
          {dayAvailability.map((day, dayIndex) => (
            <div key={day.day} className="space-y-3">
              {/* Day Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${dayIndex}`}
                  checked={day.enabled}
                  onCheckedChange={() => toggleDay(dayIndex)}
                  className="h-5 w-5 border-gray-300"
                />
                <label
                  htmlFor={`day-${dayIndex}`}
                  className="text-base font-medium text-gray-900 cursor-pointer select-none"
                >
                  {day.day}
                </label>
              </div>

              {/* Timeslots - Only show when day is enabled */}
              {day.enabled && (
                <div className="ml-7 space-y-3">
                  {day.timeslots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">From</label>
                          <Select
                            value={slot.from}
                            onValueChange={(value) => updateTimeslot(dayIndex, slotIndex, 'from', value)}
                          >
                            <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background max-h-[200px]">
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={`from-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">To</label>
                          <Select
                            value={slot.to}
                            onValueChange={(value) => updateTimeslot(dayIndex, slotIndex, 'to', value)}
                          >
                            <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background max-h-[200px]">
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={`to-${time}`} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Remove timeslot button - only show if there's more than one */}
                      {day.timeslots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeslot(dayIndex, slotIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        >
                          Remove timeslot
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add another timeslot button */}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => addTimeslot(dayIndex)}
                    className="text-gray-900 underline h-auto p-0 font-normal"
                  >
                    Add another timeslot
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
