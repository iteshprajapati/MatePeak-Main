/**
 * Centralized service type utilities and constants
 * Eliminates duplicate service configuration across components
 */
import { Video, MessageSquare, ShoppingBag, FileText } from "lucide-react";

export type ServiceType =
  | "oneOnOneSession"
  | "chatAdvice"
  | "digitalProducts"
  | "notes";

export interface ServiceConfig {
  icon: any;
  name: string;
  shortName: string;
  description: string;
  durations: number[];
  typeLabel: string;
  requiresDateTime: boolean;
}

export const SERVICE_CONFIG: Record<ServiceType, ServiceConfig> = {
  oneOnOneSession: {
    icon: Video,
    name: "Strategic Advisory Session",
    shortName: "1-on-1 Video Session",
    description: "Live video mentoring session",
    durations: [30, 60, 90],
    typeLabel: "Video Meeting",
    requiresDateTime: true,
  },
  chatAdvice: {
    icon: MessageSquare,
    name: "Chat Consultation",
    shortName: "Chat Advice",
    description: "Text-based Q&A and guidance",
    durations: [],
    typeLabel: "Text Chat",
    requiresDateTime: false,
  },
  digitalProducts: {
    icon: ShoppingBag,
    name: "Digital Products",
    shortName: "Digital Products",
    description: "Courses, ebooks, templates",
    durations: [],
    typeLabel: "Digital Download",
    requiresDateTime: false,
  },
  notes: {
    icon: FileText,
    name: "Session Notes & Resources",
    shortName: "Notes & Resources",
    description: "Study materials and guides",
    durations: [],
    typeLabel: "Study Materials",
    requiresDateTime: false,
  },
};

/**
 * Check if a service type requires date/time selection
 */
export function serviceRequiresDateTime(serviceType: ServiceType): boolean {
  return SERVICE_CONFIG[serviceType]?.requiresDateTime ?? false;
}

/**
 * Get available service types from services object
 */
export function getAvailableServices(
  services: Record<string, boolean>
): ServiceType[] {
  return Object.entries(services || {})
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key as ServiceType);
}

/**
 * Get service list with pricing for display
 */
export function getServicesList(
  servicePricing: Record<
    string,
    { enabled: boolean; price: number; hasFreeDemo?: boolean }
  >
) {
  const services = [];

  for (const [key, config] of Object.entries(SERVICE_CONFIG)) {
    const pricing = servicePricing?.[key];
    if (pricing?.enabled) {
      services.push({
        type: key as ServiceType,
        name: config.name,
        price: pricing.price,
        hasFreeDemo: pricing.hasFreeDemo,
        icon: config.icon,
      });
    }
  }

  return services;
}

/**
 * Get the lowest price from enabled services
 */
export function getLowestServicePrice(
  servicePricing: Record<string, { enabled: boolean; price?: number }>
): number {
  const prices: number[] = [];

  Object.values(servicePricing || {}).forEach((service: any) => {
    if (service?.enabled && service?.price) {
      prices.push(service.price);
    }
  });

  return prices.length > 0 ? Math.min(...prices) : 0;
}

/**
 * Get connection options from services
 */
export function getConnectionOptions(
  services: Record<string, boolean>
): string[] {
  const options: string[] = [];

  if (services?.oneOnOneSession) options.push("1:1 Call");
  if (services?.chatAdvice) options.push("Chat");
  if (services?.digitalProducts) options.push("Document Review");
  if (services?.notes) options.push("Group Session");

  return options;
}

/**
 * Format service duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get service icon component
 */
export function getServiceIcon(serviceType: ServiceType) {
  return SERVICE_CONFIG[serviceType]?.icon || Video;
}
