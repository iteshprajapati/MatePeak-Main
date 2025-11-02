import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoleSelectionModal from "./RoleSelectionModal";
import SignInRoleSelection from "./SignInRoleSelection";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'mentor' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = session.user.user_metadata?.role as 'student' | 'mentor';
        setUserRole(role);
        fetchProfile(session.user.id, role);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const role = session.user.user_metadata?.role as 'student' | 'mentor';
        setUserRole(role);
        fetchProfile(session.user.id, role);
      } else {
        setProfile(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, role: 'student' | 'mentor') => {
    try {
      if (role === 'mentor') {
        // Get expert profile with profile picture
        const { data: expertData, error } = await supabase
          .from("expert_profiles")
          .select("username, full_name, profile_picture_url, id")
          .eq("id", userId)
          .single();

        if (error) {
          console.error('Navbar - Error fetching expert profile:', error);
          return;
        }

        if (expertData) {
          console.log('Navbar - Fetched expert profile:', expertData);
          
          // Get avatar from profiles table as fallback
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", userId)
            .single();
          
          const profileData = {
            username: expertData.username,
            full_name: expertData.full_name,
            // Use profile_picture_url from expert_profiles first, fallback to avatar_url from profiles
            avatar_url: expertData.profile_picture_url || profilesData?.avatar_url || null,
            type: 'mentor' as const
          };
          console.log('Navbar - Setting profile state:', profileData);
          setProfile(profileData);
        } else {
          console.log('Navbar - No expert profile data found');
        }
      } else {
        // Get regular profile for student
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (profileData) {
          setProfile({ ...profileData, type: 'student' });
        }
      }
    } catch (err) {
      console.error('Navbar - Unexpected error fetching profile:', err);
    }
  };

  const handleGetStartedClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/expert/dashboard');
    } else {
      setIsRoleModalOpen(true);
    }
  };

  const handleSignInClick = () => {
    setIsSignInModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const handleViewProfile = () => {
    if (userRole === 'mentor' && profile?.username) {
      navigate(`/mentor/${profile.username}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleDashboardClick = () => {
    console.log('Dashboard clicked - userRole:', userRole, 'profile:', profile);
    if (userRole === 'mentor' && profile?.username) {
      console.log('Navigating to:', `/dashboard/${profile.username}`);
      navigate(`/dashboard/${profile.username}`);
    } else if (userRole === 'mentor') {
      // Fallback if username not loaded yet
      console.log('Fallback: Navigating to /expert/dashboard');
      navigate('/expert/dashboard');
    } else if (userRole === 'student') {
      navigate('/dashboard');
    } else {
      // Fallback: try to determine from profile type
      if (profile?.type === 'mentor' && profile?.username) {
        console.log('Using profile type, navigating to:', `/dashboard/${profile.username}`);
        navigate(`/dashboard/${profile.username}`);
      } else if (profile?.type === 'mentor') {
        navigate('/expert/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    // Fallback to role-based display
    if (userRole === 'mentor') {
      return 'Mentor';
    } else if (userRole === 'student') {
      return 'Student';
    }
    return 'User';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-matepeak-primary',
      'bg-matepeak-secondary',
      'bg-gradient-to-br from-matepeak-primary to-matepeak-secondary',
      'bg-gradient-to-br from-orange-500 to-red-500',
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-teal-500 to-green-500'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <>
    <nav className="bg-white py-4 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo - Centered */}
          <Link to="/" className="flex items-center gap-2 mx-auto md:mx-0 transition-transform duration-300 hover:scale-105">
            <img 
              src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png" 
              alt="MatePeak Logo"
              className="h-10 drop-shadow-sm"
            />
            <span className="text-2xl font-extrabold font-poppins text-gray-900">
              MatePeak
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 absolute right-8">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 h-11 px-3 rounded-xl hover:bg-gray-100 transition-all border-2 border-transparent data-[state=open]:border-black focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                      <AvatarImage src={profile?.avatar_url} alt={getDisplayName()} />
                      <AvatarFallback className={`${getAvatarColor(getDisplayName())} text-white font-semibold text-sm`}>
                        {getInitials(getDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-gray-900">
                      {getDisplayName()}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white shadow-lg border border-gray-200 rounded-xl" align="end">
                  <DropdownMenuItem 
                    onClick={handleDashboardClick} 
                    className="cursor-pointer hover:bg-gray-50 rounded-lg m-1 text-gray-700 focus:bg-gray-50"
                  >
                    <span className="text-sm">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer hover:bg-red-50 focus:bg-red-50 rounded-lg m-1"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium text-sm">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  className="text-matepeak-primary border-2 border-matepeak-primary/30 hover:bg-matepeak-primary/5 hover:border-matepeak-primary font-semibold h-10 px-6 rounded-lg transition-all duration-300 hover:shadow-md"
                  onClick={handleSignInClick}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-matepeak-primary to-matepeak-secondary text-white hover:from-matepeak-primary/90 hover:to-matepeak-secondary/90 font-bold rounded-lg h-10 px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  onClick={handleGetStartedClick}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden absolute right-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-matepeak-primary hover:text-matepeak-secondary p-2 rounded-lg hover:bg-matepeak-primary/5 transition-all duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 mt-2 shadow-lg border-t border-gray-200 rounded-b-xl">
          {user ? (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                  <AvatarImage src={profile?.avatar_url} alt={getDisplayName()} />
                  <AvatarFallback className={`${getAvatarColor(getDisplayName())} text-white font-semibold`}>
                    {getInitials(getDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{getDisplayName()}</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 w-full font-medium justify-start transition-all duration-200 rounded-xl h-11"
                onClick={() => {
                  handleDashboardClick();
                  setIsMenuOpen(false);
                }}
              >
                Dashboard
              </Button>
              <div className="pt-2 border-t border-gray-200">
                <Button 
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 w-full font-medium justify-start transition-all duration-200 rounded-xl h-11"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Button 
                variant="outline"
                className="text-matepeak-primary border-2 border-matepeak-primary/30 hover:bg-matepeak-primary hover:text-white w-full font-semibold justify-center transition-all duration-300 rounded-lg"
                onClick={() => {
                  handleSignInClick();
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-matepeak-primary to-matepeak-secondary text-white hover:from-matepeak-primary/90 hover:to-matepeak-secondary/90 w-full font-bold rounded-lg shadow-lg transition-all duration-300"
                onClick={() => {
                  handleGetStartedClick();
                  setIsMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}

      <RoleSelectionModal 
        open={isRoleModalOpen} 
        onOpenChange={setIsRoleModalOpen} 
      />
      <SignInRoleSelection 
        open={isSignInModalOpen} 
        onOpenChange={setIsSignInModalOpen} 
      />
    </nav>
    </>
  );
};

export default Navbar;
