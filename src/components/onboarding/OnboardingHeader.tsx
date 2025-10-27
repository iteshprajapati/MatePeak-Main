
import { Link } from "react-router-dom";

export default function OnboardingHeader() {
  return (
    <div className="mb-8 text-center">
      <Link to="/" className="inline-block mb-2">
        <img 
          src="/lovable-uploads/2b7c1b08-70d4-4252-b2ed-62d8989b1195.png" 
          alt="MatePeak Logo"
          className="h-12 mx-auto"
        />
      </Link>
      <h2 className="text-2xl font-semibold">Expert Onboarding</h2>
      <p className="text-gray-600 mt-2">Complete your profile to start mentoring on MatePeak</p>
    </div>
  );
}
