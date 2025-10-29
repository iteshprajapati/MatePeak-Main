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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ProfileTab)}>
        <TabsList className="w-full grid grid-cols-5 bg-gray-50 h-auto p-1 gap-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-matepeak-primary data-[state=active]:text-white 
                  hover:bg-gray-100 data-[state=active]:hover:bg-matepeak-secondary transition-all rounded-lg py-3 px-3
                  flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-600 
                  data-[state=active]:shadow-md font-medium"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
