import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Check user role from metadata
      const userRole = data.user?.user_metadata?.role;
      
      if (userRole === 'student') {
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else if (userRole === 'mentor') {
        toast.error("Please use the mentor sign-in page");
      } else {
        toast.error("Invalid account type");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back, Student!"
      description="Sign in to your student account"
      footer="Don't have an account?"
      footerLink="/student/signup"
      footerLinkText="Sign up"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="student@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
          />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
        
        <div className="text-center mt-4">
          <Link to="/expert/login" className="text-sm text-matepeak-primary hover:underline">
            Sign in as a Mentor instead
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}