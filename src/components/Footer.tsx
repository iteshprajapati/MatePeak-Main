import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Twitter,
  Instagram,
  Linkedin,
  Github,
} from "lucide-react";
import FeedbackModal from "./FeedbackModal";

import { supabase } from "@/integrations/supabase/client";
import RoleSelectionModal from "./RoleSelectionModal";

const Footer = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<"student" | "mentor" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = session.user.user_metadata?.role as "student" | "mentor";
        setUserRole(role);
        fetchProfile(session.user.id, role);
      }
    });
  }, []);

  const fetchProfile = async (userId: string, role: "student" | "mentor") => {
    if (role === "mentor") {
      const { data: expertData } = await supabase
        .from("expert_profiles")
        .select("username, onboarding_complete")
        .eq("id", userId)
        .single();
      setProfile(expertData);
    }
  };

  const handleBecomeMentor = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userRole === "mentor") {
      if (profile && !profile.onboarding_complete) {
        navigate("/expert/onboarding");
      } else {
        navigate("/mentor/dashboard");
      }
    } else {
      setIsRoleModalOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            {/* Left: Logo, Description, Social & Feedback */}
            <div className="md:col-span-4">
              <Link to="/" className="inline-block mb-6">
                <img
                  src="/lovable-uploads/MatePeak_logo_with_name (1).png"
                  alt="MatePeak Logo"
                  className="h-14"
                />
              </Link>
              <p className="text-base text-gray-600 mb-8 leading-relaxed font-light max-w-sm">
                Connecting learners with expert mentors worldwide. Build skills,
                gain confidence, and achieve your goals.
              </p>

              {/* Social Media Icons */}
              <div className="flex gap-4 mb-8">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-matepeak-primary hover:text-white transition-all duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-matepeak-primary hover:text-white transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-matepeak-primary hover:text-white transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-matepeak-primary hover:text-white transition-all duration-300"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>

              {/* Feedback Button - More Prominent */}
              <Button
                onClick={() => setIsFeedbackOpen(true)}
                className="bg-matepeak-primary hover:bg-matepeak-secondary text-white font-semibold gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                size="default"
              >
                <MessageSquare className="w-4 h-4" />
                Share Your Feedback
              </Button>
            </div>

            {/* Right: Navigation Columns */}
            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {/* Platform Column */}
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">
                  Platform
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/explore"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                      onClick={() =>
                        setTimeout(
                          () => window.scrollTo({ top: 0, behavior: "smooth" }),
                          0
                        )
                      }
                    >
                      Browse Mentors
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                      onClick={handleBecomeMentor}
                    >
                      Become a Mentor
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/how-it-works"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources Column */}
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/about-us"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">
                  Legal
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/privacy-policy"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cookie-policy"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-200 text-sm font-light"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm font-light">
                &copy; {new Date().getFullYear()} MatePeak. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <Link
                  to="/privacy-policy"
                  className="text-gray-500 hover:text-matepeak-primary transition-colors font-light"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-500 hover:text-matepeak-primary transition-colors font-light"
                >
                  Terms
                </Link>
                <Link
                  to="/cookie-policy"
                  className="text-gray-500 hover:text-matepeak-primary transition-colors font-light"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <RoleSelectionModal
        open={isRoleModalOpen}
        onOpenChange={setIsRoleModalOpen}
      />
    </>
  );
};

export default Footer;
