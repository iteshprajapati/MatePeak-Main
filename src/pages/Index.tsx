
import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedMentors from "@/components/home/FeaturedMentors";
import GetInTouch from "@/components/home/GetInTouch";

const Index = () => {
  // Refs for scroll animation sections
  const sectionRefs = {
    howItWorks: useRef<HTMLDivElement>(null),
    mentors: useRef<HTMLDivElement>(null),
  };

  // Handle scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up", "opacity-100");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all section refs
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        ref.current.classList.add("opacity-0");
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero />
      <HowItWorks sectionRef={sectionRefs.howItWorks} />
      <FeaturedMentors sectionRef={sectionRefs.mentors} />
      <GetInTouch />
      <Footer />
    </div>
  );
};

export default Index;
