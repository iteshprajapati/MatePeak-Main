import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Linkedin,
  Twitter,
  Globe,
  Share2,
  Users,
  Heart,
  Palette,
  Briefcase,
  GraduationCap,
  Code,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ProfileHeaderProps {
  mentor: any;
  stats: {
    averageRating: number;
    reviewCount: number;
    totalSessions: number;
    completedSessions: number;
  };
  isOwnProfile?: boolean;
}

export default function ProfileHeader({ mentor, stats, isOwnProfile = false }: ProfileHeaderProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${mentor.full_name} - Mentor Profile`,
          text: `Check out ${mentor.full_name}'s mentor profile on MatePeak`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const memberSince = new Date(mentor.created_at).getFullYear();

  // Map categories to their icons
  const categoryIcons: Record<string, any> = {
    "Mental Health": Heart,
    "Creative Arts": Palette,
    "Career Coaching": Briefcase,
    "Academic Support": GraduationCap,
    "Programming & Tech": Code,
    "Test Preparation": BookOpen,
    "Business & Finance": TrendingUp,
    "Leadership & Development": Users,
  };

  const getIconForCategory = (category: string) => {
    return categoryIcons[category] || Briefcase;
  };

  return (
    <Card className="shadow-sm border border-gray-200 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-2 border-gray-100">
              <AvatarImage
                src={mentor.profile_picture_url || mentor.profiles?.avatar_url}
                alt={mentor.full_name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-matepeak-primary text-white font-bold">
                {getInitials(mentor.full_name)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Name and Username */}
        <div className="text-center mb-4 space-y-1">
          <h1 className="text-xl font-bold text-gray-900">
            {mentor.full_name}
          </h1>
          {mentor.headline && (
            <p className="text-sm text-gray-600">{mentor.headline}</p>
          )}
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-gray-500">@{mentor.username}</p>
            {isOwnProfile && (
              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-xs">
                Your Profile
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-4">
          {isOwnProfile ? (
            // Show dashboard button for own profile
            <Link to={`/dashboard/${mentor.username}`} className="block">
              <Button className="w-full bg-matepeak-primary hover:bg-matepeak-secondary text-white font-medium shadow-sm">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            // Show booking and message buttons for other mentors
            <>
              <Link to={`/book/${mentor.id}`} className="block">
                <Button className="w-full bg-matepeak-primary hover:bg-matepeak-secondary text-white font-medium shadow-sm">
                  Book {mentor.full_name.split(' ')[0]}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </>
          )}
        </div>

        <Separator className="my-4" />

        {/* Expertise Tags */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">Expert in:</p>
          <div className="flex flex-wrap gap-2">
            {mentor.categories?.slice(0, 3).map((category: string) => {
              const IconComponent = getIconForCategory(category);
              return (
                <div
                  key={category}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-xs font-medium hover:border-gray-400 transition-colors"
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  <span>{category}</span>
                </div>
              );
            })}
            {mentor.categories?.length > 3 && (
              <div className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-xs font-medium">
                +{mentor.categories.length - 3} more
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Quick Stats - Simple format */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sessions Completed</span>
            <span className="font-semibold text-gray-900">{stats.completedSessions}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Member Since</span>
            <span className="font-semibold text-gray-900">{memberSince}</span>
          </div>

          {mentor.experience > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Experience</span>
              <span className="font-semibold text-gray-900">{mentor.experience}+ years</span>
            </div>
          )}

          {stats.averageRating > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {stats.averageRating.toFixed(1)} ({stats.reviewCount})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        {mentor.social_links && Object.keys(mentor.social_links).some(key => mentor.social_links[key]) && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2 justify-center">
              {mentor.social_links.linkedin && (
                <a
                  href={mentor.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-gray-600" />
                </a>
              )}
              {mentor.social_links.twitter && (
                <a
                  href={mentor.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Twitter"
                >
                  <Twitter className="h-4 w-4 text-gray-600" />
                </a>
              )}
              {mentor.social_links.website && (
                <a
                  href={mentor.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Website"
                >
                  <Globe className="h-4 w-4 text-gray-600" />
                </a>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}