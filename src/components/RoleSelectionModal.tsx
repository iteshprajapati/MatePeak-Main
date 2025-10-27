import { useNavigate } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleSelectionModal = ({ open, onOpenChange }: RoleSelectionModalProps) => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'student' | 'mentor') => {
    onOpenChange(false);
    navigate(role === 'student' ? '/student/signup' : '/mentor/signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Join MatePeak</DialogTitle>
          <DialogDescription className="text-center">
            Choose how you want to get started
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-matepeak-primary"
            onClick={() => handleRoleSelect('student')}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 w-16 h-16 bg-matepeak-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-matepeak-primary" />
              </div>
              <CardTitle className="text-xl">I'm a Student</CardTitle>
              <CardDescription className="text-sm">
                Find mentors and book sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5 text-xs text-muted-foreground">
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

          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-matepeak-primary"
            onClick={() => handleRoleSelect('mentor')}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 w-16 h-16 bg-matepeak-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-matepeak-primary" />
              </div>
              <CardTitle className="text-xl">I'm a Mentor</CardTitle>
              <CardDescription className="text-sm">
                Share your expertise and earn
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5 text-xs text-muted-foreground">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal;
