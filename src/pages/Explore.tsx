import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorCard from "@/components/MentorCard";
import { MentorProfile } from "@/components/MentorCard";
import { fetchMentorCards } from "@/services/mentorCardService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Search, 
  X, 
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSearchQuery = queryParams.get("q") || "";
  const initialExpertise = queryParams.get("expertise") || "";
  const initialCategory = queryParams.get("category") || "all-categories";

  const [mentorCards, setMentorCards] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedExpertise, setSelectedExpertise] = useState(initialExpertise);
  const [sortBy, setSortBy] = useState<"newest" | "rating" | "price-low" | "price-high">("newest");
  
  // Available categories and expertise
  const categories = [
    "all-categories",
    "Recent Graduates",
    "Academic Support",
    "Mock Interviews",
    "Resume Review",
    "Career Guidance",
    "Programming",
    "Data Science",
    "Business",
    "Design",
    "Health"
  ];

  const expertiseOptions = [
    "all",
    "Computer Science",
    "Mathematics",
    "Physics",
    "Engineering",
    "Business Strategy",
    "Career Coaching",
    "Interview Prep",
    "Resume Writing"
  ];

  // Fetch mentors from database on initial load and when filters change
  useEffect(() => {
    fetchDatabaseMentors();
  }, [selectedCategory, selectedExpertise]);
  
  // Fetch mentors when URL params change (e.g., coming from home page buttons)
  useEffect(() => {
    if (initialSearchQuery) {
      console.log('🔗 URL has search param:', initialSearchQuery);
      fetchDatabaseMentors();
    }
  }, [initialSearchQuery]);
  
  // Real-time search with debouncing (only for manual typing)
  useEffect(() => {
    if (!searchInput) return; // Skip if empty
    
    const timeoutId = setTimeout(() => {
      // Only search if the user manually changed the input
      if (searchInput !== initialSearchQuery) {
        fetchDatabaseMentors();
      }
    }, 500); // Wait 500ms after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const fetchDatabaseMentors = async () => {
    setLoading(true);
    try {
      console.log('🔎 Explore page fetching with:', {
        category: selectedCategory,
        expertise: selectedExpertise,
        searchQuery: searchInput
      });
      
      const cards = await fetchMentorCards({
        category: selectedCategory !== "all-categories" ? selectedCategory : undefined,
        expertise: selectedExpertise !== "all" ? selectedExpertise : undefined,
        searchQuery: searchInput || undefined,
      });
      
      console.log('📋 Explore page received:', cards.length, 'mentor cards');
      setMentorCards(cards);
    } catch (error) {
      console.error("❌ Error fetching mentors in Explore page:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchDatabaseMentors();
    // Update URL
    const params = new URLSearchParams();
    if (searchInput) params.set("q", searchInput);
    if (selectedCategory !== "all-categories") params.set("category", selectedCategory);
    if (selectedExpertise !== "all") params.set("expertise", selectedExpertise);
    navigate(`/explore?${params.toString()}`, { replace: true });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchInput("");
    setSelectedCategory("all-categories");
    setSelectedExpertise("all");
    setSortBy("newest");
    navigate("/explore", { replace: true });
    fetchDatabaseMentors();
  };

  // Sort mentors
  const sortedMentors = [...mentorCards].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
      default:
        return 0;
    }
  });

  // Log sorting results
  console.log(`🔄 Sort by: ${sortBy}`);
  console.log(`📊 Sorted mentors (${sortedMentors.length}):`, 
    sortedMentors.map(m => ({
      name: m.name,
      rating: m.rating,
      price: m.price
    }))
  );

  const hasActiveFilters = selectedCategory !== "all-categories" || selectedExpertise !== "all" || searchInput !== "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Centered Search Bar with Funnel Icon */}
          <div className="flex justify-center items-center gap-3 mb-8">
            {/* Search Bar */}
            <div className="w-full max-w-3xl bg-white rounded-lg border border-gray-200 shadow-sm p-2 flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400 ml-2" />
              <Input
                type="text"
                placeholder="Search by name, expertise, skills, institution, or category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 h-10"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setSearchInput("");
                    // Clear search and fetch all mentors
                    try {
                      setLoading(true);
                      const cards = await fetchMentorCards({
                        category: selectedCategory !== "all-categories" ? selectedCategory : undefined,
                        expertise: selectedExpertise !== "all" ? selectedExpertise : undefined,
                        searchQuery: undefined, // Explicitly clear search
                      });
                      setMentorCards(cards);
                      navigate("/explore", { replace: true });
                    } catch (error) {
                      console.error("Error clearing search:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handleSearch}
                className="bg-matepeak-primary hover:bg-matepeak-yellow hover:text-matepeak-primary text-white font-semibold"
              >
                Search
              </Button>
            </div>

            {/* Funnel Icon with Dropdown */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger 
                className="w-auto border-gray-200 px-3 py-2 h-auto"
                aria-label="Open filters"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>



          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-matepeak-primary mx-auto mb-4" />
                <p className="text-gray-600">Finding the best mentors for you...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {sortedMentors.length} {sortedMentors.length === 1 ? "Mentor" : "Mentors"} Found
                </h2>
              </div>

              {/* Mentor Grid */}
              {sortedMentors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                  {sortedMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-matepeak-primary/10 to-matepeak-yellow/10 rounded-full p-8">
                      <Search className="h-16 w-16 text-matepeak-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No mentors found</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {searchInput ? (
                      <>
                        No mentors match <span className="font-semibold">"{searchInput}"</span>
                        <br />
                        <span className="text-sm">Try searching by name, expertise, skills, or institution</span>
                      </>
                    ) : (
                      "We couldn't find any mentors matching your criteria. Try adjusting your filters."
                    )}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearFilters}
                      className="bg-matepeak-primary hover:bg-matepeak-secondary"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Explore;
