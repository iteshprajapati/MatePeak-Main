/**
 * Video Meeting Service
 * Handles generation of video meeting links for different providers
 */

interface MeetingConfig {
  provider: "jitsi" | "zoom" | "google_meet";
  meetingId: string;
  meetingLink: string;
}

/**
 * Generate a unique meeting ID
 */
const generateMeetingId = (bookingId: string, mentorName: string): string => {
  const timestamp = Date.now();
  const sanitizedName = mentorName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const shortBookingId = bookingId.substring(0, 8);
  return `${sanitizedName}-${shortBookingId}-${timestamp}`;
};

/**
 * Generate Jitsi meeting link (Free, no API key required)
 * Jitsi Meet is completely free and open-source
 */
export const generateJitsiMeeting = (
  bookingId: string,
  mentorName: string,
  sessionType: string
): MeetingConfig => {
  const meetingId = generateMeetingId(bookingId, mentorName);
  const meetingLink = `https://meet.jit.si/${meetingId}`;

  return {
    provider: "jitsi",
    meetingId,
    meetingLink,
  };
};

/**
 * Generate meeting link based on provider
 * Currently supports Jitsi (free). Zoom and Google Meet can be added later.
 */
export const generateMeetingLink = (
  bookingId: string,
  mentorName: string,
  sessionType: string,
  provider: "jitsi" | "zoom" | "google_meet" = "jitsi"
): MeetingConfig => {
  switch (provider) {
    case "jitsi":
      return generateJitsiMeeting(bookingId, mentorName, sessionType);

    case "zoom":
      // TODO: Implement Zoom API integration
      throw new Error("Zoom integration not yet implemented");

    case "google_meet":
      // TODO: Implement Google Meet API integration
      throw new Error("Google Meet integration not yet implemented");

    default:
      return generateJitsiMeeting(bookingId, mentorName, sessionType);
  }
};

/**
 * Format meeting link for display
 */
export const formatMeetingLink = (link: string): string => {
  try {
    const url = new URL(link);
    return url.hostname + url.pathname;
  } catch {
    return link;
  }
};

/**
 * Get provider display name
 */
export const getProviderName = (provider: string): string => {
  const providers: Record<string, string> = {
    jitsi: "Jitsi Meet",
    zoom: "Zoom",
    google_meet: "Google Meet",
  };
  return providers[provider] || provider;
};

/**
 * Validate meeting link
 */
export const isValidMeetingLink = (link: string): boolean => {
  try {
    const url = new URL(link);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};
