import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Camera, Upload, Eye, Globe, Plus, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImageEditor from "@/components/onboarding/ImageEditor";
import ExpertiseEditor from "@/components/dashboard/ExpertiseEditor";
import DeleteAccountDialog from "@/components/dashboard/DeleteAccountDialog";
import { deleteAccount } from "@/services/authService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch",
  "Russian", "Chinese (Mandarin)", "Chinese (Cantonese)", "Japanese", "Korean",
  "Arabic", "Hindi", "Bengali", "Punjabi", "Urdu", "Turkish", "Polish",
  "Vietnamese", "Thai", "Indonesian", "Malay", "Tagalog", "Swahili", "Hebrew",
  "Greek", "Swedish", "Norwegian", "Danish", "Finnish", "Czech", "Hungarian",
  "Romanian", "Ukrainian", "Other"
];

const LANGUAGE_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic"
];

interface ProfileManagementProps {
  mentorProfile: any;
  onProfileUpdate: (profile: any) => void;
}

const ProfileManagement = ({
  mentorProfile,
  onProfileUpdate,
}: ProfileManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    first_name: mentorProfile.full_name?.split(' ')[0] || "",
    last_name: mentorProfile.full_name?.split(' ').slice(1).join(' ') || "",
    headline: mentorProfile.headline || "",
    introduction: mentorProfile.introduction || "",
    teaching_experience: mentorProfile.teaching_experience || "",
    motivation: mentorProfile.motivation || "",
    languages: mentorProfile.languages || [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [...prev.languages, { language: "", level: "" }],
    }));
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleLanguageChange = (index: number, field: "language" | "level", value: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang: any, i: number) =>
        i === index ? { ...lang, [field]: value } : lang
      ),
    }));
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
    if (!formData.first_name.trim()) {
      toast({
        title: "First name required",
        description: "Please provide your first name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.last_name.trim()) {
      toast({
        title: "Last name required",
        description: "Please provide your last name",
        variant: "destructive",
      });
      return;
    }

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

      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;

      const { data, error } = await supabase
        .from("expert_profiles")
        .update({
          full_name: fullName,
          headline: formData.headline.trim(),
          introduction: formData.introduction.trim(),
          teaching_experience: formData.teaching_experience.trim(),
          motivation: formData.motivation.trim(),
          languages: formData.languages.filter(
            (lang: any) => lang.language && lang.level
          ),
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

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();

      if (result.success) {
        toast({
          title: "Account Deleted",
          description: result.message || "Your account has been permanently deleted.",
        });

        // Navigate to home page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600 mt-1">
            Update your profile information and settings
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/mentor/${mentorProfile.username}`)}
          className="flex items-center gap-2 bg-white hover:bg-matepeak-yellow hover:border-matepeak-primary transition-all"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">View Public Profile</span>
        </Button>
      </div>

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

      {/* Expertise Editor */}
      <ExpertiseEditor
        mentorProfile={mentorProfile}
        onProfileUpdate={onProfileUpdate}
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
            {/* Name Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium text-gray-900">
                  First Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="transition-all bg-gray-50 border-gray-300 focus:bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-900">
                  Last Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="transition-all bg-gray-50 border-gray-300 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                value={mentorProfile.email || "Not available"}
                className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed from this page
              </p>
            </div>

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
                className="transition-all bg-gray-50 border-gray-300 focus:bg-white"
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
                className="transition-all resize-none bg-gray-50 border-gray-300 focus:bg-white"
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
                className="transition-all resize-none bg-gray-50 border-gray-300 focus:bg-white"
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
                className="transition-all resize-none bg-gray-50 border-gray-300 focus:bg-white"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.motivation.length}/500 characters
              </p>
            </div>

            {/* Languages Section */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  Languages You Speak
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLanguage}
                  className="border-gray-300 hover:border-gray-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Language
                </Button>
              </div>
              
              {formData.languages.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No languages added yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add languages to help students find you
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.languages.map((lang: any, index: number) => (
                    <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Language</Label>
                          <Select
                            value={lang.language}
                            onValueChange={(value) => handleLanguageChange(index, "language", value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {LANGUAGES.map((language) => (
                                <SelectItem key={language} value={language}>
                                  {language}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Proficiency</Label>
                          <Select
                            value={lang.level}
                            onValueChange={(value) => handleLanguageChange(index, "level", value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGE_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLanguage(index)}
                        className="h-9 w-9 flex-shrink-0 hover:bg-red-50 hover:text-red-600 transition-colors mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Expertise Areas</p>
              <div className="flex flex-wrap gap-2">
                {(mentorProfile.categories || [mentorProfile.category]).filter(Boolean).map((cat: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300"
                  >
                    {cat}
                  </span>
                ))}
                {(!mentorProfile.categories || mentorProfile.categories.length === 0) && !mentorProfile.category && (
                  <span className="text-sm text-gray-500">No expertise areas set</span>
                )}
              </div>
            </div>
            {mentorProfile.expertise_tags && mentorProfile.expertise_tags.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600 mb-2">Specific Skills</p>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.expertise_tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Delete Account */}
      <Card className="border-red-200 bg-red-50/50">
        <div className="p-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="text-base font-semibold text-red-900">
              Danger Zone
            </h3>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Delete Your Account
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="flex items-start gap-1.5 text-xs text-gray-500">
                <ShieldAlert className="h-3.5 w-3.5 mt-0.5 text-red-500 flex-shrink-0" />
                <span>All sessions, reviews, earnings history, and profile information will be removed.</span>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              size="sm"
              className="gap-1.5 flex-shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteAccount}
        mentorEmail={mentorProfile.email}
      />
    </div>
  );
};

export default ProfileManagement;
