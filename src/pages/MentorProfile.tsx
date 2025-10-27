
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Clock, BookOpen, MessageSquare, Award, CheckCircle, Mail } from "lucide-react";
import { getMentorById } from "@/data/mentors";
import { MentorProfile as MentorProfileType } from "@/components/MentorCard";

const MentorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<MentorProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundMentor = getMentorById(id);
      if (foundMentor) {
        setMentor(foundMentor);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading mentor profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center flex-col p-8">
          <h2 className="text-2xl font-bold mb-4">Mentor Not Found</h2>
          <p className="text-gray-600 mb-6">
            The mentor you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/mentors">
            <Button className="bg-mentor-primary hover:bg-mentor-secondary text-white">
              Browse All Mentors
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Profile Header */}
        <div className="bg-mentor-light/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <img
                src={mentor.image}
                alt={mentor.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-1">{mentor.name}</h1>
                <p className="text-gray-600 text-lg mb-2">{mentor.title}</p>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{mentor.rating}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-gray-600">{mentor.reviewCount} reviews</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-mentor-primary mr-1" />
                    <span className="text-gray-600">30 sessions completed</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-mentor-primary mr-1" />
                    <span className="text-gray-600">Usually responds in 2 hours</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {mentor.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="bg-mentor-light text-mentor-primary border-mentor-light">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="text-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-gray-600 text-sm mb-1">Session Price</p>
                  <p className="text-2xl font-bold text-mentor-primary">₹{mentor.price}/hr</p>
                </div>
                
                <Link to={`/book/${mentor.id}`} className="w-full">
                  <Button className="w-full bg-mentor-primary hover:bg-mentor-secondary text-white">
                    Book a Session
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full border-mentor-primary text-mentor-primary">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="about">
            <TabsList className="mb-8">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="sessions">Session Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">About {mentor.name}</h2>
                <p className="text-gray-600 leading-relaxed">{mentor.bio}</p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  I believe in a personalized approach to mentoring, focusing on each student's unique needs and learning style. My goal is to not just help you with immediate problems, but to equip you with the skills and knowledge to succeed in the long term.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Areas of Expertise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentor.categories.map((category, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{category}</h4>
                        <p className="text-gray-600 text-sm">
                          {index === 0 
                            ? "Providing in-depth guidance and practical solutions to complex problems in this area."
                            : "Offering strategic advice and hands-on support to help you excel in this domain."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="experience" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Professional Experience</h2>
                <div className="space-y-6">
                  <div className="border-l-2 border-mentor-primary pl-4 ml-2">
                    <h3 className="font-medium text-lg">Current Position</h3>
                    <p className="text-gray-600">{mentor.title}</p>
                    <p className="text-gray-500 text-sm">2020 - Present</p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-4 ml-2">
                    <h3 className="font-medium text-lg">Previous Experience</h3>
                    <p className="text-gray-600">Senior Associate</p>
                    <p className="text-gray-500 text-sm">2016 - 2020</p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-4 ml-2">
                    <h3 className="font-medium text-lg">Education</h3>
                    <p className="text-gray-600">Master's Degree, Top University</p>
                    <p className="text-gray-500 text-sm">2014 - 2016</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Certifications & Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Industry Certification</h4>
                      <p className="text-gray-600 text-sm">Certified Professional in relevant field</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Teaching Excellence Award</h4>
                      <p className="text-gray-600 text-sm">Recognized for outstanding mentorship</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Reviews ({mentor.reviewCount})</h2>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-lg">{mentor.rating}</span>
                    <span className="text-gray-500 text-sm ml-1">/ 5</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Sample reviews */}
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <h4 className="font-medium">Rahul K.</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm ml-2">1 month ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      The session was extremely helpful! {mentor.name} explained complex concepts in a way that was easy to understand, and provided practical advice I could implement right away.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <h4 className="font-medium">Priya S.</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm ml-2">2 months ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      I've had multiple sessions with {mentor.name} and each one has been valuable. The personalized approach and follow-up materials have really helped me improve.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div>
                        <h4 className="font-medium">Vikram M.</h4>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm ml-2">3 months ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Thanks to {mentor.name}'s guidance, I was able to ace my interview and secure a job offer! The mock interview sessions were incredibly realistic and the feedback was invaluable.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Available Session Types</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-mentor-light flex items-center justify-center mr-4">
                        <BookOpen className="h-6 w-6 text-mentor-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">One-on-One Mentoring</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Personalized guidance tailored to your specific needs and goals.
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <span className="text-mentor-primary font-bold">₹{mentor.price}</span>
                            <span className="text-gray-500"> / hour</span>
                          </div>
                          <Badge variant="outline" className="bg-mentor-light text-mentor-primary border-mentor-light">
                            Most Popular
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-mentor-light flex items-center justify-center mr-4">
                        <MessageSquare className="h-6 w-6 text-mentor-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Quick Consultation</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Brief 30-minute sessions for specific questions or quick advice.
                        </p>
                        <div className="mt-3">
                          <span className="text-mentor-primary font-bold">₹{Math.round(mentor.price / 2)}</span>
                          <span className="text-gray-500"> / 30 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">What to Expect</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Pre-Session Questionnaire</h4>
                      <p className="text-gray-600 text-sm">Fill out a brief form to help your mentor prepare for your specific needs.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Video Call Session</h4>
                      <p className="text-gray-600 text-sm">Connect via our secure video platform for your scheduled session.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Follow-Up Resources</h4>
                      <p className="text-gray-600 text-sm">Receive personalized resources and action items after your session.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-mentor-primary mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Satisfaction Guarantee</h4>
                      <p className="text-gray-600 text-sm">If you're not satisfied with your session, we offer a full refund.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to={`/book/${mentor.id}`}>
                  <Button className="bg-mentor-primary hover:bg-mentor-secondary text-white px-8">
                    Book a Session Now
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MentorProfile;
