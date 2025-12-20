import {
  Video,
  MessageSquare,
  ShoppingBag,
  FileText,
  Clock,
  Gift,
  Star,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SelectedService } from "./BookingDialog";
import { useState } from "react";

interface ServiceSelectionProps {
  services: any;
  servicePricing: any;
  suggestedServices?: any[]; // Add this prop
  onServiceSelect: (service: SelectedService) => void;
  averageRating?: number;
  totalReviews?: number;
}

const serviceConfig = {
  oneOnOneSession: {
    icon: Video,
    name: "1-on-1 Career Strategy Call",
    shortName: "1-on-1 Career Strategy Call",
    description: "Discuss your goals, blockers & next moves",
    benefits: ["30 min live call", "Personalized action plan after call"],
    durations: [30, 60, 90],
    typeLabel: "Video Meeting",
  },
  chatAdvice: {
    icon: MessageSquare,
    name: "Career Clarity – Ask Anything",
    shortName: "Career Clarity",
    description: "Get clear direction on your next career step",
    benefits: ["24-hour expert responses", "Actionable next steps"],
    durations: [],
    typeLabel: "Text Chat",
  },
  digitalProducts: {
    icon: ShoppingBag,
    name: "Resume & LinkedIn Starter Pack",
    shortName: "Resource Bundle",
    description: "Proven templates + expert guidance",
    benefits: [
      "Resume templates",
      "LinkedIn checklist",
      "Short guidance video",
    ],
    durations: [],
    typeLabel: "Digital Download",
  },
  notes: {
    icon: FileText,
    name: "Session Notes & Resources",
    shortName: "Notes & Resources",
    description: "Study materials and guides",
    benefits: [],
    durations: [],
    typeLabel: "Study Materials",
  },
};

