import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Camera, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import ImageEditor from "@/components/onboarding/ImageEditor";

interface ProfileManagementProps {
  mentorProfile: any;
  onProfileUpdate: (profile: any) => void;
}

const ProfileManagement = ({
  mentorProfile,
  onProfileUpdate,
}: ProfileManagementProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    headline: mentorProfile.headline || "",
    introduction: mentorProfile.introduction || "",
    teaching_experience: mentorProfile.teaching_experience || "",
    motivation: mentorProfile.motivation || "",
  });

  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = {
      'Profile Picture': mentorProfile.profile_picture_url,
      'Headline': mentorProfile.headline,
      'Introduction': mentorProfile.introduction,
      'Teaching Experience': mentorProfile.teaching_experience,
      'Motivation': mentorProfile.motivation,
      'Expertise': mentorProfile.expertise?.length > 0,
      'Hourly Rate': mentorProfile.hourly_rate,
      'Languages': mentorProfile.languages?.length > 0,
    };

    const completed = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;
    const percentage = Math.round((completed / totalFields) * 100);
    const missingFields = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    return { completed, totalFields, percentage, missingFields };
  };

  const completeness = calculateCompleteness();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Open image editor
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setEditorOpen(true);
  };

  const handleSaveEditedImage = async (editedBlob: Blob) => {
    setUploadingImage(true);
    setPreviewUrl(URL.createObjectURL(editedBlob));

    try {
      const fileName = `${mentorProfile.id}/profile-picture.jpg`;

      // Delete old profile picture if exists
      await supabase.storage
        .from("profile-pictures")
        .remove([fileName]);

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, editedBlob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      // Add cache-busting parameter to force refresh
      const publicUrlWithCache = `${publicUrl}?t=${Date.now()}`;

      // Update profile in database
      const { data, error } = await supabase
        .from("expert_profiles")
        .update({
          profile_picture_url: publicUrlWithCache,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mentorProfile.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
      setPreviewUrl("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.headline.trim()) {
      toast({
        title: "Headline required",
        description: "Please provide a headline for your profile",
        variant: "destructive",
      });
      return;
    }

    if (!formData.introduction.trim()) {
      toast({
        title: "Introduction required",
        description: "Please provide an introduction about yourself",
        variant: "destructive",
      });
      return;
    }

    if (formData.headline.length > 100) {
      toast({
        title: "Headline too long",
        description: "Headline must be 100 characters or less",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("expert_profiles")
        .update({
          headline: formData.headline.trim(),
          introduction: formData.introduction.trim(),
          teaching_experience: formData.teaching_experience.trim(),
          motivation: formData.motivation.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", mentorProfile.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-gray-600 mt-1">
          Update your profile information and settings
        </p>
      </div>

      {/* Profile Completeness Indicator */}
      <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {completeness.percentage === 100 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Profile Complete!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                    Complete Your Profile
                  </>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {completeness.percentage === 100
                  ? "Your profile is fully optimized to attract students"
                  : "Complete your profile to increase visibility and bookings"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {completeness.percentage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {completeness.completed}/{completeness.totalFields} fields
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={completeness.percentage} className="h-2" />
            {completeness.percentage < 100 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <p className="text-sm font-medium text-gray-700 w-full">
                  Missing fields:
                </p>
                {completeness.missingFields.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300"
                  >
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture Section */}
      <Card className="border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Profile Picture
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer border-4 border-white shadow-md hover:shadow-lg transition-all">
                <AvatarImage
                  src={previewUrl || mentorProfile.profile_picture_url || ""}
                  alt="Profile"
                  onClick={handleProfilePictureClick}
                />
                <AvatarFallback
                  className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={handleProfilePictureClick}
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleProfilePictureClick}
                disabled={uploadingImage}
                className="border-2 border-gray-300 hover:border-black hover:bg-gray-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG or PNG | Max 5MB | Recommended: 400x400px
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Image Editor Modal */}
      <ImageEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        imageUrl={tempImageUrl}
        onSave={handleSaveEditedImage}
      />

      {/* Basic Information */}
      <Card className="border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h3>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-sm font-medium text-gray-900">
                Headline <span className="text-red-600">*</span>
              </Label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Expert Software Engineer | 10+ Years Experience"
                className="transition-all"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.headline.length}/100 characters
              </p>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <Label htmlFor="introduction" className="text-sm font-medium text-gray-900">
                Introduction <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="introduction"
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                placeholder="Tell students about yourself, your background, and expertise..."
                rows={5}
                className="transition-all resize-none"
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.introduction.length}/1000 characters
              </p>
            </div>

            {/* Teaching Experience */}
            <div className="space-y-2">
              <Label htmlFor="teaching_experience" className="text-sm font-medium text-gray-900">
                Teaching Experience
              </Label>
              <Textarea
                id="teaching_experience"
                name="teaching_experience"
                value={formData.teaching_experience}
                onChange={handleChange}
                placeholder="Describe your teaching or mentoring experience..."
                rows={4}
                className="transition-all resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {formData.teaching_experience.length}/1000 characters
              </p>
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <Label htmlFor="motivation" className="text-sm font-medium text-gray-900">
                Why You Love Teaching
              </Label>
              <Textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                placeholder="Share what motivates you to teach and mentor others..."
                rows={4}
                className="transition-all resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.motivation.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Profile Information
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm text-gray-900 mt-1">{mentorProfile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Username</p>
              <p className="text-sm text-gray-900 mt-1">@{mentorProfile.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Expertise</p>
              <p className="text-sm text-gray-900 mt-1">{mentorProfile.category || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
