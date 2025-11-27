import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, BarChart3, Shield, Award, FileText } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student records, enrollment, and tracking system"
    },
    {
      icon: GraduationCap,
      title: "Teacher Management",
      description: "Manage staff, class assignments, and performance tracking"
    },
    {
      icon: BookOpen,
      title: "Academic Records",
      description: "Track grades, performance, and academic progression"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Real-time statistics and comprehensive reporting tools"
    },
    {
      icon: Shield,
      title: "Multi-Level Access",
      description: "Role-based access for national, provincial, district, and school levels"
    },
    {
      icon: Award,
      title: "Performance Tracking",
      description: "Monitor student progress and identify areas for improvement"
    }
  ];

  const stats = [
    { label: "Schools Nationwide", value: "12,500+" },
    { label: "Active Students", value: "4.2M+" },
    { label: "Teachers", value: "180K+" },
    { label: "Provinces", value: "10" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-success/10 rounded-full border border-primary/20">
              {/* <GraduationCap className="h-8 w-8 text-primary" /> */}
              <span className="font-bold text-lg text-foreground">National Education Registry</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary-light to-success bg-clip-text text-transparent">
                Modern Education
              </span>
              <br />
              <span className="text-foreground">Management System</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Streamline school operations, manage student records, and gain insights with our comprehensive
              education management platform designed for Zambian schools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="text-base px-8"
              >
                <Shield className="mr-2 h-5 w-5" />
                Access Portal
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/student-portal')}
                className="text-base px-8"
              >
                <Users className="mr-2 h-5 w-5" />
                Student Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive School Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage educational institutions efficiently and effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-primary via-primary-light to-success border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <CardContent className="pt-12 pb-12 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your School Management?
              </h2>
              <p className="text-lg text-white/90">
                Join thousands of schools across Zambia using our platform to streamline operations
                and improve educational outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="text-base px-8"
                >
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="text-base px-8 border-white/30 hover:bg-white/10 text-white hover:text-white"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  View Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              {/* <GraduationCap className="h-6 w-6 text-primary" /> */}
              <span className="font-bold text-foreground">Education Registry</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} National Education Registry System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
