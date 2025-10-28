import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import BasicInfoStep from "@/components/onboarding/BasicInfoStep";
import TeachingCertificationStep from "@/components/onboarding/TeachingCertificationStep";
import EducationStep from "@/components/onboarding/EducationStep";
import ProfileDescriptionStep from "@/components/onboarding/ProfileDescriptionStep";
import ServiceTypesStep from "@/components/onboarding/ServiceTypesStep";
import AvailabilityStep from "@/components/onboarding/AvailabilityStep";
import PricingStep from "@/components/onboarding/PricingStep";
import ProfileSetupStep from "@/components/onboarding/ProfileSetupStep";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepNavigation from "@/components/onboarding/StepNavigation";
import { useExpertOnboardingForm } from "@/hooks/useExpertOnboardingForm";
import { updateExpertProfile } from "@/services/expertProfileService";

export default function ExpertOnboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const form = useExpertOnboardingForm();
  
  const totalSteps = 8;
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const result = await updateExpertProfile(data);
      toast.success("Profile created successfully!");
      
      // Redirect to the mentor's unique dashboard using their username
      navigate(`/dashboard/${data.username}`);
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast.error(error.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleNext = async () => {
    let isValid = false;
    
    try {
      switch (step) {
        case 1:
          isValid = await form.trigger(['firstName', 'lastName', 'email', 'username', 'category', 'countryOfBirth', 'languages', 'ageConfirmation']);
          
          if (!isValid) {
            // Find the first error field and scroll to it
            const errors = form.formState.errors;
            const errorFields = ['firstName', 'lastName', 'email', 'username', 'category', 'countryOfBirth', 'languages', 'ageConfirmation'];
            
            for (const field of errorFields) {
              if (errors[field]) {
                // Scroll to the first error field
                setTimeout(() => {
                  const errorElement = document.querySelector(`[name="${field}"]`) || 
                                      document.querySelector(`[data-field="${field}"]`);
                  if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a shake animation to the error element's parent
                    const formItem = errorElement.closest('.space-y-2, [class*="FormItem"]');
                    if (formItem) {
                      formItem.classList.add('animate-shake');
                      setTimeout(() => formItem.classList.remove('animate-shake'), 500);
                    }
                  }
                }, 100);
                
                // Show a helpful toast message
                if (field === 'languages') {
                  toast.error("Please add at least one language you speak");
                } else if (field === 'category') {
                  toast.error("Please select your area of expertise");
                } else if (field === 'ageConfirmation') {
                  toast.error("Please confirm you are over 18 years old");
                } else {
                  toast.error(`Please fill in the required field: ${field.replace(/([A-Z])/g, ' $1').trim()}`);
                }
                break;
              }
            }
          }
          break;
        case 2:
          // Teaching Certification - validate only if not skipped
          const hasNoCertificate = form.getValues('hasNoCertificate');
          if (hasNoCertificate) {
            isValid = true;
          } else {
            const certs = form.getValues('teachingCertifications');
            if (!certs || certs.length === 0) {
              toast.error("Please add at least one certificate or check 'I don't have a teaching certificate'");
              isValid = false;
            } else {
              isValid = await form.trigger(['teachingCertifications']);
            }
          }
          break;
        case 3:
          isValid = await form.trigger(['education']);
          if (!isValid) {
            toast.error("Please add at least one education entry");
          }
          break;
        case 4:
          isValid = await form.trigger(['introduction', 'teachingExperience', 'motivation', 'headline']);
          if (!isValid) {
            const errors = form.formState.errors;
            if (errors.introduction) toast.error("Please provide an introduction");
            else if (errors.teachingExperience) toast.error("Please describe your teaching experience");
            else if (errors.motivation) toast.error("Please share your motivation");
            else if (errors.headline) toast.error("Please add a headline");
          }
          break;
        case 5:
          isValid = true; // All fields are optional here
          break;
        case 6:
          isValid = true; // Availability is optional
          break;
        case 7:
          // Pricing validation - check if any service has pricing enabled
          const servicePricing = form.getValues('servicePricing');
          isValid = true; // Pricing is optional, mentors can offer free services
          break;
        case 8:
          isValid = await form.trigger(['socialLinks']);
          
          if (isValid) {
            await form.handleSubmit(onSubmit)();
            return;
          }
          break;
      }
      
      if (isValid) {
        setStep(prev => Math.min(prev + 1, totalSteps));
        // Scroll to top of the form smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Validation error:", err);
      toast.error("Please check all required fields");
    }
  };
  
  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep form={form} />;
      case 2:
        return <TeachingCertificationStep form={form} />;
      case 3:
        return <EducationStep form={form} />;
      case 4:
        return <ProfileDescriptionStep form={form} />;
      case 5:
        return <ServiceTypesStep form={form} />;
      case 6:
        return <AvailabilityStep form={form} />;
      case 7:
        return <PricingStep form={form} />;
      case 8:
        return <ProfileSetupStep form={form} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-matepeak-primary/10 py-8 md:py-16 flex flex-col items-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-matepeak-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-matepeak-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-4xl">
        <OnboardingHeader />
        
        <Card className="w-full shadow-2xl bg-white/95 backdrop-blur-xl border-0 overflow-hidden transition-all duration-500 hover:shadow-3xl">
          {/* Gradient top border */}
          <div className="h-1.5 bg-gradient-to-r from-matepeak-primary via-matepeak-secondary to-orange-500"></div>
          
          <CardContent className="p-6 md:p-10 lg:p-12">
            <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
            
            {/* Enhanced progress bar with shimmer effect */}
            <div className="mt-8 mb-8">
              <div className="relative h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute inset-0 h-full bg-gradient-to-r from-matepeak-primary via-matepeak-secondary to-orange-500 transition-all duration-700 ease-out rounded-full shadow-lg"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
            
            <TooltipProvider>
              <Form {...form}>
                <form className="space-y-8">
                  <div className="animate-fade-in">
                    {renderStep()}
                  </div>
                  
                  <StepNavigation
                    currentStep={step}
                    totalSteps={totalSteps}
                    onBack={handleBack}
                    onNext={handleNext}
                    isSubmitting={isSubmitting}
                  />
                </form>
              </Form>
            </TooltipProvider>
          </CardContent>
        </Card>
        
        {/* Security badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Secure & Encrypted</span>
          <span className="text-gray-400">•</span>
          <span>Your data is protected with industry-standard encryption</span>
        </div>
      </div>
    </div>
  );
}
