import { supabase } from "@/integrations/supabase/client";
import { MentorProfile } from "@/components/MentorCard";

/**
 * Service to sync expert_profiles data with mentor cards
 * Transforms database profiles into MentorCard format
 */

export interface ExpertProfileData {
  id: string;
  full_name: string;
  username: string;
  category?: string;
  categories?: string[];
  expertise_tags?: string[];
  bio?: string;
  profile_picture_url?: string;
  service_pricing?: any;
  services?: any;
  profiles?: {
    avatar_url?: string;
  };
  experience?: number;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    year?: number;
  }>;
  headline?: string;
}

/**
 * Generate a professional tagline based on mentor's credentials
 * Format: "Experience Level @ Institution | Field/Category"
 * Examples: 
 * - "Senior @ IIT Delhi | Computer Science"
 * - "5+ years @ Google | Software Engineering"
 * - "Expert @ MIT | Data Science"
 */
function generateTagline(profile: ExpertProfileData): string {
  const parts: string[] = [];
  
  // Experience level
  if (profile.experience) {
    if (profile.experience >= 10) {
      parts.push("Senior");
    } else if (profile.experience >= 5) {
      parts.push(`${profile.experience}+ years`);
    } else if (profile.experience >= 2) {
      parts.push(`${profile.experience} years`);
    }
  }
  
  // Institution from education (use most recent/first entry)
  let institution = "";
  if (profile.education && profile.education.length > 0) {
    const latestEducation = profile.education[0];
    if (latestEducation.institution) {
      // Extract short form if it's a long name (e.g., "Indian Institute of Technology Delhi" -> "IIT Delhi")
      institution = latestEducation.institution;
      
      // Common abbreviations
      institution = institution
        .replace(/Indian Institute of Technology/gi, "IIT")
        .replace(/National Institute of Technology/gi, "NIT")
        .replace(/International Institute of Information Technology/gi, "IIIT")
        .replace(/Indian Institute of Management/gi, "IIM")
        .replace(/Massachusetts Institute of Technology/gi, "MIT")
        .replace(/University of California/gi, "UC")
        .replace(/Indian Institute of Science/gi, "IISc");
    }
  }
  
  // Field of study or main category
  let field = "";
  if (profile.education && profile.education.length > 0 && profile.education[0].field) {
    field = profile.education[0].field;
  } else if (profile.categories && profile.categories.length > 0) {
    field = profile.categories[0];
  } else if (profile.category) {
    field = profile.category;
  }
  
  // Build tagline
  let tagline = "";
  
  if (parts.length > 0 && institution) {
    tagline = `${parts.join(" ")} @ ${institution}`;
  } else if (institution) {
    tagline = institution;
  } else if (parts.length > 0) {
    tagline = parts.join(" ");
  }
  
  if (field) {
    if (tagline) {
      tagline += ` | ${field}`;
    } else {
      tagline = field;
    }
  }
  
  return tagline;
}

/**
 * Transform expert profile data into MentorCard format
 */
