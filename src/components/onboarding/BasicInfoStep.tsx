
import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { User, AtSign, Briefcase, HelpCircle, Mail, Globe, Languages as LanguagesIcon, Phone, Trash2, Plus, CheckCircle2, GraduationCap, Heart, Code, BookOpen, Palette, TrendingUp, Users, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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

const COUNTRY_CODES = [
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
];

export default function BasicInfoStep({ form }: { form: UseFormReturn<any> }) {
  const languages = form.watch("languages") || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllExpertise, setShowAllExpertise] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  
  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const username = form.watch("username");
  
  // Get form errors for visual feedback
  const errors = form.formState.errors;
  
  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      setSuggestedUsernames([]);
      return;
    }
    
    // Validate username format first
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameStatus('idle');
      setSuggestedUsernames([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [username]);
  
  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus('checking');
    
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking username:', error);
        setUsernameStatus('idle');
        return;
      }
      
      if (data) {
        setUsernameStatus('taken');
        generateUsernameSuggestions(username);
      } else {
        setUsernameStatus('available');
        setSuggestedUsernames([]);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus('idle');
    }
  };
  
  const generateUsernameSuggestions = (baseUsername: string) => {
    const suggestions: string[] = [];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const year = new Date().getFullYear();
    
    suggestions.push(`${baseUsername}${randomNum}`);
    suggestions.push(`${baseUsername}_${randomNum}`);
    suggestions.push(`${baseUsername}${year}`);
    suggestions.push(`${baseUsername}_official`);
    suggestions.push(`the_${baseUsername}`);
    
    setSuggestedUsernames(suggestions.slice(0, 3));
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('username', suggestion);
  };
  
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
                First Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="John" 
                  {...field} 
                  className={cn(
                    "h-11 bg-gray-50 border-gray-300 focus:border-black transition-all",
                    errors.firstName && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  )}
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
                Last Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Doe" 
                  {...field} 
                  className={cn(
                    "h-11 bg-gray-50 border-gray-300 focus:border-black transition-all",
                    errors.lastName && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  )}
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
              Email <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="your@email.com" 
                {...field} 
                className={cn(
                  "h-11 bg-gray-50 border-gray-300 focus:border-black transition-all",
                  errors.email && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                )}
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
                Username <span className="text-red-500">*</span>
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm z-10">
                  matepeak.com/
                </span>
                <Input 
                  placeholder="johndoe" 
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    field.onChange(value);
                  }}
                  className={cn(
                    "pl-[140px] pr-10 h-11 bg-gray-50 border-gray-300 focus:border-black transition-all",
                    errors.username && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200",
                    usernameStatus === 'available' && "border-green-500 bg-green-50",
                    usernameStatus === 'taken' && "border-red-500 bg-red-50"
                  )}
                />
                {/* Status indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  )}
                  {usernameStatus === 'available' && (
                    <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                  )}
                  {usernameStatus === 'taken' && (
                    <X className="w-5 h-5 text-red-600" strokeWidth={3} />
                  )}
                </div>
              </div>
            </FormControl>
            
            {/* Status messages */}
            {usernameStatus === 'available' && field.value && field.value.length >= 3 && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2 mt-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Username is available!</span>
              </div>
            )}
            
            {usernameStatus === 'taken' && (
              <div className="space-y-2 mt-2">
                <div className="flex items-start gap-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Username is already taken</span>
                </div>
                
                {suggestedUsernames.length > 0 && (
                  <div className="px-1 py-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Try these suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedUsernames.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <AtSign className="w-3 h-3" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <FormDescription className="text-xs">
              Choose a unique username for your profile (lowercase letters, numbers, - and _ only)
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
              Country of Birth <span className="text-red-500">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className={cn(
                  "h-11 bg-gray-50 border-gray-300 focus:border-black transition-all",
                  errors.countryOfBirth && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                )}>

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
          <FormItem data-field="category">
            <div className="flex items-center gap-2 mb-4">
              <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="w-5 h-5 text-matepeak-primary" />
                Choose Your Expertise <span className="text-red-500">*</span>
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

      <div className={cn(
        "space-y-4 transition-all",
        errors.languages && "border-2 border-red-500 bg-red-50 rounded-lg p-4"
      )} data-field="languages">
        <div className="flex items-center justify-between mb-2">
          <FormLabel className="flex items-center gap-2 text-base">
            <LanguagesIcon className="w-4 h-4 text-matepeak-primary" />
            Languages You Speak <span className="text-red-500">*</span>
          </FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLanguage}
            className="h-9 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Language
          </Button>
        </div>

        <div className="space-y-3">
          {languages.map((_, index: number) => (
            <div key={index} className="flex gap-3 items-center">
              <FormField
                control={form.control}
                name={`languages.${index}.language`}
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-1">
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
                  <FormItem className="flex-1 space-y-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all">
                          <SelectValue placeholder="Proficiency level" />
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
                className="h-11 w-11 flex-shrink-0 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {languages.length === 0 && (
          <p className={cn(
            "text-sm text-center py-4 border-2 border-dashed rounded-lg",
            errors.languages ? "text-red-600 border-red-300 bg-red-50" : "text-gray-500 border-gray-200"
          )}>
            Click "Add Language" to add languages you speak
          </p>
        )}
        
        {errors.languages && (
          <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-2 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Please add at least one language you speak</span>
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
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="h-11 w-32 bg-gray-50 border-gray-300 focus:border-black transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 max-h-60">
                  {COUNTRY_CODES.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.flag}</span>
                        <span className="font-medium">{item.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormControl>
                <div className="relative flex-1">
                  <Input 
                    type="tel"
                    placeholder="234 567 8900" 
                    {...field}
                    value={field.value?.replace(/^\+\d+\s*/, '') || ''}
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^\d\s]/g, '');
                      field.onChange(`${countryCode} ${phoneNumber}`);
                    }}
                    className="h-11 bg-gray-50 border-gray-300 focus:border-black transition-all"
                  />
                </div>
              </FormControl>
            </div>
            <FormDescription className="text-xs">
              Select country code and enter your phone number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ageConfirmation"
        render={({ field }) => (
          <FormItem data-field="ageConfirmation" className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-medium cursor-pointer">
                I confirm I'm over 18 <span className="text-red-500">*</span>
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
