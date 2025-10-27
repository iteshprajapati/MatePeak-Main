import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");

  // Placeholder data - will be fetched from backend later
  const expertiseOptions = [
    "Academic Support",
    "Career Guidance",
    "Wellness & Fitness",
    "Mock Interviews",
    "Technical Skills",
    "Business & Entrepreneurship",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedExpertise) params.set("expertise", selectedExpertise);

    navigate(`/explore?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center bg-gray-100 rounded-2xl p-1.5">
        {/* Search Input */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white rounded-xl transition-colors">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Type here to search… students or mentors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none px-0 placeholder:text-gray-500 text-sm"
          />
        </div>

        {/* Expertise Dropdown */}
        <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
          <SelectTrigger className="w-full md:w-[140px] bg-white border-0 hover:bg-gray-50 transition-colors rounded-xl font-semibold text-sm h-9">
            <SelectValue placeholder="Expertise" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="all">All Expertise</SelectItem>
            {expertiseOptions.map((option) => (
              <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, "-")}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Button */}
        <Button
          type="submit"
          className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 h-9 font-medium transition-colors text-sm"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default HeroSearchBar;
