import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
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
    if (role === 'mentor') {
      // Get expert profile with avatar from profiles table
      const { data: expertData } = await supabase
        .from("expert_profiles")
        .select(`
          username, 
          full_name,
          profiles (
            avatar_url
          )
        `)
        .eq("id", userId)
        .maybeSingle();

      if (expertData) {
        setProfile({ 
          ...expertData, 
          // @ts-ignore - profiles is joined
          avatar_url: expertData.profiles?.avatar_url,
          type: 'mentor' 
        });
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
    if (userRole === 'mentor') {
      navigate('/expert/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U';
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
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo - Centered */}
          <Link to="/" className="flex items-center gap-2 mx-auto md:mx-0 transition-transform duration-300 hover:scale-105">
            <img 
              src="/lovable-uploads/2b7c1b08-70d4-4252-b2ed-62d8989b1195.png" 
              alt="MatePeak Logo"
              className="h-10 drop-shadow-sm"
            />
            <span className="text-xl font-bold font-poppins text-gray-900">
              MatePeak
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 absolute right-8">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-matepeak-primary/20 transition-all">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user.email} />
                      <AvatarFallback className={`${getAvatarColor(profile?.full_name || user.email)} text-white font-semibold`}>
                        {getInitials(profile?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white shadow-xl border-gray-200" align="end">
                  <div className="flex items-center justify-start gap-2 p-3 bg-gradient-to-r from-matepeak-primary/5 to-matepeak-secondary/5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer hover:bg-matepeak-primary/5">
                    <Settings className="mr-2 h-4 w-4 text-matepeak-primary" />
                    <span className="text-gray-700">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer hover:bg-matepeak-primary/5">
                    <User className="mr-2 h-4 w-4 text-matepeak-primary" />
                    <span className="text-gray-700">{userRole === 'mentor' ? 'View Profile' : 'My Profile'}</span>
                  </DropdownMenuItem>
                  {userRole === 'student' && (
                    <DropdownMenuItem onClick={() => navigate('/bookings')} className="cursor-pointer hover:bg-matepeak-primary/5">
                      <Settings className="mr-2 h-4 w-4 text-matepeak-primary" />
                      <span className="text-gray-700">My Bookings</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Logout</span>
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
        <div className="md:hidden bg-gradient-to-br from-white to-matepeak-primary/5 py-4 px-4 mt-2 shadow-lg border-t-2 border-matepeak-primary/20 rounded-b-xl">
          {user ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-matepeak-primary/20">
                <Avatar className="h-12 w-12 ring-2 ring-matepeak-primary/30 shadow-md">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user.email} />
                  <AvatarFallback className={`${getAvatarColor(profile?.full_name || user.email)} text-white font-semibold`}>
                    {getInitials(profile?.full_name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-matepeak-primary font-semibold text-sm">{profile?.full_name || 'User'}</p>
                  <p className="text-gray-600 text-xs">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                className="text-matepeak-primary hover:text-white hover:bg-matepeak-primary w-full font-semibold justify-start transition-all duration-300 rounded-lg"
                onClick={() => {
                  handleDashboardClick();
                  setIsMenuOpen(false);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="ghost"
                className="text-matepeak-primary hover:text-white hover:bg-matepeak-primary w-full font-semibold justify-start transition-all duration-300 rounded-lg"
                onClick={() => {
                  handleViewProfile();
                  setIsMenuOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                {userRole === 'mentor' ? 'View Profile' : 'My Profile'}
              </Button>
              {userRole === 'student' && (
                <Button 
                  variant="ghost"
                  className="text-matepeak-primary hover:text-white hover:bg-matepeak-primary w-full font-semibold justify-start transition-all duration-300 rounded-lg"
                  onClick={() => {
                    navigate('/bookings');
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  My Bookings
                </Button>
              )}
              <div className="pt-2 border-t border-matepeak-primary/20">
                <Button 
                  variant="ghost"
                  className="text-red-600 hover:text-white hover:bg-red-600 w-full font-semibold justify-start transition-all duration-300 rounded-lg"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
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
