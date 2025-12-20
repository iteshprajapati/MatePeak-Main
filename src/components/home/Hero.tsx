import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const Hero = () => {
  const [currentField, setCurrentField] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const navigate = useNavigate();

  const fields = [
    "Career Growth",
    "Mental Health",
    "Academic Success",
    "Interview Prep",
    "Skill Development",
    "Life Choices",
  ];

  const searchSuggestions = [
    "Career Mentorship",
    "Interview Preparation",
    "Mental Health Support",
    "Academic Guidance",
    "Skill Development",
    "Life Coaching",
  ];

  // Mentor cards data
  const mentorCards = [
    {
      id: "1",
      name: "T Zhu",
      title: "Co-Founder",
      company: "tellus",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    },
    {
      id: "2",
      name: "Sarah Chen",
      title: "Product Lead",
      company: "TechCorp",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
    },
    {
      id: "3",
      name: "Alex Johnson",
      title: "Engineering Manager",
      company: "StartupHub",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
    },
    {
      id: "4",
      name: "Maya Patel",
      title: "Design Director",
      company: "Creative Labs",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
    },
    {
      id: "5",
      name: "James Lee",
      title: "VP of Sales",
      company: "GrowthCo",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
    },
  ];

  const expertProfiles = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces",
      name: "Priya Sharma",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
      name: "Rahul Kumar",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces",
      name: "Ananya Singh",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
      name: "Arjun Patel",
    },
  ];

  useEffect(() => {
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenWords = 2000;
    const currentWord = fields[currentField];

    if (!isDeleting && displayText === currentWord) {
      setTimeout(() => setIsDeleting(true), delayBetweenWords);
      return;
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentField((prev) => (prev + 1) % fields.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
        } else {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentField]);

  useEffect(() => {
    const heroElement = document.getElementById("hero-section");
    if (heroElement) {
      heroElement.classList.add("animate-fade-in-up", "opacity-100");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % mentorCards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const popularOptions = ["Career Growth", "Mental Health", "Interview Prep"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handlePopularClick = (option: string) => {
    navigate(`/explore?q=${encodeURIComponent(option)}`);
  };

  return (
    <section
      id="hero-section"
      className="py-20 md:py-32 opacity-0 transition-opacity duration-700"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left lg:pl-0 -mt-4">
            <div className="mb-6">
              <h1 className="text-[2rem] md:text-[2.75rem] font-bold font-poppins text-gray-900 mb-2 leading-tight">
                Connect with Expert <br />
                Mentors
              </h1>
              <p className="text-lg text-gray-600 font-poppins font-light flex items-center justify-center lg:justify-start gap-2 mb-10">
                <span>Get 1-on-1 advice on</span>
                <span className="inline-block min-w-[180px] text-left">
                  <span className="text-matepeak-primary font-semibold">
                    {displayText}
                  </span>
                  <span className="animate-pulse text-matepeak-primary">|</span>
                </span>
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col justify-center lg:justify-start mb-8">
              <form
                onSubmit={handleSearch}
                className="relative w-full max-w-lg mb-4"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchDropdown(false), 200)
                  }
                  placeholder="What type of mentor are you interested in?"
                  className="w-full h-12 pl-6 pr-14 rounded-full bg-gray-100 hover:bg-white focus:bg-white border-0 text-gray-700 placeholder:text-sm placeholder:text-gray-600 outline-none hover:ring-2 hover:ring-matepeak-primary/20 focus:ring-2 focus:ring-matepeak-primary/20 transition-all focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-all"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>

                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSearchDropdown(false);
                          navigate(
                            `/explore?q=${encodeURIComponent(suggestion)}`
                          );
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 font-poppins"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Popular Tags */}
              <div className="flex items-center gap-2.5 flex-wrap max-w-lg">
                <span className="text-sm font-bold text-gray-900 font-poppins">
                  Try:
                </span>
                {popularOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handlePopularClick(option)}
                    className="text-sm px-3.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-matepeak-primary hover:text-matepeak-primary transition-all font-poppins"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block overflow-hidden pt-0 relative -mt-8">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="flex gap-6 animate-scroll-left hover:pause pt-12">
              {/* First set of cards */}
              {mentorCards.map((mentor) => (
                <div key={mentor.id} className="flex-shrink-0">
                  <div
                    className="bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300 p-6 pt-16 w-64 h-64 relative transition-all duration-300 group hover:-translate-y-1"
                    style={{ boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-white shadow-md absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:shadow-lg">
                        <img
                          src={mentor.image}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 font-poppins">
                        {mentor.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 font-poppins">
                        {mentor.title}
                      </p>
                      <div className="w-full border-t border-gray-100 pt-3 mt-auto">
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 font-poppins">
                            {mentor.company}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {mentorCards.map((mentor) => (
                <div key={`${mentor.id}-duplicate`} className="flex-shrink-0">
                  <div
                    className="bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300 p-6 pt-16 w-64 h-64 relative transition-all duration-300 group hover:-translate-y-1"
                    style={{ boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-white shadow-md absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:shadow-lg">
                        <img
                          src={mentor.image}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 font-poppins">
                        {mentor.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 font-poppins">
                        {mentor.title}
                      </p>
                      <div className="w-full border-t border-gray-100 pt-3 mt-auto">
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 font-poppins">
                            {mentor.company}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
