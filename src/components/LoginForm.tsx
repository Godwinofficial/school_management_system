import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { GraduationCap, BookOpen } from "lucide-react";
import heroImage from "@/assets/education-hero.jpg";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = AuthService.login(email, password);
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.firstName}!`,
        });
        
        // Redirect based on user type
        if (user.role === 'student') {
          navigate('/student');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Try demo accounts.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/10 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={heroImage} 
          alt="Students learning with modern technology in a Zambian school" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-success/90 flex items-center justify-center">
          <div className="text-center text-white p-8 space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <GraduationCap className="h-16 w-16" />
              </div>
            </div>
            <h2 className="text-5xl font-bold">
              National Education Registry
            </h2>
            <p className="text-xl opacity-95 max-w-md mx-auto leading-relaxed">
              Empowering Zambian Education Through Digital Innovation
            </p>
            <div className="flex items-center justify-center gap-8 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">12,500+</div>
                <div className="text-sm opacity-90">Schools</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.2M+</div>
                <div className="text-sm opacity-90">Students</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">180K+</div>
                <div className="text-sm opacity-90">Teachers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary-light rounded-2xl text-white shadow-lg">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Education Registry
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              National Education Registration Scheme
            </p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your educational management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-success hover:from-primary-dark hover:to-success-light"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Demo Accounts
                </h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div><strong>Head Teacher:</strong> head@school.zm</div>
                  <div><strong>District Director:</strong> district@education.zm</div>
                  <div><strong>Student:</strong> student@school.zm</div>
                  <div className="mt-2"><strong>Password:</strong> 123456</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}