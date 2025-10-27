
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isSubmitting,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-8 border-t mt-8">
      {currentStep > 1 ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isSubmitting}
          className="group hover:border-matepeak-primary transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
      ) : (
        <div></div>
      )}
      
      <Button 
        type="button" 
        onClick={onNext}
        disabled={isSubmitting}
        className="bg-matepeak-primary hover:bg-matepeak-secondary text-white font-semibold px-6 group transition-all hover:shadow-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : currentStep === totalSteps ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Setup
          </>
        ) : (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
}
