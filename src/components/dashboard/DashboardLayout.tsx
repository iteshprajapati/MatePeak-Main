import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Calendar,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Star,
  CalendarCheck,
  MessageSquare,
  Users,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NotificationBell } from "./NotificationBell";

type DashboardView = "overview" | "profile" | "sessions" | "reviews" | "availability" | "calendar" | "messages" | "students";

interface DashboardLayoutProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  mentorProfile: any;
  user: any;
  children: React.ReactNode;
}

const DashboardLayout = ({
  activeView,
  onViewChange,
  mentorProfile,
  user,
  children,
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigationItems = [
    {
      id: "overview" as DashboardView,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "sessions" as DashboardView,
      label: "Sessions",
      icon: Calendar,
    },
    {
      id: "calendar" as DashboardView,
      label: "Calendar",
      icon: CalendarCheck,
    },
    {
      id: "messages" as DashboardView,
      label: "Messages",
      icon: MessageSquare,
    },
    {
      id: "students" as DashboardView,
      label: "Students",
      icon: Users,
    },
    {
      id: "availability" as DashboardView,
      label: "Availability",
      icon: Clock,
    },
    {
      id: "reviews" as DashboardView,
      label: "Reviews",
      icon: Star,
    },
    {
      id: "profile" as DashboardView,
      label: "Profile",
      icon: User,
    },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    const firstName = mentorProfile?.first_name || "";
    const lastName = mentorProfile?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "M";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <Link to="/" className="flex items-center ml-2 lg:ml-0">
                <img
                  src="/lovable-uploads/2b7c1b08-70d4-4252-b2ed-62d8989b1195.png"
                  alt="MatePeak"
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  MatePeak
                </span>
              </Link>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-4">
              <NotificationBell mentorId={mentorProfile.id} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={mentorProfile?.profile_picture_url || ""}
                        alt={`${mentorProfile?.first_name} ${mentorProfile?.last_name}`}
                      />
                      <AvatarFallback className="bg-gray-900 text-white text-sm font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {mentorProfile?.first_name} {mentorProfile?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">Mentor</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      @{mentorProfile?.username}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/mentor/${mentorProfile?.username}`)}>
                    <span>View public profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange("profile")}>
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col pt-16">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <nav className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="px-4 py-5 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="py-8 px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
