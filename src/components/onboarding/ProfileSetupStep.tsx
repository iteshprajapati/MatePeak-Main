import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Camera, Linkedin, Twitter, Instagram, User, CheckCircle2, XCircle, Upload, Loader2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export default function ProfileSetupStep({ form }: { form: UseFormReturn<any> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG or PNG file");
      return;
    }

    // Validate file size (5MB max for profile pictures)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to upload profile picture");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/profile-picture.${fileExt}`;

      // Delete old profile picture if exists
      await supabase.storage
        .from("profile-pictures")
        .remove([fileName]);

      const { error: uploadError, data } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      form.setValue("profilePictureUrl", publicUrl);
      form.setValue("profilePicture", file);
      toast.success("Profile picture uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload profile picture");
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Complete Your Profile</h3>
          <p className="text-gray-600 text-sm">Add a professional photo and connect your social profiles</p>
        </div>
      </div>

      {/* Profile Picture Upload Section */}
      <Card className="border-2 border-matepeak-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-matepeak-primary" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-3">
              <FormField
                control={form.control}
                name="profilePicture"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Avatar className="h-32 w-32 cursor-pointer border-4 border-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                          <AvatarImage src={previewUrl || form.watch("profilePictureUrl") || ""} />
                          <AvatarFallback className="bg-matepeak-primary/10 flex items-center justify-center">
                            {uploading ? (
                              <Loader2 className="h-8 w-8 text-matepeak-primary animate-spin" />
                            ) : (
                              <Camera className="h-8 w-8 text-matepeak-primary" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {form.watch("profilePictureUrl") && !uploading && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={handleProfilePictureClick}
                disabled={uploading}
                className="bg-matepeak-primary hover:bg-matepeak-primary/90"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {form.watch("profilePictureUrl") ? "Change Photo" : "Upload Photo"}
                  </>
                )}
              </Button>
            </div>

            {/* Guidelines */}
            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Do's
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Use a clear, well-lit professional headshot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Ensure your face is clearly visible and centered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Wear professional or smart casual attire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Use a neutral or clean background</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Smile naturally to appear approachable</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Don'ts
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Avoid group photos or photos with other people</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Don't use selfies or casual vacation photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Avoid sunglasses, hats, or face-covering accessories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Don't use blurry, pixelated, or low-quality images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Avoid overly edited or filtered photos</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Format:</strong> JPG or PNG | <strong>Max size:</strong> 5MB | <strong>Recommended:</strong> Square format, minimum 400x400px
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Social Links Section */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Social Profiles (Optional)</CardTitle>
          <p className="text-sm text-gray-600">Connect your professional social profiles to build credibility</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="socialLinks.linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">LinkedIn</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                      <Linkedin className="h-5 w-5 text-white" />
                    </div>
                    <Input 
                      placeholder="https://linkedin.com/in/your-profile" 
                      {...field} 
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="socialLinks.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Twitter / X</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#1DA1F2] flex items-center justify-center flex-shrink-0">
                      <Twitter className="h-5 w-5 text-white" />
                    </div>
                    <Input 
                      placeholder="https://twitter.com/your-handle" 
                      {...field} 
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="socialLinks.instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Instagram</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFDC80] via-[#F77737] to-[#C13584] flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <Input 
                      placeholder="https://instagram.com/your-username" 
                      {...field} 
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
