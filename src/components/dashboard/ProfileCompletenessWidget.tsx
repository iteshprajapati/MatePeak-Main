import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { validateMentorProfile, getMentorProfileScore } from "@/services/mentorCardService";
import type { ExpertProfileData } from "@/services/mentorCardService";

interface ProfileCompletenessProps {
  profile: ExpertProfileData;
  onImprove?: () => void;
}

const ProfileCompletenessWidget = ({ profile, onImprove }: ProfileCompletenessProps) => {
  const [score, setScore] = useState(0);
  const [validation, setValidation] = useState({
    isComplete: false,
    missingFields: [] as string[],
    warnings: [] as string[],
  });

  useEffect(() => {
    const profileScore = getMentorProfileScore(profile);
    const profileValidation = validateMentorProfile(profile);
    
    setScore(profileScore);
    setValidation(profileValidation);
  }, [profile]);

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreStatus = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Profile Completeness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {score}%
            </div>
            <div className="text-sm text-gray-600">{getScoreStatus()}</div>
          </div>
          <Badge
            variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
          >
            {score >= 80 ? "✨ Complete" : score >= 60 ? "🔄 In Progress" : "⚠️ Incomplete"}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Progress value={score} className="h-2" />

        {/* Missing Required Fields */}
        {validation.missingFields.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4" />
              Missing Required Fields
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              {validation.missingFields.map((field, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Improvements */}
        {validation.warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              Recommended Improvements
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completed Sections */}
        {score >= 60 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              What's Looking Good
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              {profile.full_name && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Profile name added
                </li>
              )}
              {profile.bio && profile.bio.length > 50 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Detailed bio provided
                </li>
              )}
              {(profile.profile_picture_url || profile.profiles?.avatar_url) && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Profile picture uploaded
                </li>
              )}
              {profile.services && Object.keys(profile.services).length > 0 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  Services configured
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {score < 100 && onImprove && (
          <Button onClick={onImprove} className="w-full" variant="outline">
            Improve Your Profile
          </Button>
        )}

        {/* Tips */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <strong>💡 Tip:</strong> Profiles with 80%+ completion get 3x more visibility in search results!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletenessWidget;
