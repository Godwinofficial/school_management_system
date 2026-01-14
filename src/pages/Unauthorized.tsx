import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/lib/auth";

export default function Unauthorized() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    // Automatically redirect to the appropriate dashboard based on user role
    if (user) {
      if (user.role === 'student') {
        navigate('/student', { replace: true });
      } else if (user.role === 'subject_teacher') {
        navigate('/teacher-dashboard', { replace: true });
      } else {
        // For all other roles, try to go to the main dashboard
        // If they don't have access there either, they'll see this page
        navigate('/dashboard', { replace: true });
      }
    } else {
      // If no user is logged in, redirect to login
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}