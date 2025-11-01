import { supabase } from "@/integrations/supabase/client";

export interface CreateBookingData {
  expert_id: string;
  session_type: string;
  scheduled_date: string; // YYYY-MM-DD format
  scheduled_time: string; // HH:MM format
  duration: number; // minutes
  message?: string;
  total_amount: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  add_recording?: boolean;
}

export interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to book a session",
        data: null,
      };
    }

    // Create booking record
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        expert_id: data.expert_id,
        session_type: data.session_type,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        duration: data.duration,
        message: data.message,
        total_amount: data.total_amount,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Booking creation error:", error);
      return {
        success: false,
        error: error.message || "Failed to create booking",
        data: null,
      };
    }

    return {
      success: true,
      data: booking,
      message: "Booking created successfully",
    };
  } catch (error: any) {
    console.error("Booking service error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      data: null,
    };
  }
}

/**
 * Get mentor's availability slots for a specific date range
 */
export async function getMentorAvailability(
  mentorId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Fetch recurring availability
    const { data: recurringSlots, error: recurringError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("expert_id", mentorId)
      .eq("is_recurring", true);

    if (recurringError) throw recurringError;

    // Fetch specific date slots
    const { data: specificSlots, error: specificError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("expert_id", mentorId)
      .eq("is_recurring", false)
      .gte("specific_date", startDate)
      .lte("specific_date", endDate);

    if (specificError) throw specificError;

    // Fetch blocked dates
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("expert_id", mentorId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (blockedError) throw blockedError;

    return {
      success: true,
      data: {
        recurringSlots: recurringSlots || [],
        specificSlots: specificSlots || [],
        blockedDates: blockedDates || [],
      },
    };
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch availability",
      data: null,
    };
  }
}

/**
 * Get booked time slots for a mentor on a specific date
 */
export async function getBookedSlots(mentorId: string, date: string) {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("scheduled_time, duration")
      .eq("expert_id", mentorId)
      .eq("scheduled_date", date)
      .in("status", ["pending", "confirmed"]);

    if (error) throw error;

    return {
      success: true,
      data: bookings || [],
    };
  } catch (error: any) {
    console.error("Error fetching booked slots:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch booked slots",
      data: [],
    };
  }
}

/**
 * Generate available time slots for a specific date
 * Takes into account mentor's availability and existing bookings
 */
export async function getAvailableTimeSlots(
  mentorId: string,
  date: Date,
  duration: number = 60
): Promise<{ success: boolean; data: TimeSlot[]; error?: string }> {
  try {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    // Get mentor's availability
    const availabilityResult = await getMentorAvailability(
      mentorId,
      dateStr,
      dateStr
    );

    if (!availabilityResult.success || !availabilityResult.data) {
      return {
        success: false,
        data: [],
        error: "Failed to fetch availability",
      };
    }

    const { recurringSlots, specificSlots, blockedDates } =
      availabilityResult.data;

    // Check if date is blocked
    const isBlocked = blockedDates.some((blocked) => blocked.date === dateStr);
    if (isBlocked) {
      return {
        success: true,
        data: [],
      };
    }

    // Get booked slots
    const bookedResult = await getBookedSlots(mentorId, dateStr);
    const bookedSlots = bookedResult.data || [];

    // Find applicable availability slots
    const applicableSlots = [
      ...recurringSlots.filter((slot) => slot.day_of_week === dayOfWeek),
      ...specificSlots.filter((slot) => slot.specific_date === dateStr),
    ];

    if (applicableSlots.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Generate time slots
    const timeSlots: TimeSlot[] = [];
    const slotInterval = 30; // 30-minute intervals

    for (const slot of applicableSlots) {
      const startTime = parseTime(slot.start_time);
      const endTime = parseTime(slot.end_time);

      let currentTime = startTime;

      while (currentTime + duration <= endTime) {
        const timeStr = formatTime(currentTime);
        const isBooked = isTimeBooked(timeStr, duration, bookedSlots);

        timeSlots.push({
          time: timeStr,
          available: !isBooked,
          booked: isBooked,
        });

        currentTime += slotInterval;
      }
    }

    // Sort and remove duplicates
    const uniqueSlots = Array.from(
      new Map(timeSlots.map((slot) => [slot.time, slot])).values()
    ).sort((a, b) => a.time.localeCompare(b.time));

    return {
      success: true,
      data: uniqueSlots,
    };
  } catch (error: any) {
    console.error("Error generating time slots:", error);
    return {
      success: false,
      data: [],
      error: error.message || "Failed to generate time slots",
    };
  }
}

/**
 * Helper function to parse time string (HH:MM) to minutes
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper function to format minutes to time string (HH:MM)
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Check if a time slot conflicts with any booked slots
 */
function isTimeBooked(
  time: string,
  duration: number,
  bookedSlots: Array<{ scheduled_time: string; duration: number }>
): boolean {
  const slotStart = parseTime(time);
  const slotEnd = slotStart + duration;

  return bookedSlots.some((booked) => {
    const bookedStart = parseTime(booked.scheduled_time);
    const bookedEnd = bookedStart + booked.duration;

    // Check if there's any overlap
    return slotStart < bookedEnd && slotEnd > bookedStart;
  });
}

/**
 * Get user's bookings
 */
export async function getUserBookings() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        data: [],
      };
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        expert:expert_profiles(
          id,
          full_name,
          category,
          profile_picture_url,
          username
        )
      `
      )
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: false })
      .order("scheduled_time", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch bookings",
      data: [],
    };
  }
}

/**
 * Get mentor's bookings
 */
export async function getMentorBookings() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        data: [],
      };
    }

    // Get expert profile ID
    const { data: profile, error: profileError } = await supabase
      .from("expert_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "Mentor profile not found",
        data: [],
      };
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        student:profiles!bookings_user_id_fkey(
          full_name,
          email,
          avatar_url
        )
      `
      )
      .eq("expert_id", profile.id)
      .order("scheduled_date", { ascending: false })
      .order("scheduled_time", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error fetching mentor bookings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch bookings",
      data: [],
    };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        data: null,
      };
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: "Booking cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel booking",
      data: null,
    };
  }
}
