
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroSearchBar from "@/components/home/HeroSearchBar";
import { useEffect } from "react";

const Hero = () => {
  // Add fade-in animation on load
  useEffect(() => {
    const heroElement = document.getElementById("hero-section");
    if (heroElement) {
      heroElement.classList.add("animate-fade-in-up", "opacity-100");
    }
  }, []);

  return (
    <section id="hero-section" className="bg-white py-16 md:py-24 opacity-0 transition-opacity duration-700 border-t border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-poppins relative z-10 overflow-hidden">
            <span className="gradient-text animate-gradient-x">
              Get the cheat codes from the pros
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-poppins font-light">
            No fluff. Just <span className="text-amber-500 font-normal">real lessons</span> from real people.
          </p>
          
          <HeroSearchBar />
          
          <div className="flex flex-wrap justify-center mt-8 gap-4 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap max-w-full">
            <div className="flex gap-3 md:flex-wrap md:justify-center overflow-x-auto sm:overflow-visible px-1 py-2 -mx-1 md:px-0">
              <Link to="/mentors?category=academic">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap">
                  Academic Support
                </Button>
              </Link>
              <Link to="/mentors?category=career">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap">
                  Career Guidance
                </Button>
              </Link>
              <Link to="/mentors?category=wellness">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap">
                  Wellness & Fitness
                </Button>
              </Link>
              <Link to="/mentors?category=interview">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-[#FFD966]/10 hover:border-[#FFD966] transition-all whitespace-nowrap">
                  Mock Interviews
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
