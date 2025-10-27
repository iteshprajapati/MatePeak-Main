
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: "Basic Info" },
  { number: 2, title: "Certification" },
  { number: 3, title: "Education" },
  { number: 4, title: "Description" },
  { number: 5, title: "Services" },
  { number: 6, title: "Availability" },
  { number: 7, title: "Pricing" },
  { number: 8, title: "Profile" },
];

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {index > 0 && (
                <div className={`h-0.5 flex-1 transition-colors duration-300 ${
                  currentStep > step.number - 1 ? 'bg-matepeak-primary' : 'bg-gray-200'
                }`} />
              )}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentStep > step.number 
                  ? 'bg-matepeak-primary text-white scale-110' 
                  : currentStep === step.number 
                    ? 'bg-matepeak-primary text-white scale-110 ring-4 ring-matepeak-primary/20' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors duration-300 ${
                  currentStep > step.number ? 'bg-matepeak-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
            <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
              currentStep === step.number ? 'text-matepeak-primary' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 font-medium">
        <span>Step {currentStep} of {totalSteps}</span>
        <span className="text-matepeak-primary">{Math.round(progress)}% Complete</span>
      </div>
    </div>
  );
}
