import { UseFormReturn } from "react-hook-form";
import { GraduationCap, Plus, Trash2, HelpCircle, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEGREE_TYPES = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
  "Professional Degree",
  "Certificate",
  "Other"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

export default function EducationStep({ form }: { form: UseFormReturn<any> }) {
  const education = form.watch("education") || [];
  
  const addEducation = () => {
    const currentEducation = form.getValues("education") || [];
    form.setValue("education", [
      ...currentEducation,
      {
        degree: "",
        university: "",
        subject: "",
        yearFrom: "",
        yearTo: "",
        currentlyStudying: false,
      }
    ]);
  };
  
  const removeEducation = (index: number) => {
    const currentEducation = form.getValues("education");
    form.setValue("education", currentEducation.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Education</h3>
          <p className="text-gray-600 text-sm">
            Share your educational background to build credibility with students
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FormLabel className="text-base font-semibold">Your Education History</FormLabel>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Add your degrees, certifications, and relevant education</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEducation}
          className="h-9 text-sm bg-matepeak-primary/5 border-matepeak-primary/20 hover:bg-matepeak-primary/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      {education.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No education entries yet</p>
          <Button
            type="button"
            variant="outline"
            onClick={addEducation}
            className="bg-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Education Entry
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {education.map((_: any, index: number) => (
          <div
            key={index}
            className="p-6 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-matepeak-primary" />
                Education #{index + 1}
              </h4>
              {education.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(index)}
                  className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree / Certification</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">
                          <SelectValue placeholder="Select degree type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white z-50 max-h-60">
                        {DEGREE_TYPES.map((degree) => (
                          <SelectItem key={degree} value={degree}>
                            {degree}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`education.${index}.university`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University / Institution</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Harvard University"
                        {...field}
                        className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`education.${index}.subject`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject / Field of Study</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Computer Science"
                        {...field}
                        className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`education.${index}.yearFrom`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-matepeak-primary" />
                        Start Year
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white z-50 max-h-60">
                          {YEARS.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`education.${index}.yearTo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-matepeak-primary" />
                        End Year
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={form.watch(`education.${index}.currentlyStudying`)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all disabled:opacity-50">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white z-50 max-h-60">
                          {YEARS.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`education.${index}.currentlyStudying`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue(`education.${index}.yearTo`, "");
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        I am currently studying here
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Check this if you're still pursuing this degree
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {education.length > 0 && (
        <FormDescription className="text-sm text-gray-600 text-center">
          You can add multiple education entries to showcase your qualifications
        </FormDescription>
      )}
    </div>
  );
}
