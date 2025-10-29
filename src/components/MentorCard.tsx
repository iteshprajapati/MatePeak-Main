
import { Star, Phone, MessageSquare, Video, Users, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

// Update the MentorProfile type to include connectionOptions
export interface MentorProfile {
  id: string;
  name: string;
  title: string;
  image: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  price: number;
  bio: string;
  connectionOptions: string[];
  username?: string; // Optional username for new profile route
}

interface MentorCardProps {
  mentor: MentorProfile;
}

const MentorCard = ({ mentor }: MentorCardProps) => {
  const nameParts = mentor.name.split(' ');
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : mentor.name[0];

  const getConnectionIcon = (option: string) => {
    switch (option.toLowerCase()) {
      case '1:1 call':
        return <Phone className="h-4 w-4" />;
      case 'chat':
      case 'dm':
        return <MessageSquare className="h-4 w-4" />;
      case 'group session':
        return <Users className="h-4 w-4" />;
      case 'mock interview':
        return <Video className="h-4 w-4" />;
      case 'resume review':
      case 'document review':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 h-full max-w-sm mx-auto">
      <CardContent className="p-4">
        {/* Profile section with avatar and name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 border-2 border-gray-200">
              <AvatarImage src={mentor.image} alt={mentor.name} className="object-cover" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{mentor.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-1">{mentor.title}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{mentor.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({mentor.reviewCount})</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">₹{mentor.price}</p>
            <p className="text-sm text-gray-500">per session</p>
          </div>
        </div>

        {/* Categories section */}
        <div className="flex flex-wrap gap-1 mb-4">
          {mentor.categories.slice(0, 2).map((category, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="bg-gray-50 text-gray-700 border-gray-200 text-xs"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Connection options */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.connectionOptions.map((option, index) => (
            <HoverCard key={index}>
              <HoverCardTrigger>
                <Badge 
                  variant="outline" 
                  className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {getConnectionIcon(option)}
                    <span className="text-xs">{option}</span>
                  </span>
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent>
                Available for {option}
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

        {/* View Profile button */}
        <div className="flex justify-end">
          <Link to={mentor.username ? `/mentor/${mentor.username}` : `/mentors/${mentor.id}`}>
            <Button variant="outline" className="rounded-full bg-matepeak-primary text-white hover:bg-matepeak-yellow hover:text-matepeak-primary transition-all duration-200">
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorCard;
