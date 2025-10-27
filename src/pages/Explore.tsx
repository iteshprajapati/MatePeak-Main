import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorCard from "@/components/MentorCard";
import { filterMentors } from "@/data/mentors";
import { MentorProfile } from "@/components/MentorCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Explore = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") || "";
  const expertise = queryParams.get("expertise") || "";
  const category = queryParams.get("category") || "";

  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [dbMentors, setDbMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch mentors from database
  useEffect(() => {
    fetchDatabaseMentors();
  }, [searchQuery, expertise, category]);

  const fetchDatabaseMentors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("expert_profiles")
        .select(`
          *,
          profiles (
            avatar_url
          )
        `);

      // Apply filters if provided
      if (category && category !== "all-categories") {
        query = query.ilike("category", `%${category.replace(/-/g, " ")}%`);
      }

      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Filter by expertise if provided
      let filteredData = data || [];
      if (expertise && expertise !== "all") {
        const expertiseSearch = expertise.replace(/-/g, " ");
        filteredData = filteredData.filter((mentor) =>
          mentor.category?.toLowerCase().includes(expertiseSearch.toLowerCase()) ||
          mentor.bio?.toLowerCase().includes(expertiseSearch.toLowerCase())
        );
      }
      
      setDbMentors(filteredData);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter static mentors
    const filteredResults = filterMentors(
      searchQuery,
      category ? [category] : [],
      [0, 2000]
    );
    setFilteredMentors(filteredResults);
  }, [searchQuery, category]);

  const totalMentors = dbMentors.length + filteredMentors.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-gray-50 py-12 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Explore Mentors</h1>
            <div className="flex flex-wrap gap-2 text-gray-600">
              {searchQuery && (
                <span>
                  Search: <span className="font-medium">"{searchQuery}"</span>
                </span>
              )}
              {expertise && expertise !== "all" && (
                <>
                  {searchQuery && <span>•</span>}
                  <span>
                    Expertise: <span className="font-medium">{expertise.replace(/-/g, " ")}</span>
                  </span>
                </>
              )}
              {category && category !== "all-categories" && (
                <>
                  {(searchQuery || expertise) && <span>•</span>}
                  <span>
                    Category: <span className="font-medium">{category.replace(/-/g, " ")}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-matepeak-primary" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {totalMentors} {totalMentors === 1 ? "Mentor" : "Mentors"} Found
                </h2>
              </div>
              
              {/* Database Mentors */}
              {dbMentors.length > 0 && (
                <div className="mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dbMentors.map((mentor) => (
                      <Link key={mentor.id} to={`/mentor/${mentor.username}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full max-w-sm mx-auto">
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
              {filteredMentors.length > 0 && (
                <div>
                  {dbMentors.length > 0 && (
                    <h2 className="text-2xl font-bold mb-6">More Mentors</h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMentors.map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                  </div>
                </div>
              )}

              {totalMentors === 0 && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-2">No mentors found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search filters or browse all available mentors.
                  </p>
                  <Link
                    to="/explore"
                    className="text-matepeak-primary hover:text-matepeak-secondary font-medium"
                  >
                    Clear all filters
                  </Link>
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
