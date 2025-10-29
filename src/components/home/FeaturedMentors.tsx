
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MentorCard from "@/components/MentorCard";
import { mentors } from "@/data/mentors";
import { useMemo, useState } from "react";

interface FeaturedMentorsProps {
  sectionRef: React.RefObject<HTMLDivElement>;
}

const FeaturedMentors = ({ sectionRef }: FeaturedMentorsProps) => {
  const [visibleCategories, setVisibleCategories] = useState(2); // Show only 2 categories initially
  
  const categories = [
    "Recent Graduates",
    "Academic Support",
    "Mock Interviews",
    "Resume Review",
    "Health"
  ];

  // Memoize mentor filtering to prevent recalculation on every render
  const categorizedMentors = useMemo(() => {
    return categories.map(category => ({
      category,
      mentors: mentors.filter(m => m.categories.includes(category)).slice(0, 4)
    }));
  }, []);

  const handleLoadMore = () => {
    setVisibleCategories(prev => Math.min(prev + 2, categories.length));
  };

  const hasMore = visibleCategories < categories.length;

  return (
    <section className="py-16 bg-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-matepeak-primary">Our Mentors</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with our top-rated mentors across various categories who are ready to help you succeed.
          </p>
        </div>
        
        {categorizedMentors.slice(0, visibleCategories).map(({ category, mentors: categoryMentors }) => (
          <div key={category} className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to={`/mentors?category=${encodeURIComponent(category)}`}>
                <Button variant="outline" className="border-matepeak-primary text-matepeak-primary hover:bg-gray-100">
                  View All {category} Mentors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="text-center mb-12">
            <Button 
              variant="outline"
              onClick={handleLoadMore}
              className="border-matepeak-secondary text-matepeak-secondary hover:bg-matepeak-secondary hover:text-white transition-all duration-200"
            >
              Load More Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link to="/mentors">
            <Button className="bg-matepeak-primary hover:bg-matepeak-yellow hover:text-matepeak-primary text-white transition-all duration-200">
              View All Mentors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMentors;
