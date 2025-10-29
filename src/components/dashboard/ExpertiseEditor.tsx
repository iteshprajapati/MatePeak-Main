import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Check, Tag, Briefcase, GraduationCap, Heart, Code, BookOpen, Palette, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Define expertise options with icons and specialized tags
const expertiseOptions = [
  { 
    value: "Career Coaching", 
    icon: Briefcase, 
    description: "Resume, interviews, and job search tips",
    borderColor: "border-blue-300",
    hoverBg: "hover:bg-blue-50",
    iconColor: "text-blue-500",
    tags: [
      "Resume Writing", "Interview Preparation", "LinkedIn Optimization", 
      "Career Transition", "Salary Negotiation", "Personal Branding",
      "Job Search Strategy", "Networking", "Professional Development"
    ]
  },
  { 
    value: "Academic Support", 
    icon: GraduationCap, 
    description: "Study skills, tutoring, and academic guidance",
    borderColor: "border-purple-300",
    hoverBg: "hover:bg-purple-50",
    iconColor: "text-purple-500",
    tags: [
      "Mathematics", "Science", "English Literature", "Essay Writing",
      "Study Skills", "Time Management", "Exam Preparation", "Homework Help",
      "Critical Thinking", "Research Methods"
    ]
  },
  { 
    value: "Mental Health", 
    icon: Heart, 
    description: "Wellness coaching and emotional support",
    borderColor: "border-pink-300",
    hoverBg: "hover:bg-pink-50",
    iconColor: "text-pink-500",
    tags: [
      "Stress Management", "Anxiety Support", "Mindfulness", "Self-Care",
      "Work-Life Balance", "Confidence Building", "Goal Setting",
      "Emotional Intelligence", "Resilience Training"
    ]
  },
  { 
    value: "Programming & Tech", 
    icon: Code, 
    description: "Coding, software development, and tech skills",
    borderColor: "border-green-300",
    hoverBg: "hover:bg-green-50",
    iconColor: "text-green-500",
    tags: [
      "Web Development", "Python", "JavaScript", "React", "Data Science",
      "Machine Learning", "Mobile Development", "DevOps", "Database Design",
      "Algorithms", "System Design", "Cloud Computing", "Cybersecurity"
    ]
  },
  { 
    value: "Test Preparation", 
    icon: BookOpen, 
    description: "SAT, GRE, and standardized test prep",
    borderColor: "border-teal-300",
    hoverBg: "hover:bg-teal-50",
    iconColor: "text-teal-500",
    tags: [
      "SAT Prep", "GRE Prep", "GMAT Prep", "IELTS", "TOEFL",
      "ACT Prep", "MCAT", "LSAT", "Test Strategy", "Time Management"
    ]
  },
  { 
    value: "Creative Arts", 
    icon: Palette, 
    description: "Design, music, writing, and creative skills",
    borderColor: "border-indigo-300",
    hoverBg: "hover:bg-indigo-50",
    iconColor: "text-indigo-500",
    tags: [
      "Graphic Design", "UI/UX Design", "Creative Writing", "Music Theory",
      "Photography", "Video Editing", "Digital Art", "Animation",
      "Content Creation", "Storytelling"
    ]
  },
  { 
    value: "Business & Finance", 
    icon: TrendingUp, 
    description: "Entrepreneurship, investing, and business strategy",
    borderColor: "border-orange-300",
    hoverBg: "hover:bg-orange-50",
    iconColor: "text-orange-500",
    tags: [
      "Entrepreneurship", "Business Strategy", "Financial Planning",
      "Investment Basics", "Marketing", "Sales", "Accounting",
      "Business Analytics", "Startup Advice", "Fundraising"
    ]
  },
  { 
    value: "Leadership & Development", 
    icon: Users, 
    description: "Personal growth and leadership coaching",
    borderColor: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
    iconColor: "text-yellow-600",
    tags: [
      "Leadership Skills", "Team Management", "Public Speaking",
      "Communication Skills", "Conflict Resolution", "Decision Making",
      "Personal Growth", "Productivity", "Coaching Skills"
    ]
  },
];

interface ExpertiseEditorProps {
  mentorProfile: any;
  onProfileUpdate: (profile: any) => void;
}

const ExpertiseEditor = ({ mentorProfile, onProfileUpdate }: ExpertiseEditorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Initialize state with existing data
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    mentorProfile.categories || (mentorProfile.category ? [mentorProfile.category] : [])
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    mentorProfile.expertise_tags || []
  );

  // Get available tags based on selected categories
  const availableTags = selectedCategories.length > 0 
    ? expertiseOptions
        .filter(opt => selectedCategories.includes(opt.value))
        .flatMap(opt => opt.tags)
    : [];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Remove tags that are no longer available
      if (prev.includes(category)) {
        const removedOption = expertiseOptions.find(opt => opt.value === category);
        if (removedOption) {
          setSelectedTags(currentTags => 
            currentTags.filter(tag => !removedOption.tags.includes(tag))
          );
        }
      }
      
      return newCategories;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Expertise required",
        description: "Please select at least one area of expertise",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("expert_profiles")
        .update({
          categories: selectedCategories,
          category: selectedCategories[0], // Keep for backward compatibility
          expertise_tags: selectedTags,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mentorProfile.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);

      toast({
        title: "Expertise updated",
        description: "Your areas of expertise have been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating expertise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update expertise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Areas of Expertise
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Select your expertise areas and specific skills to help students find you
        </p>
      </div>
      <CardContent className="p-6 space-y-6">
        {/* Expertise Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Expertise Areas <span className="text-red-600">*</span>
          </Label>
          <p className="text-xs text-gray-500">
            Select all areas that apply to you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expertiseOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedCategories.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleCategory(option.value)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 text-left transition-all group",
                    "hover:shadow-md",
                    option.borderColor,
                    option.hoverBg,
                    isSelected
                      ? "bg-gradient-to-br from-white to-gray-50 shadow-md ring-2 ring-offset-2 ring-gray-900"
                      : "bg-white hover:border-gray-400"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-white shadow-sm",
                      isSelected && "shadow-md"
                    )}>
                      <Icon className={cn("w-5 h-5", option.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {option.value}
                        </p>
                        {isSelected && (
                          <div className="ml-auto flex-shrink-0 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expertise Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  Specific Skills & Specializations
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Select the specific skills you can teach (optional but recommended)
                </p>
              </div>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="bg-gray-900 text-white">
                  {selectedTags.length} selected
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      "border-2",
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm hover:bg-gray-800"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={loading || selectedCategories.length === 0}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Expertise
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpertiseEditor;
