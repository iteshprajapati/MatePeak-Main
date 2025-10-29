import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GraduationCap, 
  Award, 
  Calendar,
  BookOpen,
  CheckCircle
} from "lucide-react";

interface ProfileExperiencesProps {
  mentor: any;
}

export default function ProfileExperiences({ mentor }: ProfileExperiencesProps) {
  const education = Array.isArray(mentor.education) ? mentor.education : [];
  const certifications = Array.isArray(mentor.teaching_certifications) 
    ? mentor.teaching_certifications 
    : [];

  return (
    <div className="space-y-6">
      {/* Education Section */}
      {education.length > 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-matepeak-yellow rounded-lg">
                <GraduationCap className="h-5 w-5 text-matepeak-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
            </div>

            <div className="space-y-6">
              {education.map((edu: any, index: number) => (
                <div key={index}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-matepeak-light flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-matepeak-primary" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {edu.degree || "Degree"}
                      </h3>
                      <p className="text-matepeak-primary font-semibold">
                        {edu.institution || "Institution"}
                      </p>
                      {edu.field && (
                        <p className="text-gray-600 mt-1">Field: {edu.field}</p>
                      )}
                      {edu.year && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{edu.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < education.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teaching Certifications */}
      {certifications.length > 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-matepeak-yellow rounded-lg">
                <Award className="h-5 w-5 text-matepeak-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Teaching Certifications
              </h2>
            </div>

            <div className="grid gap-4">
              {certifications.map((cert: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-matepeak-light rounded-lg hover:bg-matepeak-yellow/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">
                        {cert.name || cert.title || "Certification"}
                      </h3>
                      {cert.issuer && (
                        <p className="text-sm text-gray-600 mt-1">
                          Issued by: {cert.issuer}
                        </p>
                      )}
                      {cert.year && (
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {cert.year}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Certificate Indicator */}
      {mentor.has_no_certificate && certifications.length === 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-matepeak-yellow rounded-lg">
                <Award className="h-5 w-5 text-matepeak-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Teaching Certifications
              </h2>
            </div>
            <p className="text-gray-600">
              This mentor has indicated they don't have formal teaching certifications,
              but brings valuable practical experience and knowledge.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Information Available */}
      {education.length === 0 && certifications.length === 0 && !mentor.has_no_certificate && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Education and certification information not provided yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
