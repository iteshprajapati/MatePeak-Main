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
      
      // Redirect to the mentor's profile page
      if (result.username) {
        navigate(`/mentor/${result.username}`);
      } else {
        navigate("/expert/dashboard");
      }
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
          break;
        case 4:
          isValid = await form.trigger(['introduction', 'teachingExperience', 'motivation', 'headline']);
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
      }
    } catch (err) {
      console.error("Validation error:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-matepeak-primary/5 py-12 flex flex-col items-center px-4">
      <OnboardingHeader />
      
      <Card className="w-full max-w-3xl shadow-2xl bg-white border-t-4 border-matepeak-primary animate-fade-in">
        <CardContent className="p-8">
          <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
          
          <div className="mt-8 mb-6">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-matepeak-primary to-[#FFD966] transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          
          <TooltipProvider>
            <Form {...form}>
              <form className="space-y-8">
                {renderStep()}
                
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
    </div>
  );
}
