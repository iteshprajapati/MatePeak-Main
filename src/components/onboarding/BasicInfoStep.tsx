
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { User, AtSign, Briefcase, HelpCircle, Mail, Globe, Languages as LanguagesIcon, Phone, Trash2, Plus, CheckCircle2, GraduationCap, Heart, Code, BookOpen, Palette, TrendingUp, Users } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define expertise options with icons
const expertiseOptions = [
  { 
    value: "Career Coaching", 
    icon: Briefcase, 
    description: "Resume, interviews, and job search tips",
    borderColor: "border-blue-300",
    hoverBg: "hover:bg-blue-50",
    iconColor: "text-blue-500"
  },
  { 
    value: "Academic Support", 
    icon: GraduationCap, 
    description: "Study skills, tutoring, and academic guidance",
    borderColor: "border-purple-300",
    hoverBg: "hover:bg-purple-50",
    iconColor: "text-purple-500"
  },
  { 
    value: "Mental Health", 
    icon: Heart, 
    description: "Wellness coaching and emotional support",
    borderColor: "border-pink-300",
    hoverBg: "hover:bg-pink-50",
    iconColor: "text-pink-500"
  },
  { 
    value: "Programming & Tech", 
    icon: Code, 
    description: "Coding, software development, and tech skills",
    borderColor: "border-green-300",
    hoverBg: "hover:bg-green-50",
    iconColor: "text-green-500"
  },
  { 
    value: "Test Preparation", 
    icon: BookOpen, 
    description: "SAT, GRE, and standardized test prep",
    borderColor: "border-teal-300",
    hoverBg: "hover:bg-teal-50",
    iconColor: "text-teal-500"
  },
  { 
    value: "Creative Arts", 
    icon: Palette, 
    description: "Design, music, writing, and creative skills",
    borderColor: "border-indigo-300",
    hoverBg: "hover:bg-indigo-50",
    iconColor: "text-indigo-500"
  },
  { 
    value: "Business & Finance", 
    icon: TrendingUp, 
    description: "Entrepreneurship, investing, and business strategy",
    borderColor: "border-orange-300",
    hoverBg: "hover:bg-orange-50",
    iconColor: "text-orange-500"
  },
  { 
    value: "Leadership & Development", 
    icon: Users, 
    description: "Personal growth and leadership coaching",
    borderColor: "border-yellow-300",
    hoverBg: "hover:bg-yellow-50",
    iconColor: "text-yellow-600"
  },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India", "Germany", "France", 
  "Spain", "Italy", "Japan", "China", "South Korea", "Brazil", "Mexico", "Argentina",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark",
  "Finland", "Poland", "Russia", "Turkey", "South Africa", "Egypt", "Nigeria", "Kenya",
  "Singapore", "Malaysia", "Thailand", "Indonesia", "Philippines", "Vietnam", "Pakistan",
  "Bangladesh", "New Zealand", "Ireland", "Portugal", "Greece", "Czech Republic"
].sort();

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese",
  "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Urdu", "Indonesian", "Turkish",
  "Vietnamese", "Thai", "Dutch", "Swedish", "Polish", "Greek", "Hebrew"
].sort();

const LANGUAGE_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

