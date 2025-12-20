import { UseFormReturn } from "react-hook-form";
import { HelpCircle, FileX, Frown, Map, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormControl } from "@/components/ui/form";

const problems = [
  {
    name: "careerConfusion",
    icon: HelpCircle,
    label: "Career Confusion",
    description: "Not sure which path to take",
  },
  {
    name: "resumeRejection",
    icon: FileX,
    label: "Resume Rejection",
    description: "Getting no callbacks or interviews",
  },
  {
    name: "interviewFear",
    icon: Frown,
    label: "Interview Fear",
    description: "Struggling with interview preparation",
  },
  {
    name: "skillRoadmap",
    icon: Map,
    label: "Skill Roadmap",
    description: "Need guidance on what to learn",
  },
  {
    name: "personalBranding",
    icon: Sparkles,
    label: "Personal Branding",
    description: "Building online presence & LinkedIn",
  },
];

export default function ProblemsStep({ form }: { form: UseFormReturn<any> }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-matepeak-primary to-matepeak-secondary flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              What problems do people come to you with?
            </h3>
          </div>
        </div>
        <p className="text-gray-600 text-sm pl-13">
          Select all the challenges you can help solve. This helps us suggest
          the right services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {problems.map((problem) => {
          const Icon = problem.icon;
          return (
            <FormField
              key={problem.name}
              control={form.control}
              name={`problemsHelped.${problem.name}`}
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
                        {problem.label}
                      </div>
                      <p className="text-xs text-gray-500 leading-snug">
                        {problem.description}
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
