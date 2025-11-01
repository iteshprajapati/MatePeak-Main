import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RoleSelectionModal from "./RoleSelectionModal";
import { supabase } from "@/integrations/supabase/client";

const CallToActionSection = () => {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleGetStartedClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      navigate("/expert/dashboard");
    } else {
      setIsRoleModalOpen(true);
    }
  };

  return (
    <>
      <section className="relative bg-black py-24 md:py-32 px-4 overflow-hidden">
        {/* Curved Line SVG - Arc touching logo at top, ends at bottom corners */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 750 Q 720 250 1440 750"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.25"
            />
          </svg>
        </div>

        <div className="w-full max-w-3xl mx-auto text-center relative z-10 px-2 md:px-8 xl:px-0">
          {/* MatePeak Logo - Bigger */}
          <div className="flex justify-center items-center mb-6">
            <img
              src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png"
              alt="MatePeak Logo"
              className="h-16 w-auto relative z-20"
            />
          </div>

          {/* Main Heading - Times New Roman, Medium Weight */}
          <h2
            className="text-3xl md:text-4xl font-medium text-white mb-4"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            Unlock Your <span className="italic">Skills</span> Now!
          </h2>

          {/* Subheading - Shorter */}
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-2xl mx-auto">
            Join the community where lifelong learning meets people grow.
          </p>

          {/* Single CTA Button - Same as Navbar Get Started */}
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-6 text-base rounded-lg"
            onClick={handleGetStartedClick}
          >
            Get Started
          </Button>
        </div>
      </section>

      <RoleSelectionModal
        open={isRoleModalOpen}
        onOpenChange={setIsRoleModalOpen}
      />
    </>
  );
};

export default CallToActionSection;
