
import { UseFormReturn } from "react-hook-form";
import { DollarSign, HelpCircle, Coins } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PricingStep({ form }: { form: UseFormReturn<any> }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <Coins className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Session Pricing</h3>
          <p className="text-gray-600 text-sm">Set your pricing for mentoring sessions</p>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="isPaid"
        render={({ field }) => (
          <FormItem className="group">
            <div className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-5 transition-all hover:border-matepeak-primary/50 hover:shadow-sm">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">Paid Sessions</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle on to charge for sessions, off for free mentoring</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormDescription>
                  Toggle on to offer paid sessions, off for free sessions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-matepeak-primary"
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
      
      {form.watch("isPaid") && (
        <div className="animate-fade-in">
          <FormField
            control={form.control}
            name="pricePerSession"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-matepeak-primary" />
                    Price per session (INR)
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set a competitive price based on your expertise</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-matepeak-primary">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="1000"
                      className="pl-10 text-lg transition-all hover:border-matepeak-primary focus:border-matepeak-primary"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Recommended: ₹500 - ₹5000 per session based on expertise
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
