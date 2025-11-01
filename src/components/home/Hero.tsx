import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSearchBar from "@/components/home/HeroSearchBar";
import { useEffect, useState } from "react";

const Hero = () => {
  const [currentField, setCurrentField] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fields = [
    "Career Growth",
    "Mental Health",
    "Academic Success",
    "Interview Prep",
    "Skill Development",
    "Life Choices",
  ];

  // Professional headshot images with solid color backgrounds
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

  // Typing effect for rotating fields
  useEffect(() => {
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenWords = 2000;

    const currentWord = fields[currentField];

    if (!isDeleting && displayText === currentWord) {
      // Finished typing, wait then start deleting
      setTimeout(() => setIsDeleting(true), delayBetweenWords);
      return;
    }

    if (isDeleting && displayText === "") {
      // Finished deleting, move to next word
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
  }, [displayText, isDeleting, currentField, fields]);

  // Add fade-in animation on load
  useEffect(() => {
    const heroElement = document.getElementById("hero-section");
    if (heroElement) {
      heroElement.classList.add("animate-fade-in-up", "opacity-100");
    }
  }, []);

  return (
    <section
      id="hero-section"
      className="py-20 md:py-32 opacity-0 transition-opacity duration-700"
    >
      <div className="max-w-3xl mx-auto text-center px-4 md:px-8 xl:px-0">
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 mb-2">
            Connect with Expert Mentors
          </h1>
          <p className="text-lg text-gray-600 font-light flex items-center justify-center gap-2">
            <span>Get 1-on-1 advice on</span>
            <span className="inline-block min-w-[180px] text-left">
              <span className="text-matepeak-primary font-semibold">
                {displayText}
              </span>
              <span className="animate-pulse text-matepeak-primary">|</span>
            </span>
          </p>
        </div>

        {/* Expert profiles banner */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-lg text-gray-600 font-poppins font-light">
            Our experts are ready to help!
          </span>
          <div className="flex -space-x-3">
            {expertProfiles.map((expert, index) => (
              <div
                key={expert.id}
                className="relative"
                style={{ zIndex: index + 1 }}
              >
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover hover:scale-110 transition-transform duration-200"
                  title={expert.name}
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>

        <HeroSearchBar />

        <div className="flex flex-wrap justify-center mt-8 gap-4 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap max-w-full">
          <div className="flex gap-3 md:flex-wrap md:justify-center overflow-x-auto sm:overflow-visible px-1 py-2 -mx-1 md:px-0">
            <Link to="/mentors?category=academic">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap"
              >
                Academic Support
              </Button>
            </Link>
            <Link to="/mentors?category=career">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap"
              >
                Career Guidance
              </Button>
            </Link>
            <Link to="/mentors?category=wellness">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap"
              >
                Wellness & Fitness
              </Button>
            </Link>
            <Link to="/mentors?category=interview">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap"
              >
                Mock Interviews
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
