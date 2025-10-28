import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function OnboardingHeader() {
  return (
    <>
      {/* Fixed Top Navbar - Matching Dashboard Design */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 left-0">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <Link to="/" className="flex items-center group">
              <img
                src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png"
                alt="MatePeak"
                className="h-9 w-auto transition-transform group-hover:scale-105"
              />
              <span className="ml-3 text-2xl font-extrabold font-poppins text-gray-900">
                MatePeak
              </span>
            </Link>

            {/* Right side - Back to Home */}
            <Link
              to="/"
              className="flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      {/* Page Header Content with Logo */}
      <div className="pt-8 pb-6 text-center">
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png"
            alt="MatePeak Expert Onboarding"
            className="h-16 w-auto mx-auto"
          />
        </div>

        {/* Title and Description */}
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Complete Your Expert Profile
          </h1>
          
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Join our elite community of mentors and make a lasting impact
          </p>
        </div>
        
        {/* Step indicator badges */}
        <div className="mt-6 flex items-center justify-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            8 Steps
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            10 Min
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Auto-Save
          </span>
        </div>
      </div>
    </>
  );
}
