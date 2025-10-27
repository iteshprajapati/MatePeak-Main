
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const AnimatedSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const navigate = useNavigate();

  const suggestions = [
    "courses",
    "mentors", 
    "topics",
    "students",
    "tags",
    "skills"
  ];

  useEffect(() => {
    let currentIndex = 0;
    const currentSuggestion = suggestions[currentSuggestionIndex];
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= currentSuggestion.length) {
        setPlaceholderText(`Type here to search... ${currentSuggestion.substring(0, currentIndex)}`);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentSuggestionIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/mentors?search=${searchQuery}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
      <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
        <Search className="ml-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholderText}
          className="flex-1 border-0 focus-visible:ring-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          type="submit" 
          className="bg-matepeak-dark hover:bg-matepeak-secondary text-white py-5 px-6 m-1"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default AnimatedSearchBar;
