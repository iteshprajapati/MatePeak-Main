
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Sparkles } from "lucide-react";
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
  const isLastStep = currentStep === totalSteps;
  
  return (
    <div className="flex justify-between items-center pt-8 border-t-2 border-gray-100 mt-10">
      {currentStep > 1 ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isSubmitting}
          className="group relative overflow-hidden border-2 border-gray-300 hover:border-matepeak-primary transition-all duration-300 px-6 py-5 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
          <span className="relative z-10">Previous</span>
        </Button>
      ) : (
        <div></div>
      )}
      
      {isLastStep ? (
        <Button 
          type="button" 
          onClick={onNext}
          disabled={isSubmitting}
          className="group relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0"
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
          
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
              <span className="relative z-10">Creating Your Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5 relative z-10" />
              <span className="relative z-10">Complete Setup</span>
            </>
          )}
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onNext}
          disabled={isSubmitting}
          className="group relative overflow-hidden bg-gradient-to-r from-matepeak-primary via-matepeak-secondary to-orange-500 hover:from-matepeak-primary/90 hover:via-matepeak-secondary/90 hover:to-orange-600 text-white font-bold px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0"
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
          
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
              <span className="relative z-10">Saving...</span>
            </>
          ) : (
            <>
              <span className="relative z-10">Continue</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
