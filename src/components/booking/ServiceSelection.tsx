import {
  Video,
  MessageSquare,
  ShoppingBag,
  FileText,
  Clock,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SelectedService } from "./BookingDialog";
import { useState } from "react";

interface ServiceSelectionProps {
  services: any;
  servicePricing: any;
  onServiceSelect: (service: SelectedService) => void;
}

const serviceConfig = {
  oneOnOneSession: {
    icon: Video,
    name: "1-on-1 Video Session",
    description: "Live video mentoring session",
    durations: [30, 60, 90],
  },
  chatAdvice: {
    icon: MessageSquare,
    name: "Chat Advice",
    description: "Text-based Q&A and guidance",
    durations: [],
  },
  digitalProducts: {
    icon: ShoppingBag,
    name: "Digital Products",
    description: "Courses, ebooks, templates",
    durations: [],
  },
  notes: {
    icon: FileText,
    name: "Notes & Resources",
    description: "Study materials and guides",
    durations: [],
  },
};

export default function ServiceSelection({
  services,
  servicePricing,
  onServiceSelect,
}: ServiceSelectionProps) {
  const [selectedDurations, setSelectedDurations] = useState<
    Record<string, number>
  >({});

  const availableServices = Object.entries(services || {})
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key as keyof typeof serviceConfig);

  const handleSelect = (serviceKey: keyof typeof serviceConfig) => {
    const config = serviceConfig[serviceKey];
    const pricing = servicePricing?.[serviceKey];

    if (!pricing?.enabled) return;

    const duration =
      serviceKey === "oneOnOneSession"
        ? selectedDurations[serviceKey] || 30
        : 0;

    onServiceSelect({
      type: serviceKey,
      name: config.name,
      duration,
      price: pricing.price || 0,
      hasFreeDemo: pricing.hasFreeDemo,
    });
  };

  const handleDurationSelect = (serviceKey: string, duration: number) => {
    setSelectedDurations((prev) => ({
      ...prev,
      [serviceKey]: duration,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Service
        </h3>
        <p className="text-sm text-gray-600">
          Select the service that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableServices.map((serviceKey) => {
          const config = serviceConfig[serviceKey];
          const pricing = servicePricing?.[serviceKey];
          const Icon = config.icon;
          const selectedDuration =
            selectedDurations[serviceKey] || config.durations[0] || 0;

          if (!pricing?.enabled) return null;

          return (
            <Card
              key={serviceKey}
              className="p-5 hover:shadow-md transition-all duration-200 border-2 hover:border-gray-300"
            >
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base mb-1">
                      {config.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Duration Selection (for 1:1 sessions) */}
                {config.durations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration
                    </label>
                    <div className="flex gap-2">
                      {config.durations.map((duration) => (
                        <button
                          key={duration}
                          onClick={() =>
                            handleDurationSelect(serviceKey, duration)
                          }
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            selectedDuration === duration
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {duration} min
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{pricing.price?.toLocaleString("en-IN") || 0}
                    </div>
                    {pricing.hasFreeDemo && (
                      <Badge className="mt-1 bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                        <Gift className="w-3 h-3 mr-1" />
                        Free Demo
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSelect(serviceKey)}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    Select →
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {availableServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services available at the moment</p>
        </div>
      )}
    </div>
  );
}
