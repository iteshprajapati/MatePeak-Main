import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import MentorSearch from "./pages/MentorSearch";
import Explore from "./pages/Explore";
import MentorProfile from "./pages/MentorProfile";
import MentorProfileByUsername from "./pages/MentorProfileByUsername";
import MentorPublicProfile from "./pages/MentorPublicProfile";
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";
import Dashboard from "./pages/Dashboard";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import RoleSelection from "./pages/RoleSelection";
import StudentSignup from "./pages/StudentSignup";
import StudentLogin from "./pages/StudentLogin";
import MentorSignup from "./pages/MentorSignup";
import ExpertLogin from "./pages/ExpertLogin";
import ExpertOnboarding from "./pages/ExpertOnboarding";
import ExpertDashboard from "./pages/ExpertDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mentors" element={<MentorSearch />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route path="/mentor/:username" element={<MentorPublicProfile />} />
          <Route path="/profile/:username" element={<MentorPublicProfile />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/signup" element={<RoleSelection />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/mentor/signup" element={<MentorSignup />} />
          <Route path="/expert/signup" element={<MentorSignup />} />
          <Route path="/expert/login" element={<ExpertLogin />} />
          <Route path="/expert/onboarding" element={<ExpertOnboarding />} />
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/dashboard/:username" element={<MentorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
