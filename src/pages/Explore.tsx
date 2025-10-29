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
  SlidersHorizontal, 
  X, 
  Users,
  Filter,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Fetch mentors from database
  useEffect(() => {
    fetchDatabaseMentors();
  }, [selectedCategory, selectedExpertise]);

  const fetchDatabaseMentors = async () => {
    setLoading(true);
    try {
      const cards = await fetchMentorCards({
        category: selectedCategory !== "all-categories" ? selectedCategory : undefined,
        expertise: selectedExpertise !== "all" ? selectedExpertise : undefined,
        searchQuery: searchInput || undefined,
      });
      
      setMentorCards(cards);
    } catch (error) {
      console.error("Error fetching mentors:", error);
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

  const hasActiveFilters = selectedCategory !== "all-categories" || selectedExpertise !== "all" || searchInput !== "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-matepeak-primary via-matepeak-secondary to-matepeak-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Your Perfect Mentor
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Browse through our community of expert mentors and book sessions that fit your goals
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, expertise, or topic..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-matepeak-primary hover:bg-matepeak-yellow hover:text-matepeak-primary text-white font-semibold px-8"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mentorCards.length}</div>
                    <div className="text-sm text-white/80">Expert Mentors</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{categories.length - 1}</div>
                    <div className="text-sm text-white/80">Categories</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Filter className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-white/80">Available Support</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters and Controls */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFilters && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat === "all-categories" ? "All Categories" : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Expertise
                    </label>
                    <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {expertiseOptions.map((exp) => (
                          <SelectItem key={exp} value={exp}>
                            {exp === "all" ? "All Expertise" : exp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSearch} className="bg-matepeak-primary hover:bg-matepeak-secondary">
                    Apply Filters
                  </Button>
                </div>
              </>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600">Active filters:</span>
                  {searchInput && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchInput}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setSearchInput("");
                          handleSearch();
                        }}
                      />
                    </Badge>
                  )}
                  {selectedCategory !== "all-categories" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategory}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setSelectedCategory("all-categories");
                          handleSearch();
                        }}
                      />
                    </Badge>
                  )}
                  {selectedExpertise !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedExpertise}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setSelectedExpertise("all");
                          handleSearch();
                        }}
                      />
                    </Badge>
                  )}
                </div>
              </>
            )}
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
                      <Users className="h-16 w-16 text-matepeak-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No mentors found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any mentors matching your criteria. Try adjusting your filters or search terms.
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
