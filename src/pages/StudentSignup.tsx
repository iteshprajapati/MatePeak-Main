import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const StudentSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: 'student'
          }
        }
      });

      if (error) throw error;

      // With email confirmation disabled, session should be available immediately
      if (data.session) {
        toast({
          title: "Account created!",
          description: "Welcome to MatePeak!",
        });
        navigate("/");
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        navigate("/expert/login");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-matepeak-primary via-matepeak-secondary to-matepeak-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="/lovable-uploads/14bf0eea-1bc9-4675-9231-356df10eb82d.png" 
              alt="MatePeak Logo"
              className="h-12 mx-auto"
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create Student Account</h2>
          <p className="text-gray-600 mt-2">Start learning with expert mentors</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="student@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-matepeak-primary hover:bg-matepeak-secondary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/expert/login" className="text-matepeak-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center mt-4 text-sm text-gray-600">
          Want to become a mentor?{" "}
          <Link to="/mentor/signup" className="text-matepeak-primary hover:underline font-medium">
            Sign up as mentor
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentSignup;
