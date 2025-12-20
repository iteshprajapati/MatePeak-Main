import { useState, useEffect, useRef } from "react";
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
  TrendingUp,
  Clock,
  AlertCircle,
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
  const [sortBy, setSortBy] = useState<
    "newest" | "rating" | "price-low" | "price-high"
  >("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Production-ready search features
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const MIN_SEARCH_LENGTH = 2;
  const MAX_RETRY_ATTEMPTS = 3;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMentors, setTotalMentors] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const MENTORS_PER_PAGE = 20;

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
    "Health",
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
    "Resume Writing",
  ];

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim() || query.length < MIN_SEARCH_LENGTH) return;

    const updatedHistory = [
      query,
      ...searchHistory.filter((q) => q !== query),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  // Fetch mentors from database on initial load and when filters change
  useEffect(() => {
    fetchDatabaseMentors();
  }, [selectedCategory, selectedExpertise]);

  // Fetch mentors when URL params change (e.g., coming from home page buttons)
  useEffect(() => {
    if (initialSearchQuery) {
      console.log("🔗 URL has search param:", initialSearchQuery);
      fetchDatabaseMentors();
    }
  }, [initialSearchQuery]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (searchInput.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // Fetch suggestions based on search input
        const { data, error } = await supabase
          .from("mentor_profiles")
          .select("name, expertise")
          .or(`name.ilike.%${searchInput}%,expertise.ilike.%${searchInput}%`)
          .limit(5);

        if (error) throw error;

        const suggestionSet = new Set<string>();
        data?.forEach((item) => {
          if (item.name.toLowerCase().includes(searchInput.toLowerCase())) {
            suggestionSet.add(item.name);
          }
          if (
            item.expertise?.toLowerCase().includes(searchInput.toLowerCase())
          ) {
            suggestionSet.add(item.expertise);
          }
        });

        setSuggestions(Array.from(suggestionSet).slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 300); // Faster for autocomplete

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Real-time search with debouncing and request cancellation
  useEffect(() => {
    if (!searchInput || searchInput.length < MIN_SEARCH_LENGTH) {
      if (searchInput.length === 0) {
        fetchDatabaseMentors();
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchInput !== initialSearchQuery) {
        fetchDatabaseMentors();
        saveToHistory(searchInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const fetchDatabaseMentors = async (page = 1, append = false, retry = 0) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentPage(1);
    }

    setError(null);

    try {
      console.log("🔎 Explore page fetching with:", {
        category: selectedCategory,
        expertise: selectedExpertise,
        searchQuery: searchInput,
        page,
        limit: MENTORS_PER_PAGE,
      });

      const result = await fetchMentorCards(
        {
          category:
            selectedCategory !== "all-categories"
              ? selectedCategory
              : undefined,
          expertise:
            selectedExpertise !== "all" ? selectedExpertise : undefined,
          searchQuery: searchInput || undefined,
          page,
          limit: MENTORS_PER_PAGE,
        },
        abortControllerRef.current.signal
      );

      console.log(
        "📋 Explore page received:",
        result.data.length,
        "mentor cards (page",
        page,
        "of",
        Math.ceil(result.total / MENTORS_PER_PAGE),
        ")"
      );

      if (append) {
        setMentorCards((prev) => [...prev, ...result.data]);
      } else {
        setMentorCards(result.data);
      }

      setTotalMentors(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);
      setRetryCount(0);
    } catch (error: any) {
      // Don't show error for aborted requests
      if (error.name === "AbortError") {
        console.log("Request aborted");
        return;
      }

      console.error("❌ Error fetching mentors in Explore page:", error);

      // Retry logic
      if (retry < MAX_RETRY_ATTEMPTS) {
        console.log(`🔄 Retrying... (${retry + 1}/${MAX_RETRY_ATTEMPTS})`);
        setRetryCount(retry + 1);
        setTimeout(() => {
          fetchDatabaseMentors(page, append, retry + 1);
        }, 1000 * (retry + 1)); // Exponential backoff
      } else {
        setError(
          "Failed to load mentors. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more mentors (infinite scroll or "Load More" button)
  const loadMoreMentors = () => {
    if (!loadingMore && hasMore) {
      fetchDatabaseMentors(currentPage + 1, true);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchInput.length > 0 && searchInput.length < MIN_SEARCH_LENGTH) {
      setError(
        `Please enter at least ${MIN_SEARCH_LENGTH} characters to search`
      );
      return;
    }

    fetchDatabaseMentors();
    saveToHistory(searchInput);
    setShowSuggestions(false);

    // Update URL
    const params = new URLSearchParams();
    if (searchInput) params.set("q", searchInput);
    if (selectedCategory !== "all-categories")
      params.set("category", selectedCategory);
    if (selectedExpertise !== "all") params.set("expertise", selectedExpertise);
    navigate(`/explore?${params.toString()}`, { replace: true });
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    saveToHistory(suggestion);
    setTimeout(() => handleSearch(), 100);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
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
  console.log(
    `📊 Sorted mentors (${sortedMentors.length}):`,
    sortedMentors.map((m) => ({
      name: m.name,
      rating: m.rating,
      price: m.price,
    }))
  );

  const hasActiveFilters =
    selectedCategory !== "all-categories" ||
    selectedExpertise !== "all" ||
    searchInput !== "";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        {/* Clean Search Section with MatePeak Touch */}
        <div className="bg-white pt-16 pb-8 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            {/* Simple Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-poppins text-gray-900 mb-2">
                Find Your Mentor
              </h1>
              <p className="text-base text-gray-600 font-poppins">
                Search from {totalMentors} expert mentors across{" "}
                {categories.length - 1} categories
              </p>
            </div>

            {/* Clean Search Bar with Autocomplete and History */}
            <div className="mb-6">
              <div className="relative">
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm focus-within:border-matepeak-primary focus-within:shadow-md transition-all bg-white">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name, expertise, skills, or institution..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() => {
                      if (
                        searchInput.length >= MIN_SEARCH_LENGTH ||
                        searchHistory.length > 0
                      ) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 font-poppins p-0 h-auto text-base placeholder:text-gray-500"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSuggestions([]);
                        setShowSuggestions(false);
                        fetchDatabaseMentors();
                      }}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <Button
                    onClick={handleSearch}
                    disabled={
                      searchInput.length > 0 &&
                      searchInput.length < MIN_SEARCH_LENGTH
                    }
                    className="bg-matepeak-primary hover:bg-matepeak-secondary text-white font-poppins px-6 h-9 flex-shrink-0 disabled:opacity-50"
                  >
                    Search
                  </Button>
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions &&
                  (searchInput.length >= MIN_SEARCH_LENGTH ||
                    searchHistory.length > 0) && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                      {/* Search Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 font-poppins">
                            Suggestions
                          </div>
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 font-poppins"
                            >
                              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {suggestion}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Search History */}
                      {searchHistory.length > 0 &&
                        searchInput.length < MIN_SEARCH_LENGTH && (
                          <div className="py-2 border-t border-gray-100">
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 font-poppins flex items-center justify-between">
                              <span>Recent searches</span>
                              <button
                                onClick={clearSearchHistory}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                Clear
                              </button>
                            </div>
                            {searchHistory.slice(0, 5).map((item, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(item)}
                                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 font-poppins"
                              >
                                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700">
                                  {item}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-poppins">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                  {retryCount > 0 && (
                    <button
                      onClick={() => fetchDatabaseMentors()}
                      className="ml-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      Retry now
                    </button>
                  )}
                </div>
              )}

              {/* Search Tips */}
              {searchInput.length > 0 &&
                searchInput.length < MIN_SEARCH_LENGTH && (
                  <div className="mt-2 text-sm text-gray-500 font-poppins">
                    Enter at least {MIN_SEARCH_LENGTH} characters to search
                  </div>
                )}
            </div>

            {/* Clean Category Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 font-poppins mr-1">
                Popular:
              </span>
              {[
                "Career Growth",
                "Mental Health",
                "Interview Prep",
                "Academic Success",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    fetchDatabaseMentors();
                  }}
                  className="px-4 py-1.5 rounded-full border border-gray-200 hover:border-matepeak-primary hover:bg-gray-50 text-gray-700 hover:text-matepeak-primary text-sm font-poppins transition-all"
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-poppins flex items-center gap-1.5 transition-all ml-2"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showFilters ? "Hide filters" : "More filters"}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section - Collapsible */}
        {showFilters && (
          <div className="bg-gray-50 py-6">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-poppins">
                      Category
                    </label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="font-poppins"
                          >
                            {cat === "all-categories" ? "All Categories" : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-poppins">
                      Expertise
                    </label>
                    <Select
                      value={selectedExpertise}
                      onValueChange={setSelectedExpertise}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {expertiseOptions.map((exp) => (
                          <SelectItem
                            key={exp}
                            value={exp}
                            className="font-poppins"
                          >
                            {exp === "all" ? "All Expertise" : exp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-poppins">
                      Sort by
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest" className="font-poppins">
                          Newest First
                        </SelectItem>
                        <SelectItem value="rating" className="font-poppins">
                          Highest Rated
                        </SelectItem>
                        <SelectItem value="price-low" className="font-poppins">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high" className="font-poppins">
                          Price: High to Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900 font-poppins"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    onClick={handleSearch}
                    className="bg-matepeak-primary hover:bg-matepeak-secondary text-white font-poppins"
                    size="sm"
                  >
                    Apply filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-matepeak-primary mx-auto mb-4" />
                <p className="text-gray-600 font-poppins">Finding mentors...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              {sortedMentors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 font-poppins">
                    About {totalMentors.toLocaleString()} results
                  </p>
                </div>
              )}

              {/* Mentor Grid */}
              {sortedMentors.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {sortedMentors.map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center mb-12">
                      <Button
                        onClick={loadMoreMentors}
                        disabled={loadingMore}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm font-poppins px-8"
                        variant="outline"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Show more results"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2 font-poppins">
                    No results found
                  </h3>
                  <p className="text-gray-600 font-poppins text-sm mb-6">
                    {searchInput ? (
                      <>
                        Your search -{" "}
                        <span className="font-semibold">{searchInput}</span> -
                        did not match any mentors.
                      </>
                    ) : (
                      "Try different keywords or adjust your filters."
                    )}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={handleClearFilters}
                      variant="link"
                      className="text-blue-600 hover:underline font-poppins"
                    >
                      Clear filters
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
