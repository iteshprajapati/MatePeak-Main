import { UseFormReturn } from "react-hook-form";
import { DollarSign, HelpCircle, Coins, Gift, MessageSquare, ShoppingBag, FileText, Video } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PricingStep({ form }: { form: UseFormReturn<any> }) {
  const oneOnOneSession = form.watch("oneOnOneSession");
  const chatAdvice = form.watch("chatAdvice");
  const digitalProducts = form.watch("digitalProducts");
  const notes = form.watch("notes");

  const serviceIcons = {
    oneOnOneSession: Video,
    chatAdvice: MessageSquare,
    digitalProducts: ShoppingBag,
    notes: FileText,
  };

  const serviceLabels = {
    oneOnOneSession: "1-on-1 Video Sessions",
    chatAdvice: "Chat Advice",
    digitalProducts: "Digital Products",
    notes: "Notes & Resources",
  };

  const serviceDescriptions = {
    oneOnOneSession: "Live video mentoring sessions",
    chatAdvice: "Text-based Q&A and guidance",
    digitalProducts: "Courses, ebooks, templates, etc.",
    notes: "Study materials and resources",
  };

  const hasAnyService = oneOnOneSession || chatAdvice || digitalProducts || notes;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <Coins className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Service Pricing</h3>
          <p className="text-gray-600 text-sm">Set your pricing for each service you offer</p>
        </div>
      </div>

      {!hasAnyService && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-amber-800 text-sm">
              ⚠️ You haven't selected any services yet. Please go back to the Services step and select at least one service.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {/* 1-on-1 Sessions */}
        {oneOnOneSession && (
          <Card className="border-2 border-matepeak-primary/20 hover:border-matepeak-primary/40 transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
                  {serviceIcons.oneOnOneSession && <serviceIcons.oneOnOneSession className="w-5 h-5 text-matepeak-primary" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{serviceLabels.oneOnOneSession}</CardTitle>
                  <CardDescription>{serviceDescriptions.oneOnOneSession}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="servicePricing.oneOnOneSession.enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div>
                      <FormLabel className="text-base font-medium">Offer as paid service</FormLabel>
                      <FormDescription>Toggle on to charge for this service</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("servicePricing.oneOnOneSession.price", 0);
                          }
                        }}
                        className="data-[state=checked]:bg-matepeak-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("servicePricing.oneOnOneSession.enabled") && (
                <div className="space-y-4 animate-fade-in">
                  <FormField
                    control={form.control}
                    name="servicePricing.oneOnOneSession.price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-matepeak-primary" />
                          Price per session (INR)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-matepeak-primary">
                              ₹
                            </span>
                            <Input
                              type="number"
                              placeholder="1000"
                              className="pl-10 text-lg"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Recommended: ₹500 - ₹5000 per session
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="servicePricing.oneOnOneSession.hasFreeDemo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-green-50 border-green-200">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2 font-medium">
                            <Gift className="w-4 h-4 text-green-600" />
                            Offer free demo session
                          </FormLabel>
                          <FormDescription>
                            Attract more students by offering a complimentary 15-minute trial session
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Advice */}
        {chatAdvice && (
          <Card className="border-2 border-matepeak-primary/20 hover:border-matepeak-primary/40 transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
                  {serviceIcons.chatAdvice && <serviceIcons.chatAdvice className="w-5 h-5 text-matepeak-primary" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{serviceLabels.chatAdvice}</CardTitle>
                  <CardDescription>{serviceDescriptions.chatAdvice}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="servicePricing.chatAdvice.enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div>
                      <FormLabel className="text-base font-medium">Offer as paid service</FormLabel>
                      <FormDescription>Toggle on to charge for this service</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("servicePricing.chatAdvice.price", 0);
                          }
                        }}
                        className="data-[state=checked]:bg-matepeak-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("servicePricing.chatAdvice.enabled") && (
                <div className="space-y-4 animate-fade-in">
                  <FormField
                    control={form.control}
                    name="servicePricing.chatAdvice.price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-matepeak-primary" />
                          Price per session (INR)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-matepeak-primary">
                              ₹
                            </span>
                            <Input
                              type="number"
                              placeholder="500"
                              className="pl-10 text-lg"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Recommended: ₹200 - ₹2000 per chat session
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="servicePricing.chatAdvice.hasFreeDemo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-green-50 border-green-200">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2 font-medium">
                            <Gift className="w-4 h-4 text-green-600" />
                            Offer free trial chat
                          </FormLabel>
                          <FormDescription>
                            Allow students to send a few free messages before purchasing
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Digital Products */}
        {digitalProducts && (
          <Card className="border-2 border-matepeak-primary/20 hover:border-matepeak-primary/40 transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
                  {serviceIcons.digitalProducts && <serviceIcons.digitalProducts className="w-5 h-5 text-matepeak-primary" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{serviceLabels.digitalProducts}</CardTitle>
                  <CardDescription>{serviceDescriptions.digitalProducts}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="servicePricing.digitalProducts.enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div>
                      <FormLabel className="text-base font-medium">Offer as paid service</FormLabel>
                      <FormDescription>Toggle on to charge for this service</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("servicePricing.digitalProducts.price", 0);
                          }
                        }}
                        className="data-[state=checked]:bg-matepeak-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("servicePricing.digitalProducts.enabled") && (
                <FormField
                  control={form.control}
                  name="servicePricing.digitalProducts.price"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-matepeak-primary" />
                        Starting price (INR)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-matepeak-primary">
                            ₹
                          </span>
                          <Input
                            type="number"
                            placeholder="999"
                            className="pl-10 text-lg"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Base price for your digital products (courses, ebooks, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {notes && (
          <Card className="border-2 border-matepeak-primary/20 hover:border-matepeak-primary/40 transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
                  {serviceIcons.notes && <serviceIcons.notes className="w-5 h-5 text-matepeak-primary" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{serviceLabels.notes}</CardTitle>
                  <CardDescription>{serviceDescriptions.notes}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="servicePricing.notes.enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div>
                      <FormLabel className="text-base font-medium">Offer as paid service</FormLabel>
                      <FormDescription>Toggle on to charge for this service</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("servicePricing.notes.price", 0);
                          }
                        }}
                        className="data-[state=checked]:bg-matepeak-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("servicePricing.notes.enabled") && (
                <FormField
                  control={form.control}
                  name="servicePricing.notes.price"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-matepeak-primary" />
                        Price per resource pack (INR)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-matepeak-primary">
                            ₹
                          </span>
                          <Input
                            type="number"
                            placeholder="299"
                            className="pl-10 text-lg"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Price for study materials and resource packs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