export default function ServiceSelection({
  services,
  servicePricing,
  suggestedServices = [],
  onServiceSelect,
  averageRating = 0,
  totalReviews = 0,
}: ServiceSelectionProps) {
  const [selectedDurations, setSelectedDurations] = useState<
    Record<string, number>
  >({});
  const [freeDemoEnabled, setFreeDemoEnabled] = useState<
    Record<string, boolean>
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

    const isFreeDemo = freeDemoEnabled[serviceKey] && pricing.hasFreeDemo;

    onServiceSelect({
      type: serviceKey,
      name: config.shortName,
      duration,
      price: isFreeDemo ? 0 : pricing.price || 0,
      hasFreeDemo: pricing.hasFreeDemo,
    });
  };

  const handleDurationSelect = (serviceKey: string, duration: number) => {
    setSelectedDurations((prev) => ({
      ...prev,
      [serviceKey]: duration,
    }));
  };

  const toggleFreeDemo = (serviceKey: string, enabled: boolean) => {
    setFreeDemoEnabled((prev) => ({
      ...prev,
      [serviceKey]: enabled,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1.5">
          What do you want help with?
        </h3>
        <p className="text-sm text-gray-600">
          Pick an outcome. Delivery is handled by the expert.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableServices.map((serviceKey) => {
          const config = serviceConfig[serviceKey];
          const pricing = servicePricing?.[serviceKey];
          const Icon = config.icon;
          const selectedDuration =
            selectedDurations[serviceKey] || config.durations[0] || 0;
          const isFreeDemo =
            freeDemoEnabled[serviceKey] && pricing?.hasFreeDemo;

          if (!pricing?.enabled) return null;

          return (
            <Card
              key={serviceKey}
              className="group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200"
            >
              <div className="p-5 space-y-4">
                {/* Header with Icon & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base leading-tight">
                        {config.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        {totalReviews > 0 ? (
                          <>
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold text-gray-900 text-xs">
                              {averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({totalReviews})
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            No rating yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {pricing.hasFreeDemo && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs font-semibold px-2.5 py-1">
                      Free Demo
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {config.description}
                </p>

                {/* Benefits */}
                {config.benefits && config.benefits.length > 0 && (
                  <div className="space-y-2">
                    {config.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-base">
                          {benefit.startsWith("24-hour")
                            ? "🕒"
                            : benefit.startsWith("Personalized") ||
                              benefit.startsWith("Actionable")
                            ? "📌"
                            : benefit.startsWith("Resume")
                            ? "📁"
                            : benefit.startsWith("LinkedIn")
                            ? "📄"
                            : benefit.startsWith("Short") ||
                              benefit.startsWith("guidance")
                            ? "🎥"
                            : benefit.includes("min")
                            ? "🕒"
                            : "✓"}
                        </span>
                        <span className="font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Free Demo Toggle - Only show if service has free demo */}
                {pricing.hasFreeDemo && (
                  <div
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex-1">
                      <Label
                        htmlFor={`free-demo-${serviceKey}`}
                        className="text-sm font-semibold text-green-800 cursor-pointer"
                      >
                        🎁 Try Free Demo
                      </Label>
                      <p className="text-xs text-green-700 mt-0.5">
                        {isFreeDemo &&
                          "Session duration may vary for free sessions"}
                      </p>
                    </div>
                    <Switch
                      id={`free-demo-${serviceKey}`}
                      checked={isFreeDemo}
                      onCheckedChange={(checked) =>
                        toggleFreeDemo(serviceKey, checked)
                      }
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                )}

                {/* Duration & Type Info */}
                <div className="bg-white rounded-xl p-3.5 space-y-3 shadow-sm">
                  {/* Duration Selection (for 1:1 sessions) */}
                  {config.durations.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 flex-shrink-0 text-gray-600" />
                      <div className="flex gap-2 flex-1">
                        {config.durations.map((duration) => (
                          <button
                            key={duration}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDurationSelect(serviceKey, duration);
                            }}
                            className={cn(
                              "flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                              selectedDuration === duration
                                ? "bg-gray-900 text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {duration} mins
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Type Indicator */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-gray-600" />
                    <span className="font-medium">{config.typeLabel}</span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between pt-2">
                  {/* Price display */}
                  <div className="flex items-baseline gap-2">
                    {isFreeDemo ? (
                      <>
                        <span className="text-xl font-bold text-gray-400 line-through decoration-2">
                          ₹{pricing.price?.toLocaleString("en-IN") || 0}
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          FREE
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{pricing.price?.toLocaleString("en-IN") || 0}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(serviceKey);
                    }}
                    className={cn(
                      "font-semibold transition-all rounded-xl",
                      isFreeDemo
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    )}
                    size="sm"
                  >
                    {isFreeDemo ? "Try Free" : "Select"}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Custom Services from suggested_services */}
        {suggestedServices && suggestedServices.length > 0 && (
          <>
            {suggestedServices
              .filter((service: any) => service.enabled)
              .map((customService: any, index: number) => {
                const customKey = `custom_${customService.id || index}`;
                return (
                  <Card
                    key={customKey}
                    className="group bg-gray-100 border-0 rounded-2xl shadow-none hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Star className="w-6 h-6 text-matepeak-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-base leading-tight">
                              {customService.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              Custom Service
                            </span>
                          </div>
                        </div>
                        {customService.hasFreeDemo && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs font-semibold px-2.5 py-1">
                            Free Demo
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {customService.description}
                      </p>

                      {/* Price & Select Button */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">Price</span>
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{customService.price?.toLocaleString("en-IN") || 0}
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            onServiceSelect({
                              type: "oneOnOneSession",
                              name: customService.name,
                              duration: 60,
                              price: customService.price,
                              hasFreeDemo: customService.hasFreeDemo || false,
                            });
                          }}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-all group-hover:shadow-md"
                        >
                          Select Service
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </>
        )}
      </div>

      {availableServices.length === 0 &&
        (!suggestedServices || suggestedServices.length === 0) && (
          <div className="text-center py-8 bg-gray-100 rounded-2xl border-0">
            <p className="text-gray-500 text-sm font-medium">
              No services available at the moment
            </p>
          </div>
        )}
    </div>
  );
}
