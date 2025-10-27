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
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <>
    <nav className="bg-white py-4 shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 pl-8">
          <img 
            src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png" 
            alt="MatePeak Logo"
            className="h-10"
          />
          <span className="text-xl font-bold font-poppins text-matepeak-primary">MatePeak</span>
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user.email} />
                    <AvatarFallback className={`${getAvatarColor(profile?.full_name || user.email)} text-white`}>
                      {getInitials(profile?.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDashboardClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewProfile}>
                  <User className="mr-2 h-4 w-4" />
                  {userRole === 'mentor' ? 'View Profile' : 'My Profile'}
                </DropdownMenuItem>
                {userRole === 'student' && (
                  <DropdownMenuItem onClick={() => navigate('/bookings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    My Bookings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3 mr-8">
              <Button 
                variant="outline"
                className="text-matepeak-primary border-matepeak-primary/20 hover:bg-gray-50 hover:border-matepeak-primary/40 font-medium h-10 transition-all duration-200"
                onClick={handleSignInClick}
              >
                Sign In
              </Button>
              <Button 
                className="bg-matepeak-primary text-white hover:bg-matepeak-secondary font-bold rounded-lg h-10 transition-colors duration-300"
                onClick={handleGetStartedClick}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-matepeak-primary hover:text-matepeak-secondary"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 mt-2 shadow-inner border-t border-gray-200">
          {user ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user.email} />
                  <AvatarFallback className={`${getAvatarColor(profile?.full_name || user.email)} text-white`}>
                    {getInitials(profile?.full_name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-matepeak-primary font-medium text-sm">{profile?.full_name || 'User'}</p>
                  <p className="text-gray-600 text-xs">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                className="text-matepeak-primary hover:text-matepeak-secondary hover:bg-gray-100 w-full font-medium justify-start"
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
                className="text-matepeak-primary hover:text-matepeak-secondary hover:bg-gray-100 w-full font-medium justify-start"
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
                  className="text-matepeak-primary hover:text-matepeak-secondary hover:bg-gray-100 w-full font-medium justify-start"
                  onClick={() => {
                    navigate('/bookings');
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  My Bookings
                </Button>
              )}
              <Button 
                variant="ghost"
                className="text-matepeak-primary hover:text-matepeak-secondary hover:bg-gray-100 w-full font-medium justify-start"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Button 
                variant="ghost"
                className="text-matepeak-primary hover:text-matepeak-secondary hover:bg-gray-100 w-full font-medium justify-start"
                onClick={() => {
                  handleSignInClick();
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button 
                className="bg-matepeak-primary text-white hover:bg-matepeak-secondary w-full font-bold rounded-lg"
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
