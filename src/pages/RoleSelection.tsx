import { Link } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-matepeak-primary via-matepeak-secondary to-matepeak-primary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png" 
              alt="MatePeak Logo"
              className="h-16 mx-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Join MatePeak</h1>
          <p className="text-white/90 text-lg">Choose how you want to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/student/signup">
            <Card className="h-full cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-[#FFD966]">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-matepeak-primary/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-matepeak-primary" />
                </div>
                <CardTitle className="text-2xl">I'm a Student</CardTitle>
                <CardDescription className="text-base">
                  Find mentors and book sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Browse expert mentors
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Book 1-on-1 sessions
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Get personalized guidance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link to="/mentor/signup">
            <Card className="h-full cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-[#FFD966]">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-matepeak-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-matepeak-primary" />
                </div>
                <CardTitle className="text-2xl">I'm a Mentor</CardTitle>
                <CardDescription className="text-base">
                  Share your expertise and earn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Create your expert profile
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Set your own rates
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Help students succeed
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-center mt-6 text-white/80">
          Already have an account?{" "}
          <Link to="/expert/login" className="text-[#FFD966] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
