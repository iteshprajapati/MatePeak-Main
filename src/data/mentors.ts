import { MentorProfile } from "@/components/MentorCard";

// Mock mentor data - Empty array, will be populated from database
export const mentors: MentorProfile[] = [];

// Helper function to get mentors by category
export const getMentorsByCategory = (category: string): MentorProfile[] => {
  return mentors.filter(mentor => mentor.categories.includes(category));
};

// Get mentor by ID
export const getMentorById = (id: string): MentorProfile | undefined => {
  return mentors.find(mentor => mentor.id === id);
};

// Filter mentors based on search criteria
export const filterMentors = (
  searchTerm: string = "",
  categories: string[] = [],
  priceRange: number[] = [0, 5000]
): MentorProfile[] => {
  return mentors.filter(mentor => {
    const matchesSearchTerm = searchTerm === "" || 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = categories.length === 0 || 
      categories.some(category => 
        mentor.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
      );
    
    const matchesPrice = mentor.price >= priceRange[0] && mentor.price <= priceRange[1];
    
    return matchesSearchTerm && matchesCategories && matchesPrice;
  });
};
