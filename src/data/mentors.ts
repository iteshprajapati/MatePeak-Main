import { MentorProfile } from "@/components/MentorCard";

// Mock mentor data grouped by categories
export const mentors: MentorProfile[] = [
  // Recent Graduates (Seniors)
  {
    id: "1",
    name: "Aisha Patel",
    title: "Senior @ IIT Delhi | Computer Science",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    categories: ["Recent Graduates", "Programming", "Peer Mentoring"],
    rating: 4.9,
    reviewCount: 45,
    price: 499,
    bio: "Final year Computer Science student helping juniors with academics and placement preparation.",
    connectionOptions: ["1:1 Call", "Chat", "Mock Interview"]
  },
  {
    id: "2",
    name: "Raj Kumar",
    title: "Senior @ BITS Pilani | Mechanical",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    categories: ["Recent Graduates", "Engineering", "Project Guidance"],
    rating: 4.7,
    reviewCount: 38,
    price: 399,
    bio: "Helping juniors with project selection and implementation.",
    connectionOptions: ["1:1 Call", "Chat", "Document Review"]
  },
  {
    id: "3",
    name: "Sneha Singh",
    title: "Senior @ VIT Vellore | Electronics",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    categories: ["Recent Graduates", "Electronics", "Career Guidance"],
    rating: 4.8,
    reviewCount: 42,
    price: 449,
    bio: "Helping students with electronics projects and internship preparation.",
    connectionOptions: ["1:1 Call", "Group Session", "Mock Interview"]
  },
  {
    id: "4",
    name: "Arjun Reddy",
    title: "Senior @ IIIT Hyderabad | Data Science",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    categories: ["Recent Graduates", "Data Science", "Programming"],
    rating: 4.8,
    reviewCount: 35,
    price: 549,
    bio: "Guiding juniors in data science projects and placements.",
    connectionOptions: ["1:1 Call", "Chat", "Document Review"]
  },

  // Academic Support
  {
    id: "5",
    name: "Dr. Meera Desai",
    title: "PhD in Mathematics | IISc",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb",
    categories: ["Academic Support", "Mathematics", "Research"],
    rating: 4.9,
    reviewCount: 89,
    price: 1299,
    bio: "Mathematics expert specializing in advanced calculus and numerical methods.",
    connectionOptions: ["1:1 Call", "Group Session", "Doubt Solving"]
  },
  {
    id: "6",
    name: "Prof. Ramesh Kumar",
    title: "Professor @ IIT Bombay",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919",
    categories: ["Academic Support", "Physics", "Engineering"],
    rating: 4.7,
    reviewCount: 167,
    price: 999,
    bio: "Experienced professor helping students master complex physics concepts.",
    connectionOptions: ["1:1 Call", "Group Session", "Notes"]
  },
  {
    id: "7",
    name: "Dr. Anjali Sharma",
    title: "Professor @ Delhi University",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    categories: ["Academic Support", "Chemistry", "Research"],
    rating: 4.8,
    reviewCount: 124,
    price: 899,
    bio: "Chemistry expert specializing in organic chemistry and research guidance.",
    connectionOptions: ["1:1 Call", "Lab Guidance", "Doubt Solving"]
  },
  {
    id: "8",
    name: "Prof. Suresh Iyer",
    title: "HOD @ NIT Trichy",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    categories: ["Academic Support", "Computer Science", "Research"],
    rating: 4.9,
    reviewCount: 156,
    price: 1199,
    bio: "Computer Science professor specializing in algorithms and system design.",
    connectionOptions: ["1:1 Call", "Project Review", "Research Guidance"]
  },

  // Mock Interview Experts
  {
    id: "9",
    name: "Vikram Malhotra",
    title: "Senior SDE @ Google",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    categories: ["Mock Interviews", "Technical", "Career Guidance"],
    rating: 4.9,
    reviewCount: 234,
    price: 1999,
    bio: "Tech interview expert with 8+ years of interviewing experience.",
    connectionOptions: ["Mock Interview", "Resume Review", "1:1 Call"]
  },
  {
    id: "10",
    name: "Priya Mehta",
    title: "HR Manager @ Microsoft",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
    categories: ["Mock Interviews", "HR", "Career Guidance"],
    rating: 4.8,
    reviewCount: 189,
    price: 1499,
    bio: "HR professional helping candidates ace behavioral interviews.",
    connectionOptions: ["Mock Interview", "Resume Review", "Interview Prep"]
  },
  {
    id: "11",
    name: "Rahul Verma",
    title: "Product Manager @ Amazon",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
    categories: ["Mock Interviews", "Product", "Career Guidance"],
    rating: 4.9,
    reviewCount: 167,
    price: 1799,
    bio: "Product interview expert with experience in FAANG companies.",
    connectionOptions: ["Mock Interview", "Case Study Prep", "1:1 Call"]
  },
  {
    id: "12",
    name: "Neha Singh",
    title: "Tech Lead @ Netflix",
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56",
    categories: ["Mock Interviews", "System Design", "Career Guidance"],
    rating: 4.8,
    reviewCount: 145,
    price: 1899,
    bio: "System design and architecture interview specialist.",
    connectionOptions: ["Mock Interview", "System Design", "Code Review"]
  },

  // Resume Review Experts
  {
    id: "13",
    name: "Karthik Raman",
    title: "Career Coach | Ex-LinkedIn",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296",
    categories: ["Resume Review", "Career Guidance"],
    rating: 4.9,
    reviewCount: 278,
    price: 999,
    bio: "Professional resume writer with expertise in tech and business profiles.",
    connectionOptions: ["Resume Review", "LinkedIn Review", "1:1 Call"]
  },
  {
    id: "14",
    name: "Anita Desai",
    title: "Talent Acquisition | Ex-IBM",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    categories: ["Resume Review", "Career Guidance"],
    rating: 4.8,
    reviewCount: 234,
    price: 899,
    bio: "Helping candidates create impactful resumes that stand out.",
    connectionOptions: ["Resume Review", "Cover Letter", "Profile Review"]
  },
  {
    id: "15",
    name: "Sanjay Gupta",
    title: "Career Strategist | IIM-A",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    categories: ["Resume Review", "Career Guidance", "MBA"],
    rating: 4.9,
    reviewCount: 189,
    price: 1299,
    bio: "MBA admissions and career transition resume expert.",
    connectionOptions: ["Resume Review", "SoP Review", "Strategy Call"]
  },
  {
    id: "16",
    name: "Maya Krishnan",
    title: "Technical Resume Expert",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604",
    categories: ["Resume Review", "Technical", "Career Guidance"],
    rating: 4.8,
    reviewCount: 156,
    price: 799,
    bio: "Specializing in technical resume optimization for software roles.",
    connectionOptions: ["Resume Review", "GitHub Review", "Portfolio Review"]
  },

  // Health & Wellness
  {
    id: "17",
    name: "Dr. Sanya Kapoor",
    title: "Mental Health Counselor",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    categories: ["Health", "Mental Wellness"],
    rating: 4.9,
    reviewCount: 189,
    price: 899,
    bio: "Licensed counselor helping students manage academic stress.",
    connectionOptions: ["1:1 Call", "Group Session", "Chat Support"]
  },
  {
    id: "18",
    name: "Rohit Mehta",
    title: "Fitness Coach & Nutritionist",
    image: "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c",
    categories: ["Health", "Fitness", "Nutrition"],
    rating: 4.8,
    reviewCount: 167,
    price: 799,
    bio: "Helping students maintain a healthy lifestyle during academics.",
    connectionOptions: ["1:1 Call", "Diet Plan", "Workout Plan"]
  },
  {
    id: "19",
    name: "Dr. Priya Sharma",
    title: "Wellness Coach | Yoga Expert",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883",
    categories: ["Health", "Yoga", "Meditation"],
    rating: 4.9,
    reviewCount: 145,
    price: 699,
    bio: "Yoga and meditation expert for stress management.",
    connectionOptions: ["1:1 Session", "Group Class", "Meditation Guide"]
  },
  {
    id: "20",
    name: "Dr. Arjun Singh",
    title: "Sports Physiotherapist",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
    categories: ["Health", "Sports", "Fitness"],
    rating: 4.8,
    reviewCount: 134,
    price: 999,
    bio: "Sports injury prevention and rehabilitation specialist.",
    connectionOptions: ["1:1 Session", "Injury Assessment", "Recovery Plan"]
  }
];

// Helper function to get mentors by category
export const getMentorsByCategory = (category: string): MentorProfile[] => {
  return mentors.filter(mentor => mentor.categories.includes(category));
};

// Get mentor by ID
export const getMentorById = (id: string): MentorProfile | undefined => {
  return mentors.find(mentor => mentor.id === id);
};

// Filter mentors based on search criteria
export const filterMentors = (
  searchTerm: string = "",
  categories: string[] = [],
  priceRange: number[] = [0, 5000]
): MentorProfile[] => {
  return mentors.filter(mentor => {
    const matchesSearchTerm = searchTerm === "" || 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = categories.length === 0 || 
      categories.some(category => 
        mentor.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
      );
    
    const matchesPrice = mentor.price >= priceRange[0] && mentor.price <= priceRange[1];
    
    return matchesSearchTerm && matchesCategories && matchesPrice;
  });
};
