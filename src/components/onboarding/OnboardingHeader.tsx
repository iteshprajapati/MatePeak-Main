import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function OnboardingHeader() {
  return (
    <div className="mb-12 text-center animate-fade-in">
      <Link to="/" className="inline-block mb-6">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/2b7c1b08-70d4-4252-b2ed-62d8989b1195.png" 
            alt="MatePeak Logo"
            className="h-16 w-auto mx-auto filter drop-shadow-md"
          />
        </div>
      </Link>
      
      <div className="relative inline-block mb-3">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
          Expert Onboarding
        </h2>
        <div className="absolute -right-8 -top-2">
          <Sparkles className="w-5 h-5 text-matepeak-primary" fill="currentColor" />
        </div>
      </div>
      
      <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
        Join our elite community of mentors and make a lasting impact
      </p>
      
      {/* Step indicator badges */}
      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          8 Quick Steps
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          ~10 Minutes
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Auto-Save
        </span>
      </div>
    </div>
  );
}
