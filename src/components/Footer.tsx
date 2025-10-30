import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

import { supabase } from "@/integrations/supabase/client";
import RoleSelectionModal from "./RoleSelectionModal";

const Footer = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'mentor' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = session.user.user_metadata?.role as 'student' | 'mentor';
        setUserRole(role);
        fetchProfile(session.user.id, role);
      }
    });
  }, []);

  const fetchProfile = async (userId: string, role: 'student' | 'mentor') => {
    if (role === 'mentor') {
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
    if (userRole === 'mentor') {
      if (profile && profile.onboarding_complete === false) {
        navigate('/expert/onboarding');
      } else {
        navigate('/mentor/dashboard');
      }
    } else {
      setIsRoleModalOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-white rounded-2xl shadow-lg mx-2 my-8 p-0">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
            {/* Left: Logo, desc, social */}
            <div className="flex-1 min-w-[220px] max-w-xs">
              <Link to="/" className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png" 
                  alt="MatePeak Logo" 
                  className="h-8"
                />
              </Link>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Connecting learners with expert mentors worldwide.
              </p>
              <div className="flex gap-3 mb-6">
                <a href="#" className="text-gray-500 hover:text-black"><span className="sr-only">X</span><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></a>
                <a href="#" className="text-gray-500 hover:text-black"><span className="sr-only">Instagram</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 0A5.75 5.75 0 0 0 2 7.75Zm8.5 0A5.75 5.75 0 0 1 22 7.75Zm0 16A5.75 5.75 0 0 0 22 16.25Zm-8.5 0A5.75 5.75 0 0 1 2 16.25Zm10.25-10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-4.25 1.75a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5Z"/></svg></a>
                <a href="#" className="text-gray-500 hover:text-black"><span className="sr-only">LinkedIn</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM7 19H4V8h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
                <a href="#" className="text-gray-500 hover:text-black"><span className="sr-only">GitHub</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.8 24 17.303 24 12c0-6.627-5.373-12-12-12z"/></svg></a>
              </div>
              <Button
                onClick={() => setIsFeedbackOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 hover:border-matepeak-primary hover:text-matepeak-primary transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4" />
                Give Feedback
              </Button>
            </div>
            {/* Right: Columns */}
            <div className="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-5 text-base">Platform</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to="/explore"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300"
                      onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)}
                    >
                      Browse Mentors
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300"
                      onClick={handleBecomeMentor}
                    >
                      Become a Mentor
                    </a>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-5 text-base">Resources</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link to="/about-us" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-5 text-base">Legal</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link to="/privacy-policy" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookie-policy" className="text-gray-600 hover:text-matepeak-primary transition-colors duration-300">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-8 border-gray-200" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-2">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} MatePeak. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-matepeak-primary">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-matepeak-primary">Terms of Service</Link>
              <Link to="/cookie-policy" className="text-gray-500 hover:text-matepeak-primary">Cookies Settings</Link>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
      <RoleSelectionModal open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen} />
    </>
  );
};

export default Footer;
