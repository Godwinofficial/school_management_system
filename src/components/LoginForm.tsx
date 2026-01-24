import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/lib/auth";
import { StorageService, School } from "@/lib/storage";
import { SchoolService } from "@/lib/SchoolService";
import { toast } from "@/hooks/use-toast";
import { GraduationCap, ArrowRight, CheckCircle2, ShieldCheck, Users, Loader2, School as SchoolIcon, MapPin, Eye, EyeOff } from "lucide-react";
import heroImage from "@/assets/education-hero.jpg";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [school, setSchool] = useState<School | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const testimonials = [
    {
      quote: "This system has revolutionized how we manage student records. It's efficient, transparent, and easy to use.",
      author: "Sarah Mumba",
      role: "Head Teacher, Lusaka"
    },
    {
      quote: "Tracking national education statistics has never been easier. A true game-changer for our ministry.",
      author: "Dr. John Phiri",
      role: "District Education Officer"
    },
    {
      quote: "I can finally access my students' performance data in real-time. Highly recommended!",
      author: "Grace Lungu",
      role: "Senior Teacher"
    }
  ];

  useEffect(() => {
    const schoolId = searchParams.get('schoolId');
    const slug = searchParams.get('school');

    if (schoolId || slug) {
      const loadSchool = async () => {
        console.log("Checking school:", schoolId || slug);
        let foundSchool = null;

        if (schoolId) {
          foundSchool = await SchoolService.getSchool(schoolId);
        } else if (slug) {
          foundSchool = await SchoolService.getSchoolBySlug(slug);
        }

        if (foundSchool) {
          setSchool(foundSchool);
        } else if (schoolId) {
          // Fallback to StorageService (Mock) if not found in DB or error
          const mockSchool = StorageService.getSchool(schoolId);
          if (mockSchool) setSchool(mockSchool);
        }
      };
      loadSchool();
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a slight delay for the animation feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const user = await AuthService.login(email, password, school?.id);

      if (user) {
        // Dynamic Link Support:
        // If the user used a dynamic link with ?schoolId=..., we want to immerse them in THAT school's context
        // if they are authorized. For now, we update their current session's school context to match the link.
        // This solves the issue where a generic user logs in but needs to be in a specific school context.
        // NOTE: This updates the LOCAL SESSION only, not the DB.
        if (school) {
          // Define permissions: System Admins & External Officials can access any portal
          const isExempt =
            user.role === 'super_admin' ||
            user.role.startsWith('district') ||
            user.role.startsWith('provincial') ||
            user.role.startsWith('national') ||
            user.role.startsWith('director') ||
            user.role === 'permanent_secretary';

          if (!isExempt) {
            // Strict Check for School Staff & Students
            // They MUST belong to the school they are trying to access.

            // Normalize IDs for comparison (handle potential number vs string differences)
            const userSchoolId = user.school?.id ? String(user.school.id) : null;
            const targetSchoolId = String(school.id);

            console.log(`[Security Check] User: ${user.email} (${user.role}) | UserSchool: ${userSchoolId} | Target: ${targetSchoolId}`);

            if (userSchoolId !== targetSchoolId) {
              console.warn(`[Security Block] User ${user.email} from school ${userSchoolId} attempted to access ${targetSchoolId}`);
              toast({
                title: "Access Restricted",
                description: "You validly authenticated, but you do not belong to this school. Please log in via your own school's login page.",
                variant: "destructive",
              });
              setIsLoading(false);
              return; // STOP EXECUTION
            }
          }
        }

        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${user.firstName} ${user.lastName}`,
          className: "bg-success text-white border-none"
        });

        if (user.role === 'student') {
          const slug = user.school?.slug || 'national';
          navigate(`/${slug}/student`); // Was /student-portal, but App.tsx says /student
        } else if (user.role === 'guardian') {
          const slug = user.school?.slug || 'national';
          navigate(`/${slug}/parent`); // Redirect to Parent Portal
        } else {
          if (user.school) {
            // Check if slug is somehow still broken (e.g. "godwin-banda") and fix it before navigating
            const slugToUse = user.school.slug || (user.school.name ? user.school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'school');
            navigate(`/${slugToUse}/dashboard`);
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid credentials. Please check your username/email and password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "System Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: 'teacher' | 'head' | 'district' | 'admin' | 'deputy' | 'senior' | 'student') => {
    const creds = {
      teacher: { email: 'teacher@school.zm', pass: '123456' },
      head: { email: 'head@school.zm', pass: '123456' },
      district: { email: 'district@education.zm', pass: '123456' },
      admin: { email: 'admin@system.zm', pass: '123456' },
      deputy: { email: 'deputy@school.zm', pass: '123456' },
      senior: { email: 'senior@school.zm', pass: '123456' },
      student: { email: 'S008', pass: 'S008' }
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  // extended quick demo to include provincial
  const fillDemoExtended = (role: 'provincial' | 'teacher' | 'head' | 'district' | 'admin' | 'deputy' | 'senior' | 'student') => {
    if (role === 'provincial') {
      setEmail('provincial@education.zm');
      setPassword('123456');
      return;
    }
    // fallback to existing mapping
    fillDemo(role as any);
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
      {/* Mobile Header - Branding Section */}
      <div className="lg:hidden relative bg-zinc-900 text-white p-6 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Education Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-purple-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-base font-medium tracking-tight mb-3">
            {school ? (
              <>
                <SchoolIcon className="w-5 h-5" />
                <span>{school.name}</span>
              </>
            ) : (
              <span>National Education Registry</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
            {school ? (
              <span>Welcome to <span className="text-blue-300">{school.name}</span></span>
            ) : (
              <span>Empowering the Future of <span className="text-blue-300">Zambian Education</span></span>
            )}
          </h1>

          <p className="text-sm text-blue-100/80 mb-4 leading-relaxed max-w-md mx-auto">
            {school ?
              `A premier ${school.type} institution in ${school.district}, ${school.province}, committed to academic excellence and holistic student development. Join our digital learning community.`
              : "A comprehensive digital platform for managing schools, students, and academic performance across the nation."}
          </p>
        </div>
      </div>

      {/* Desktop Left Side - Visuals & Branding */}
      <div className="hidden lg:flex flex-col justify-between relative bg-zinc-900 text-white p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Education Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-purple-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-lg font-medium tracking-tight">
            {school ? (
              <>
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <SchoolIcon className="w-6 h-6" />
                </div>
                <span>{school.name} Portal</span>
              </>
            ) : (
              <>
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span>National Education Registry</span>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            {school ? (
              <>Welcome to <span className="text-blue-300">{school.name}</span></>
            ) : (
              <>Empowering the Future of <span className="text-blue-300">Zambian Education</span></>
            )}
          </h1>

          <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
            {school ?
              `A premier ${school.type} institution in ${school.district}, ${school.province}, committed to academic excellence and holistic student development. Join our digital learning community.`
              : "A comprehensive digital platform for managing schools, students, and academic performance across the nation."}
          </p>

          <div className="flex gap-6 text-sm font-medium text-blue-100/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              <span>Secure Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-300" />
              <span>Real-time Stats</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-300" />
              <span>Easy Reporting</span>
            </div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-12">
          <div className="h-24 relative">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
              >
                <p className="text-lg font-medium leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center text-xs font-bold">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.author}</div>
                    <div className="text-xs text-blue-200/60">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-6">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/20'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50 dark:bg-zinc-950 relative">
        <div className="w-full max-w-[400px] space-y-6 sm:space-y-8 relative z-10">

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {school ? "School Login" : "Welcome back"}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-zinc-800">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email, Username (Student ID), or Parent Phone</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@school.zm, ID, or Phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-transparent border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary/80">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-transparent border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-xs text-center text-slate-500 mb-4 uppercase tracking-wider font-medium">Quick Demo Access</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => fillDemoExtended('admin')}
                  className="text-xs p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => fillDemoExtended('head')}
                  className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  Head Teacher
                </button>
                <button
                  onClick={() => fillDemoExtended('deputy')}
                  className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  Deputy
                </button>
                <button
                  onClick={() => fillDemoExtended('senior')}
                  className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  Senior T.
                </button>
                <button
                  onClick={() => fillDemoExtended('teacher')}
                  className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  Teacher
                </button>
                <button
                  onClick={() => fillDemoExtended('student')}
                  className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  Student
                </button>
                <button
                  onClick={() => fillDemoExtended('district')}
                  className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  District
                </button>
                <button
                  onClick={() => fillDemoExtended('provincial')}
                  className="text-xs p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all shadow-sm"
                >
                  Provincial
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <a href="#" className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4">
              Contact Administration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}