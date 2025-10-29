import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  Briefcase, 
  Star, 
  Info 
} from "lucide-react";
import { ProfileTab } from "@/pages/MentorPublicProfile";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    {
      id: "overview" as ProfileTab,
      label: "Overview",
      icon: User,
    },
    {
      id: "availability" as ProfileTab,
      label: "Availability",
      icon: Calendar,
    },
    {
      id: "experiences" as ProfileTab,
      label: "Experiences",
      icon: Briefcase,
    },
    {
      id: "reviews" as ProfileTab,
      label: "Reviews",
      icon: Star,
    },
    {
      id: "about" as ProfileTab,
      label: "More About",
      icon: Info,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProfileTab)}>
        <TabsList className="w-full grid grid-cols-5 bg-transparent h-auto p-0 gap-0 border-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-transparent data-[state=active]:text-matepeak-primary 
                  data-[state=active]:border-b-2 data-[state=active]:border-matepeak-primary
                  hover:text-matepeak-primary transition-colors rounded-none py-4 px-4
                  flex items-center justify-center gap-2 text-gray-600 border-b-2 border-transparent
                  font-medium text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
