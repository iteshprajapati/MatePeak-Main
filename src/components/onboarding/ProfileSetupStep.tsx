
import { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Camera, Linkedin, Twitter, Instagram, User, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileSetupStep({ form }: { form: UseFormReturn<any> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("profilePicture", file);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Profile Setup</h3>
          <p className="text-gray-600 text-sm">Make your profile stand out with a photo and bio</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center mb-6 p-6 bg-gradient-to-br from-matepeak-primary/5 to-transparent rounded-lg border-2 border-dashed border-matepeak-primary/20 hover:border-matepeak-primary/40 transition-colors">
        <FormField
          control={form.control}
          name="profilePicture"
          render={() => (
            <FormItem className="space-y-3">
              <FormControl>
                <div
                  onClick={handleProfilePictureClick}
                  className="cursor-pointer"
                >
                  <Avatar className="h-28 w-28 cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <AvatarImage src={form.watch("profilePicture") ? URL.createObjectURL(form.watch("profilePicture")) : ""} />
                    <AvatarFallback className="bg-matepeak-primary/10 flex items-center justify-center">
                      <Camera className="h-10 w-10 text-matepeak-primary" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </FormControl>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <FormDescription className="text-center">
                Click to upload profile picture
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Bio</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Describe your expertise in 2-3 lines. Keep it engaging!</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormControl>
              <Textarea
                placeholder="Tell us about yourself, your expertise, and what mentees can expect from your sessions..."
                className="min-h-[120px] transition-all hover:border-matepeak-primary focus:border-matepeak-primary"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs text-right">
              {field.value?.length || 0} characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">Social Links</h4>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Optional: Add your social profiles to build credibility</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-gray-600">Connect your social profiles (optional)</p>
        
        <FormField
          control={form.control}
          name="socialLinks.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mr-2 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Input placeholder="LinkedIn profile URL" {...field} />
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
              <FormControl>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mr-2 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Input placeholder="Twitter profile URL" {...field} />
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
              <FormControl>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mr-2 bg-gradient-to-r from-[#FFDC80] via-[#F77737] to-[#C13584] text-white hover:opacity-90"
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                  <Input placeholder="Instagram profile URL" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