export default function BasicInfoStep({ form }: { form: UseFormReturn<any> }) {
  const languages = form.watch("languages") || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllExpertise, setShowAllExpertise] = useState(false);
  
  const addLanguage = () => {
    const currentLanguages = form.getValues("languages") || [];
    form.setValue("languages", [...currentLanguages, { language: "", level: "" }]);
  };
  
  const removeLanguage = (index: number) => {
    const currentLanguages = form.getValues("languages");
    form.setValue("languages", currentLanguages.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-matepeak-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-matepeak-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Tell us a bit about yourself</h3>
          <p className="text-gray-600 text-sm">This helps students discover the right mentors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4 text-matepeak-primary" />
                First Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="John" 
                  {...field} 
                  className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4 text-matepeak-primary" />
                Last Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Doe" 
                  {...field} 
                  className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-matepeak-primary" />
              Email
            </FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="your@email.com" 
                {...field} 
                className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
              />
            </FormControl>
            <FormDescription className="text-xs">
              Auto-filled if available from signup
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel className="flex items-center gap-2">
                <AtSign className="w-4 h-4 text-matepeak-primary" />
                Username
              </FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This will be your unique profile URL</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  matepeak.com/
                </span>
                <Input 
                  placeholder="johndoe" 
                  {...field} 
                  className="pl-[140px] h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
                />
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              Choose a unique username for your profile
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="countryOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-matepeak-primary" />
              Country of Birth
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">

                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-60 overflow-y-auto bg-white z-50">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2 mb-4">
              <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="w-5 h-5 text-matepeak-primary" />
                Choose Your Expertise
              </FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the main area where you provide mentorship</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FormDescription className="mb-4">
              Choose one area that best describes your skills
            </FormDescription>

            <Input
              type="text"
              placeholder="Search expertise…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-4 h-11 bg-gray-50 border-gray-300 focus:border-black"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {expertiseOptions
                .filter(option => 
                  option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  option.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, showAllExpertise ? undefined : 4)
                .map((option) => {
                  const Icon = option.icon;
                  const isSelected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`
                        group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 
                        bg-white shadow-sm transition-all duration-300 ease-in-out
                        hover:shadow-md hover:-translate-y-1
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                        ${isSelected 
                          ? `${option.borderColor} border-opacity-100 ring-2 ring-matepeak-primary ring-offset-2` 
                          : `border-gray-200 ${option.hoverBg}`
                        }
                      `}
                    >
                      {isSelected && (
                        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-matepeak-primary" />
                      )}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                        isSelected ? 'bg-matepeak-primary/10' : 'bg-gray-50 group-hover:bg-gray-100'
                      }`}>
                        <Icon className={`h-7 w-7 ${isSelected ? 'text-matepeak-primary' : option.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <h3 className={`text-base font-semibold mb-1 ${
                          isSelected ? 'text-matepeak-primary' : 'text-gray-800'
                        }`}>
                          {option.value}
                        </h3>
                        <p className="text-sm text-gray-500 leading-snug">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
            
            {!searchQuery && !showAllExpertise && expertiseOptions.length > 4 && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllExpertise(true)}
                  className="text-sm font-medium text-matepeak-primary hover:text-matepeak-secondary transition-colors flex items-center gap-1"
                >
                  Show more options
                  <span className="text-xs">({expertiseOptions.length - 4} more)</span>
                </button>
              </div>
            )}
            
            {!searchQuery && showAllExpertise && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllExpertise(false)}
                  className="text-sm font-medium text-matepeak-primary hover:text-matepeak-secondary transition-colors"
                >
                  Show less
                </button>
              </div>
            )}
            
            {searchQuery && expertiseOptions.filter(option => 
              option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
              option.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <p className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                No expertise areas match your search.
              </p>
            )}

            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="flex items-center gap-2">
            <LanguagesIcon className="w-4 h-4 text-matepeak-primary" />
            Languages You Speak
          </FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLanguage}
            className="h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Language
          </Button>
        </div>

        {languages.map((_, index: number) => (
          <div key={index} className="flex gap-2 items-start">
            <FormField
              control={form.control}
              name={`languages.${index}.language`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">

                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white z-50 max-h-60">
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`languages.${index}.level`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white z-50">
                      {LANGUAGE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLanguage(index)}
              className="h-11 w-11 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        {languages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
            Click "Add Language" to add languages you speak
          </p>
        )}
      </div>

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-matepeak-primary" />
              Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="tel"
                placeholder="+1 234 567 8900" 
                {...field} 
                className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ageConfirmation"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 p-4 bg-gray-50">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-medium cursor-pointer">
                I confirm I'm over 18
              </FormLabel>
              <FormDescription className="text-xs">
                You must be at least 18 years old to become a mentor on MatePeak
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