export function transformToMentorCard(profile: ExpertProfileData): MentorProfile {
  // Calculate pricing from service_pricing
  const getLowestPrice = () => {
    if (!profile.service_pricing) return 0;
    
    const prices: number[] = [];
    
    Object.values(profile.service_pricing).forEach((service: any) => {
      if (service?.enabled && service?.price) {
        prices.push(service.price);
      }
    });
    
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Extract connection options from services
  const getConnectionOptions = () => {
    const options: string[] = [];
    
    if (profile.services) {
      if (profile.services.oneOnOneSession) options.push("1:1 Call");
      if (profile.services.chatAdvice) options.push("Chat");
      if (profile.services.digitalProducts) options.push("Document Review");
      if (profile.services.notes) options.push("Group Session");
    }
    
    return options.length > 0 ? options : ["1:1 Call"];
  };

  // Use categories array or fallback to single category
  const categories = profile.categories && profile.categories.length > 0 
    ? profile.categories 
    : profile.category 
      ? [profile.category] 
      : [];

  return {
    id: profile.id,
    name: profile.full_name,
    title: profile.category || categories[0] || "Expert",
    image: profile.profile_picture_url || profile.profiles?.avatar_url || "",
    categories: categories,
    rating: 0, // Default rating for new mentors
    reviewCount: 0, // Will be updated when reviews are added
    price: getLowestPrice(),
    bio: profile.bio || "",
    connectionOptions: getConnectionOptions(),
    username: profile.username,
    expertise_tags: profile.expertise_tags || [],
    tagline: profile.headline || generateTagline(profile),
  };
}

/**
 * Fetch all active mentor profiles and transform to card format
 */
export async function fetchMentorCards(filters?: {
  category?: string;
  expertise?: string;
  searchQuery?: string;
  priceRange?: [number, number];
}): Promise<MentorProfile[]> {
  try {
    console.log('🔍 Fetching mentors with filters:', filters);
    
    // First, let's check if ANY mentors exist at all
    const { count: totalCount } = await supabase
      .from("expert_profiles")
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total mentors in database: ${totalCount}`);
    
    // Fetch expert profiles and profiles separately like FeaturedMentors does
    // Fetch all mentors - we'll filter client-side for better reliability
    let query = supabase
      .from("expert_profiles")
      .select('*');

    // Note: We fetch ALL mentors and filter client-side to handle:
    // - Complex searches with spaces
    // - Array field searches (expertise_tags, categories)
    // - Multiple filter combinations
    // This works well for moderate datasets (< 1000 mentors)

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }

    console.log(`📊 Found ${data?.length || 0} mentors from database query`);

    // Fetch profiles separately for avatar_url
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, avatar_url");

    if (profilesError) {
      console.error('⚠️ Error fetching profiles:', profilesError);
    }

    // Create a map of profiles by id for quick lookup
    const profilesMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    // Transform to MentorCard format
    let mentorCards = (data || []).map((profile, index) => {
      try {
        // Attach profile avatar if exists
        const userProfile = profilesMap.get(profile.id);
        const profileWithAvatar = {
          ...profile,
          profiles: userProfile ? { avatar_url: userProfile.avatar_url } : null,
        };
        
        return transformToMentorCard(profileWithAvatar);
      } catch (err) {
        console.error(`⚠️ Error transforming mentor profile at index ${index}:`, err, profile);
        return null;
      }
    }).filter(Boolean) as MentorProfile[];

    // Apply additional client-side filtering for better search across array fields
    if (filters?.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase().trim();
      
      console.log(`🔍 Searching for "${searchLower}" across all fields...`);
      
      mentorCards = mentorCards.filter((card) => {
        // Check if search term matches any expertise tag
        const expertiseMatch = card.expertise_tags?.some((exp: string) =>
          exp.toLowerCase().includes(searchLower)
        );
        
        // Check if search term matches any category
        const categoryMatch = card.categories?.some((cat: string) =>
          cat.toLowerCase().includes(searchLower)
        );
        
        // Check if search term matches tagline (contains institution, field, etc.)
        const taglineMatch = card.tagline?.toLowerCase().includes(searchLower);

        // Check name, bio, title
        const nameMatch = card.name.toLowerCase().includes(searchLower);
        const bioMatch = card.bio?.toLowerCase().includes(searchLower);
        const titleMatch = card.title?.toLowerCase().includes(searchLower);

        // Debug: Log matches for first few mentors
        if (nameMatch || bioMatch || titleMatch || expertiseMatch || categoryMatch || taglineMatch) {
          console.log(`  ✅ Match found in ${card.name}:`, {
            name: nameMatch,
            bio: bioMatch,
            title: titleMatch,
            expertise: expertiseMatch ? card.expertise_tags?.filter(e => e.toLowerCase().includes(searchLower)) : false,
            category: categoryMatch ? card.categories?.filter(c => c.toLowerCase().includes(searchLower)) : false,
            tagline: taglineMatch
          });
        }

        return nameMatch || bioMatch || titleMatch || expertiseMatch || categoryMatch || taglineMatch;
      });
      
      console.log(`✅ After search filtering: ${mentorCards.length} mentors match "${filters.searchQuery}"`);
    }

    // Apply category filter
    if (filters?.category && filters.category !== "all-categories") {
      const categoryLower = filters.category.toLowerCase().replace(/-/g, " ");
      const beforeCount = mentorCards.length;
      
      mentorCards = mentorCards.filter((card) => {
        return card.categories?.some((cat: string) => 
          cat.toLowerCase().includes(categoryLower)
        ) || card.title?.toLowerCase().includes(categoryLower);
      });
      
      console.log(`🏷️ Category filter "${filters.category}": ${beforeCount} → ${mentorCards.length} mentors`);
    }

    // Apply expertise filter
    if (filters?.expertise && filters.expertise !== "all") {
      const expertiseLower = filters.expertise.toLowerCase().replace(/-/g, " ");
      const beforeCount = mentorCards.length;
      
      mentorCards = mentorCards.filter((card) => {
        return card.expertise_tags?.some((exp: string) => 
          exp.toLowerCase().includes(expertiseLower)
        );
      });
      
      console.log(`💡 Expertise filter "${filters.expertise}": ${beforeCount} → ${mentorCards.length} mentors`);
    }

    // Apply price range filter
    if (filters?.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      const beforeCount = mentorCards.length;
      
      mentorCards = mentorCards.filter(
        (card) => card.price >= minPrice && card.price <= maxPrice
      );
      
      console.log(`💰 Price filter $${minPrice}-$${maxPrice}: ${beforeCount} → ${mentorCards.length} mentors`);
    }

    console.log(`🎯 Final result: ${mentorCards.length} mentors after all filters`);
    return mentorCards;
  } catch (error) {
    console.error("Error fetching mentor cards:", error);
    return [];
  }
}

/**
 * Fetch single mentor card by username or ID
 */
export async function fetchMentorCardByUsername(
  username: string
): Promise<MentorProfile | null> {
  try {
    console.log("Fetching mentor card for username:", username);
    
    const { data, error } = await supabase
      .from("expert_profiles")
      .select(`
        *,
        profiles (
          avatar_url
        )
      `)
      .eq("username", username)
      .single();

    if (error) {
      console.error("Supabase error fetching mentor card:", error);
      throw error;
    }

    if (!data) {
      console.warn("No data found for username:", username);
      return null;
    }

    console.log("Raw mentor data:", data);
    const card = transformToMentorCard(data);
    console.log("Transformed mentor card:", card);
    
    return card;
  } catch (error) {
    console.error("Error fetching mentor card:", error);
    return null;
  }
}

/**
 * Update mentor card rating when new reviews are added
 */
export async function updateMentorRating(mentorId: string): Promise<void> {
  try {
    // Fetch average rating and count from reviews
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("mentor_id", mentorId);

    if (error) throw error;

    if (data && data.length > 0) {
      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / data.length;
      
      // Note: We might want to store this in a separate table or cache
      // For now, ratings will be calculated on-the-fly
      console.log(`Mentor ${mentorId} rating updated: ${averageRating} (${data.length} reviews)`);
    }
  } catch (error) {
    console.error("Error updating mentor rating:", error);
  }
}

/**
 * Validate mentor profile completeness for card display
 */
export function validateMentorProfile(profile: ExpertProfileData): {
  isComplete: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!profile.full_name) missingFields.push("Full Name");
  if (!profile.username) missingFields.push("Username");
  if (!profile.category && (!profile.categories || profile.categories.length === 0)) {
    missingFields.push("Category/Expertise");
  }

  // Recommended fields
  if (!profile.bio) warnings.push("Bio/Description");
  if (!profile.profile_picture_url && !profile.profiles?.avatar_url) {
    warnings.push("Profile Picture");
  }
  if (!profile.services || Object.keys(profile.services).length === 0) {
    warnings.push("Service Types");
  }
  if (!profile.service_pricing || Object.keys(profile.service_pricing).length === 0) {
    warnings.push("Pricing Information");
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

/**
 * Get mentor profile completeness score (0-100)
 */
export function getMentorProfileScore(profile: ExpertProfileData): number {
  let score = 0;
  const weights = {
    required: 60, // 60% for required fields
    recommended: 40, // 40% for recommended fields
  };

  // Required fields (15 points each = 60 total)
  if (profile.full_name) score += 15;
  if (profile.username) score += 15;
  if (profile.category || (profile.categories && profile.categories.length > 0)) score += 15;
  if (profile.bio && profile.bio.length > 50) score += 15;

  // Recommended fields (10 points each = 40 total)
  if (profile.profile_picture_url || profile.profiles?.avatar_url) score += 10;
  if (profile.services && Object.keys(profile.services).length > 0) score += 10;
  if (profile.service_pricing && Object.keys(profile.service_pricing).length > 0) score += 10;
  if (profile.expertise_tags && profile.expertise_tags.length > 0) score += 10;

  return Math.min(score, 100);
}
