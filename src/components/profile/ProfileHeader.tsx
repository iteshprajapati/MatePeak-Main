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
}

export default function ProfileHeader({ mentor, stats }: ProfileHeaderProps) {
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

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 bg-white overflow-hidden">
      <CardContent className="p-8">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-36 w-36 border-4 border-matepeak-yellow shadow-md">
              <AvatarImage
                src={mentor.profile_picture_url || mentor.profiles?.avatar_url}
                alt={mentor.full_name}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-matepeak-primary to-matepeak-secondary text-white font-bold">
                {getInitials(mentor.full_name)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
          </div>
        </div>

        {/* Name and Username */}
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {mentor.full_name}
          </h1>
          {mentor.headline && (
            <p className="text-sm text-gray-600 leading-relaxed px-2">{mentor.headline}</p>
          )}
          <p className="text-sm text-matepeak-primary font-medium">@{mentor.username}</p>
        </div>

        {/* Rating */}
        {stats.averageRating > 0 && (
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-matepeak-yellow/10 rounded-lg">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(stats.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900 text-lg">
              {stats.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              ({stats.reviewCount})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Link to={`/book/${mentor.id}`} className="block">
            <Button className="w-full bg-matepeak-primary hover:bg-matepeak-secondary text-white h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all">
              Book a Session
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full border-2 border-matepeak-primary text-matepeak-primary hover:bg-matepeak-yellow/20 h-11 font-medium"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button
            variant="ghost"
            className="w-full text-gray-600 hover:text-matepeak-primary hover:bg-matepeak-light h-11"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Expertise Tags */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Areas of Expertise</p>
          <div className="flex flex-wrap gap-2">
            {mentor.categories?.slice(0, 3).map((category: string) => (
              <Badge
                key={category}
                className="bg-matepeak-yellow text-matepeak-primary hover:bg-matepeak-yellow/90 px-3 py-1 text-xs font-medium"
              >
                {category}
              </Badge>
            ))}
            {mentor.categories?.length > 3 && (
              <Badge variant="outline" className="text-gray-600 border-gray-300 px-3 py-1">
                +{mentor.categories.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Quick Stats */}
        <div className="space-y-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Stats</p>
          
          <div className="flex items-center justify-between py-2 hover:bg-matepeak-light/50 rounded-lg px-2 transition-colors">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="h-8 w-8 rounded-lg bg-matepeak-yellow/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-matepeak-primary" />
              </div>
              <span className="font-medium">Sessions</span>
            </div>
            <span className="font-bold text-gray-900">
              {stats.completedSessions}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 hover:bg-matepeak-light/50 rounded-lg px-2 transition-colors">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="h-8 w-8 rounded-lg bg-matepeak-yellow/20 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-matepeak-primary" />
              </div>
              <span className="font-medium">Since</span>
            </div>
            <span className="font-bold text-gray-900">{memberSince}</span>
          </div>

          {mentor.experience > 0 && (
            <div className="flex items-center justify-between py-2 hover:bg-matepeak-light/50 rounded-lg px-2 transition-colors">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="h-8 w-8 rounded-lg bg-matepeak-yellow/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-matepeak-primary" />
                </div>
                <span className="font-medium">Experience</span>
              </div>
              <span className="font-bold text-gray-900">
                {mentor.experience}+ yrs
              </span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {mentor.social_links && Object.keys(mentor.social_links).some(key => mentor.social_links[key]) && (
          <>
            <Separator className="my-6" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Connect With Me</p>
              <div className="flex gap-2 justify-center">
                {mentor.social_links.linkedin && (
                  <a
                    href={mentor.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}
                {mentor.social_links.twitter && (
                  <a
                    href={mentor.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors group"
                    title="Twitter"
                  >
                    <Twitter className="h-5 w-5 text-sky-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}
                {mentor.social_links.website && (
                  <a
                    href={mentor.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-matepeak-light hover:bg-matepeak-yellow transition-colors group"
                    title="Website"
                  >
                    <Globe className="h-5 w-5 text-matepeak-primary group-hover:scale-110 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
