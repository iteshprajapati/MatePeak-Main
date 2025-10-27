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
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Profile Description</h3>
          <p className="text-gray-600 text-sm">
            This info will go on your public profile. Write it professionally to attract students
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="introduction"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel className="text-base font-semibold">1. Introduce yourself</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share your teaching experience and passion for education</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormDescription className="text-sm text-gray-600 mb-2">
              Show potential students who you are! Share your teaching experience and passion for education, and briefly mention your interests and hobbies.
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="Hello, my name is... and I'm from..."
                className="min-h-[120px] transition-all hover:border-matepeak-primary focus:border-matepeak-primary resize-none"
                {...field}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage />
              <FormDescription className="text-xs text-right">
                {field.value?.length || 0} / 400
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          Don't include your last name or present your information in a CV format
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="teachingExperience"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel className="text-base font-semibold">2. Teaching experience</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Describe your teaching background and methodology</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormDescription className="text-sm text-gray-600 mb-2">
              Highlight your qualifications, certifications, and years of experience. Explain your teaching methodology and approach.
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="I have been teaching for... My approach focuses on..."
                className="min-h-[120px] transition-all hover:border-matepeak-primary focus:border-matepeak-primary resize-none"
                {...field}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage />
              <FormDescription className="text-xs text-right">
                {field.value?.length || 0} / 400
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="motivation"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel className="text-base font-semibold">3. Motivate potential students</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explain what students can achieve by working with you</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormDescription className="text-sm text-gray-600 mb-2">
              What can students expect from your sessions? How will you help them achieve their goals?
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="By working with me, you will..."
                className="min-h-[120px] transition-all hover:border-matepeak-primary focus:border-matepeak-primary resize-none"
                {...field}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage />
              <FormDescription className="text-xs text-right">
                {field.value?.length || 0} / 400
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="headline"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel className="text-base font-semibold">4. Write a catchy headline</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a compelling one-liner that stands out</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormDescription className="text-sm text-gray-600 mb-2">
              Create a short, memorable headline that captures your unique value (max 100 characters)
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="E.g., 'Expert mentor with 10+ years helping students achieve their goals'"
                className="min-h-[80px] transition-all hover:border-matepeak-primary focus:border-matepeak-primary resize-none"
                {...field}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage />
              <FormDescription className="text-xs text-right">
                {field.value?.length || 0} / 100
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
