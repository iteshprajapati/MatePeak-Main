
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "@/hooks/useExpertOnboardingForm";

export async function updateExpertProfile(data: FormValues) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to complete onboarding");
  }
  
  // Convert availability array to a JSON string
  const availabilityJson = JSON.stringify(data.availability);
  
  // First, check if profile exists
  const { data: existingProfile } = await supabase
    .from('expert_profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // Create profile data object
  const profileData = {
    full_name: `${data.firstName} ${data.lastName}`,
    username: data.username,
    category: data.category,
    services: {
      oneOnOneSession: data.oneOnOneSession,
      chatAdvice: data.chatAdvice,
      digitalProducts: data.digitalProducts,
      notes: data.notes,
    },
    availability_json: availabilityJson,
    ispaid: data.isPaid,
    pricing: data.pricePerSession,
    bio: data.bio,
    social_links: data.socialLinks,
    introduction: data.introduction,
    teaching_experience: data.teachingExperience,
    motivation: data.motivation,
    headline: data.headline,
    education: data.education,
  };

  if (existingProfile) {
    // Update existing profile
    const { error } = await supabase
      .from('expert_profiles')
      .update(profileData)
      .eq('id', user.id);
    
    if (error) throw error;
  } else {
    // Insert new profile
    const { error } = await supabase
      .from('expert_profiles')
      .insert({
        id: user.id,
        ...profileData,
      });
    
    if (error) throw error;
  }
  
  return { success: true, username: data.username };
}
