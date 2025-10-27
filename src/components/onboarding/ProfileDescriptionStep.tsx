import { UseFormReturn } from "react-hook-form";
import { FileText, HelpCircle, Info } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileDescriptionStep({ form }: { form: UseFormReturn<any> }) {
  const errors = form.formState.errors;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-matepeak-primary to-matepeak-secondary flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Profile Description</h3>
          <p className="text-gray-600 text-sm mt-1">
            Write professionally to attract and inspire potential students
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="introduction"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-matepeak-primary/10 text-matepeak-primary font-bold text-sm">
                    1
                  </div>
                  <FormLabel className="text-base font-semibold text-gray-900">
                    Introduce yourself <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Share your teaching experience and passion for education</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <FormDescription className="text-sm text-gray-600 leading-relaxed">
                Show potential students who you are! Share your teaching experience, passion for education, interests, and hobbies.
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Hello, my name is... and I'm from..."
                  className="min-h-[120px] transition-all resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <FormDescription className="text-xs text-gray-500">
                  {field.value?.length || 0} / 400
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="border-t border-gray-200"></div>

        <FormField
          control={form.control}
          name="teachingExperience"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-matepeak-primary/10 text-matepeak-primary font-bold text-sm">
                    2
                  </div>
                  <FormLabel className="text-base font-semibold text-gray-900">
                    Teaching experience <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Describe your teaching background and methodology</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <FormDescription className="text-sm text-gray-600 leading-relaxed">
                Highlight your qualifications, certifications, and years of experience. Explain your teaching methodology and approach.
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="I have been teaching for... My approach focuses on..."
                  className="min-h-[120px] transition-all resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <FormDescription className="text-xs text-gray-500">
                  {field.value?.length || 0} / 400
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="border-t border-gray-200"></div>

        <FormField
          control={form.control}
          name="motivation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-matepeak-primary/10 text-matepeak-primary font-bold text-sm">
                    3
                  </div>
                  <FormLabel className="text-base font-semibold text-gray-900">
                    Motivate potential students <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Explain what students can achieve by working with you</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <FormDescription className="text-sm text-gray-600 leading-relaxed">
                What can students expect from your sessions? How will you help them achieve their goals?
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="By working with me, you will..."
                  className="min-h-[120px] transition-all resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <FormDescription className="text-xs text-gray-500">
                  {field.value?.length || 0} / 400
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="border-t border-gray-200"></div>

        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-matepeak-primary/10 text-matepeak-primary font-bold text-sm">
                    4
                  </div>
                  <FormLabel className="text-base font-semibold text-gray-900">
                    Write a catchy headline <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Create a compelling one-liner that stands out</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <FormDescription className="text-sm text-gray-600 leading-relaxed">
                Create a short, memorable headline that captures your unique value (max 100 characters)
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="E.g., 'Expert mentor with 10+ years helping students achieve their goals'"
                  className="min-h-[80px] transition-all resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <FormDescription className="text-xs text-gray-500">
                  {field.value?.length || 0} / 100
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
