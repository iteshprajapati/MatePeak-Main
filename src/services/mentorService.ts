import { supabase } from "@/integrations/supabase/client";

export interface MentorFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Get all mentors with optional filters
 */
export async function getMentors(filters?: MentorFilters) {
  let query = supabase
    .from('expert_profiles')
    .select(`
      *,
      profile:profiles(full_name, email, avatar_url, role),
      reviews(rating)
    `);
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.minPrice !== undefined) {
    query = query.gte('pricing', filters.minPrice);
  }
  
  if (filters?.maxPrice !== undefined) {
    query = query.lte('pricing', filters.maxPrice);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching mentors:', error);
    return { success: false, error: error.message, data: [] };
  }
  
  // Calculate average rating for each mentor
  const mentorsWithRating = data.map(mentor => ({
    ...mentor,
    averageRating: mentor.reviews.length > 0
      ? mentor.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / mentor.reviews.length
      : 0,
    totalReviews: mentor.reviews.length
  }));
  
  return { success: true, data: mentorsWithRating };
}

/**
 * Get a single mentor by ID
 */
export async function getMentorById(mentorId: string) {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select(`
      *,
      profile:profiles(full_name, email, avatar_url, role),
      reviews(
        id, 
        rating, 
        comment, 
        created_at,
        user:profiles(full_name, avatar_url)
      )
    `)
    .eq('id', mentorId)
    .single();
  
  if (error) {
    console.error('Error fetching mentor:', error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data };
}

/**
 * Create or update mentor profile (mentor only)
 */
export async function upsertMentorProfile(profileData: {
  category: string;
  experience: number;
  pricing: number;
  bio: string;
  availability_json: string;
  social_links?: Record<string, string>;
  username: string;
  full_name: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in', data: null };
  }
  
  // Update expert profile
  const { data: expertData, error: expertError } = await supabase
    .from('expert_profiles')
    .update({
      category: profileData.category,
      experience: profileData.experience,
      pricing: profileData.pricing,
      bio: profileData.bio,
      availability_json: profileData.availability_json,
      social_links: profileData.social_links as any,
      username: profileData.username,
      full_name: profileData.full_name
    })
    .eq('id', user.id)
    .select()
    .single();
  
  if (expertError) {
    console.error('Error updating mentor profile:', expertError);
    return { success: false, error: expertError.message, data: null };
  }
  
  return { success: true, message: 'Profile updated successfully', data: expertData };
}

/**
 * Get all categories
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data };
}
