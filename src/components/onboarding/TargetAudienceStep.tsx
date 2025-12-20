import { UseFormReturn } from "react-hook-form";
import { Users, GraduationCap, Briefcase, Rocket, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormControl } from "@/components/ui/form";

const audiences = [
  {
    name: "students",
    icon: GraduationCap,
    label: "Students",
    description: "College students exploring career options",
  },
  {
    name: "freshers",
    icon: Users,
    label: "Freshers",
    description: "Recent graduates starting their careers",
  },
  {
    name: "professionals",
    icon: Briefcase,
    label: "Working Professionals",
    description: "Experienced professionals seeking growth",
  },
  {
    name: "founders",
    icon: Rocket,
    label: "Founders",
    description: "Entrepreneurs building businesses",
  },
];

export default function TargetAudienceStep({
  form,
}: {
  form: UseFormReturn<any>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-matepeak-primary to-matepeak-secondary flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Who do you help?
            </h3>
          </div>
        </div>
        <p className="text-gray-600 text-sm pl-13">
          Select the people you're most experienced helping. You can choose
          multiple.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {audiences.map((audience) => {
          const Icon = audience.icon;
          return (
            <FormField
              key={audience.name}
              control={form.control}
              name={`targetAudience.${audience.name}`}
              render={({ field }) => (
                <FormItem className="group">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={() => {}}
                      className="sr-only"
                    />
                  </FormControl>
                  <div
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 cursor-pointer hover:shadow-sm",
                      field.value
                        ? "border-gray-700 bg-gray-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                    onClick={() => field.onChange(!field.value)}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                        field.value ? "bg-gray-900" : "bg-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 transition-colors",
                          field.value ? "text-white" : "text-gray-600"
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-semibold cursor-pointer transition-colors leading-tight",
                          field.value ? "text-gray-900" : "text-gray-700"
                        )}
                      >
                        {audience.label}
                      </div>
                      <p className="text-xs text-gray-500 leading-snug">
                        {audience.description}
                      </p>
                    </div>

                    {/* Checkbox - Right */}
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-200",
                          field.value
                            ? "bg-gray-900 border-gray-900"
                            : "border-gray-300 bg-white"
                        )}
                      >
                        {field.value && (
                          <Check
                            className="h-2.5 w-2.5 text-white animate-scale-in"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
