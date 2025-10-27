
import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BookingFormProps {
  mentorId: string;
  mentorName: string;
  onSubmit: (data: BookingData) => void;
}

interface BookingData {
  date: Date | undefined;
  time: string;
  duration: number;
  topic: string;
  notes: string;
  contactInfo: string;
}

const BookingForm = ({ mentorId, mentorName, onSubmit }: BookingFormProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      time,
      duration,
      topic,
      notes,
      contactInfo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-mentor-light/30 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-800">Booking a Session with {mentorName}</h3>
        <p className="text-sm text-gray-600 mt-1">Complete the form below to request a mentoring session</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Select Date</Label>
            <div className="mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="time">Select Time</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={time === slot ? "default" : "outline"}
                  className={cn(
                    "text-xs h-9",
                    time === slot
                      ? "bg-mentor-primary hover:bg-mentor-secondary"
                      : "hover:bg-mentor-light hover:text-mentor-primary"
                  )}
                  onClick={() => setTime(slot)}
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {slot}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Session Duration</Label>
            <RadioGroup
              value={duration.toString()}
              onValueChange={(val) => setDuration(parseInt(val))}
              className="flex space-x-2 mt-1"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="30" id="duration-30" />
                <Label htmlFor="duration-30" className="text-sm">30 min</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="60" id="duration-60" />
                <Label htmlFor="duration-60" className="text-sm">60 min</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="90" id="duration-90" />
                <Label htmlFor="duration-90" className="text-sm">90 min</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">What would you like to discuss?</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1"
              placeholder="E.g., Resume review, Career advice, Subject tutoring"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 h-24"
              placeholder="Share any specific questions or information that would help your mentor prepare"
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Input
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="mt-1"
              placeholder="Email or phone number"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 flex justify-end">
        <Button
          type="submit"
          className="bg-mentor-primary hover:bg-mentor-secondary text-white px-8"
        >
          Request Session
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
