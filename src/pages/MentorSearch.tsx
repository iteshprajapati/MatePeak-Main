
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/SearchFilters";
import MentorCard from "@/components/MentorCard";
import { filterMentors } from "@/data/mentors";
import { MentorProfile } from "@/components/MentorCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const MentorSearch = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "";
  const initialSearchTerm = queryParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [dbMentors, setDbMentors] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: initialSearchTerm,
    categories: initialCategory ? [initialCategory] : [],
    priceRange: [0, 2000],
  });

  // Fetch mentors from database
  useEffect(() => {
    fetchDatabaseMentors();
  }, []);

  const fetchDatabaseMentors = async () => {
    try {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select(`
          *,
          profiles (
            avatar_url
          )
        `);

      if (error) throw error;
      setDbMentors(data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchQuery(initialSearchTerm);
    }
    
    updateFilters({
      searchTerm: initialSearchTerm,
      categories: initialCategory ? [initialCategory] : [],
      priceRange: [0, 2000],
    });
  }, [initialSearchTerm, initialCategory]);

  const updateFilters = (filters: any) => {
    console.log("Updating filters:", filters);
    setSearchFilters(filters);
    
    if (filters.aiResults) {
      console.log("Using AI search results:", filters.aiResults);
      setFilteredMentors(filters.aiResults);
    } else {
      console.log("Using standard filtering with term:", filters.searchTerm);
      const filteredResults = filterMentors(
        filters.searchTerm,
        filters.categories,
        filters.priceRange
      );
      console.log("Standard filter results:", filteredResults);
      setFilteredMentors(filteredResults);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-mentor-light/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Mentor</h1>
            <p className="text-gray-600 mb-6">
              Browse our curated selection of mentors or use filters to find the perfect match for your needs.
            </p>
            
            <SearchFilters onSearch={updateFilters} />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {filteredMentors.length} {filteredMentors.length === 1 ? "Mentor" : "Mentors"} Available
            </h2>
            {searchFilters.searchTerm && (
              <div className="text-gray-600">
                Search results for: <span className="font-medium">{searchFilters.searchTerm}</span>
              </div>
            )}
          </div>
          
          {/* Database Mentors */}
          {dbMentors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">New Mentors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dbMentors.map((mentor) => (
                  <Link key={mentor.id} to={`/mentor/${mentor.username}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={mentor.profiles?.avatar_url} alt={mentor.full_name} />
                            <AvatarFallback className="bg-matepeak-primary text-white text-lg">
                              {mentor.full_name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-lg mb-1">{mentor.full_name}</h3>
                          <p className="text-sm text-gray-600 mb-3">@{mentor.username}</p>
                          <Badge variant="secondary" className="mb-3">
                            {mentor.category}
                          </Badge>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {mentor.bio || "No bio available"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Static Mentors */}
          {filteredMentors.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {filteredMentors.length} {filteredMentors.length === 1 ? "Mentor" : "Mentors"} Available
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            </div>
          ) : !dbMentors.length && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No mentors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search filters or browse all available mentors.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MentorSearch;
