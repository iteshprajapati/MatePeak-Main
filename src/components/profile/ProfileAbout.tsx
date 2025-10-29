import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Globe,
  Languages,
  MapPin,
  Clock
} from "lucide-react";

interface ProfileAboutProps {
  mentor: any;
}

export default function ProfileAbout({ mentor }: ProfileAboutProps) {
  return (
    <div className="space-y-6">
      {/* Additional Information */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-matepeak-yellow rounded-lg">
              <Info className="h-5 w-5 text-matepeak-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">More About Me</h2>
          </div>

          <div className="space-y-6">
            {/* Full Bio */}
            {mentor.bio && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {mentor.bio}
                </p>
              </div>
            )}

            {/* Categories/Expertise */}
            {mentor.categories && mentor.categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.categories.map((category: string) => (
                    <Badge
                      key={category}
                      className="bg-matepeak-primary text-white hover:bg-matepeak-secondary"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expertise Tags */}
            {mentor.expertise_tags && mentor.expertise_tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Skills & Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise_tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-matepeak-primary text-matepeak-primary"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Services Offered */}
            {mentor.services && Object.keys(mentor.services).length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Available Services
                </h3>
                <div className="grid gap-3">
                  {mentor.services.oneOnOneSession && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>One-on-One Mentoring Sessions</span>
                    </div>
                  )}
                  {mentor.services.chatAdvice && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Chat-Based Advice</span>
                    </div>
                  )}
                  {mentor.services.digitalProducts && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Digital Products & Resources</span>
                    </div>
                  )}
                  {mentor.services.notes && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Notes & Study Materials</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {mentor.experience > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5 text-matepeak-primary" />
                  <span>{mentor.experience}+ years of professional experience</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Preferences (if available) */}
      {mentor.social_links && Object.keys(mentor.social_links).some(key => mentor.social_links[key]) && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-matepeak-yellow rounded-lg">
                <Globe className="h-5 w-5 text-matepeak-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Find Me Online</h2>
            </div>

            <div className="space-y-3">
              {mentor.social_links.linkedin && (
                <a
                  href={mentor.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-matepeak-light rounded-lg hover:bg-matepeak-yellow/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">LinkedIn</p>
                    <p className="text-sm text-gray-600">Professional Profile</p>
                  </div>
                </a>
              )}

              {mentor.social_links.twitter && (
                <a
                  href={mentor.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-matepeak-light rounded-lg hover:bg-matepeak-yellow/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Twitter</p>
                    <p className="text-sm text-gray-600">Follow for updates</p>
                  </div>
                </a>
              )}

              {mentor.social_links.website && (
                <a
                  href={mentor.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-matepeak-light rounded-lg hover:bg-matepeak-yellow/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-matepeak-yellow flex items-center justify-center">
                    <Globe className="h-5 w-5 text-matepeak-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Website</p>
                    <p className="text-sm text-gray-600">Visit my website</p>
                  </div>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
