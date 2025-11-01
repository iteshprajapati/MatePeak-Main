import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);

    navigate(`/explore?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-2 md:p-3">
        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white rounded-xl transition-colors">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search for mentors, expertise, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 focus:ring-offset-0 px-0 placeholder:text-gray-500 text-sm shadow-none"
            />
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 h-11 md:h-12 font-medium transition-colors text-sm flex-shrink-0"
            style={{ minHeight: "44px" }}
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default HeroSearchBar;
