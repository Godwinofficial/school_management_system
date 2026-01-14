import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { Users, School, TrendingUp, Award, BookOpen, AlertCircle, GraduationCap, UserCheck, Shield, Calendar, BarChart3, Link as LinkIcon, Copy, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  totalClasses: number;
  maleStudents: number;
  femaleStudents: number;
  activeStudents: number;
  unassignedStudents: number;
  specialNeedsStudents: number;
  gradeDistribution: { grade: number; count: number }[];
  recentEnrollments: number;
}

export default function Dashboard() {
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSchools: 0,
    totalClasses: 0,
    maleStudents: 0,
    femaleStudents: 0,
    activeStudents: 0,
    unassignedStudents: 0,
    specialNeedsStudents: 0,
    gradeDistribution: [],
    recentEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "School portal access link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.school?.id, userLevel]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (userLevel === 'school' && user?.school?.id) {
        // Fetch school-specific data
        const [studentsRes, classesRes, profilesRes] = await Promise.all([
          supabase
            .from('students')
            .select('*')
            .eq('school_id', user.school.id),
          supabase
            .from('classes')
            .select('*')
            .eq('school_id', user.school.id),
          supabase
            .from('profiles')
            .select('*')
            .eq('school_id', user.school.id)
        ]);

        const students = studentsRes.data || [];
        const classes = classesRes.data || [];
        const teachers = (profilesRes.data || []).filter(p =>
          p.role && ['head_teacher', 'deputy_head', 'senior_teacher', 'subject_teacher'].includes(p.role)
        );

        // Calculate grade distribution
        const gradeMap = new Map<number, number>();
        students.forEach(s => {
          if (s.current_grade) {
            gradeMap.set(s.current_grade, (gradeMap.get(s.current_grade) || 0) + 1);
          }
        });
        const gradeDistribution = Array.from(gradeMap.entries())
          .map(([grade, count]) => ({ grade, count }))
          .sort((a, b) => a.grade - b.grade);

        // Recent enrollments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEnrollments = students.filter(s =>
          s.created_at && new Date(s.created_at) >= thirtyDaysAgo
        ).length;

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalSchools: 1,
          totalClasses: classes.length,
          maleStudents: students.filter(s => s.gender === 'Male').length,
          femaleStudents: students.filter(s => s.gender === 'Female').length,
          activeStudents: students.filter(s => s.status === 'active').length,
          unassignedStudents: students.filter(s => !s.class_id).length,
          specialNeedsStudents: students.filter(s => s.special_needs === true).length,
          gradeDistribution,
          recentEnrollments
        });

      } else if (userLevel === 'system') {
        // Fetch system-wide data
        const [studentsRes, schoolsRes, profilesRes, classesRes] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact' }),
          supabase.from('schools').select('*', { count: 'exact' }),
          supabase.from('profiles').select('*'),
          supabase.from('classes').select('*', { count: 'exact' })
        ]);

        const students = studentsRes.data || [];
        const teachers = (profilesRes.data || []).filter(p =>
          p.role && ['head_teacher', 'deputy_head', 'senior_teacher', 'subject_teacher'].includes(p.role)
        );

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalSchools: schoolsRes.data?.length || 0,
          totalClasses: classesRes.data?.length || 0,
          maleStudents: students.filter(s => s.gender === 'Male').length,
          femaleStudents: students.filter(s => s.gender === 'Female').length,
          activeStudents: students.filter(s => s.status === 'active').length,
          unassignedStudents: students.filter(s => !s.class_id).length,
          specialNeedsStudents: students.filter(s => s.special_needs === true).length,
          gradeDistribution: [],
          recentEnrollments: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'Morning' :
      new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
    return `Good ${timeOfDay}, ${user.firstName}!`;
  };

  const getLevelTitle = () => {
    switch (userLevel) {
      case 'system': return 'Platform Administration Dashboard';
      case 'school': return user.school?.name || 'School Dashboard';
      case 'district': return `${user.district} District Dashboard`;
      case 'provincial': return `${user.province} Provincial Dashboard`;
      case 'national': return 'National Education Dashboard';
      default: return 'Dashboard';
    }
  };

  const capacityUtilization = user.school ?
    Math.round((stats.totalStudents / user.school.standardCapacity) * 100) : 0;

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-6 rounded-2xl shadow-sm border border-border/50">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight">
            {getLevelTitle()}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">{getWelcomeMessage()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Session</p>
            <p className="text-sm font-bold text-foreground">Term 1, 2026</p>
          </div>
          <div className="h-8 w-[1px] bg-border hidden md:block" />
          <Badge variant={userLevel === 'national' || userLevel === 'system' ? 'default' : 'secondary'} className="text-xs px-3 py-1 h-8 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3 h-3" />
            {userLevel === 'system' ? 'Super Admin' : userLevel.charAt(0).toUpperCase() + userLevel.slice(1) + ' Level'}
          </Badge>
        </div>
      </div>

      {/* School Portal Access Link - Only for Staff */}
      {user.school && ['head_teacher', 'deputy_head', 'senior_teacher', 'subject_teacher'].includes(user.role) && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">School Portal Access Link</CardTitle>
                  <CardDescription>Share this link with school administrators and students</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div className="w-full bg-background border border-border px-10 py-2.5 rounded-xl text-sm font-mono truncate shadow-inner">
                  {`${window.location.origin}/login?school=${user.school.slug}`}
                </div>
              </div>
              <Button
                onClick={() => handleCopyLink(`${window.location.origin}/login?school=${user.school.slug}`)}
                variant={copied ? "outline" : "default"}
                className={`w-full sm:w-auto gap-2 shadow-md transition-all duration-300 ${copied ? 'border-success text-success' : ''}`}
              >
                {copied ? <Check className="h-4 w-4 animate-in zoom-in" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Students (or Schools for System) */}
        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userLevel === 'system' ? 'Total Schools' : 'Total Students'}
            </CardTitle>
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
              {userLevel === 'system' ? <School className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {loading ? '...' : (userLevel === 'system' ? stats.totalSchools.toLocaleString() : stats.totalStudents.toLocaleString())}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
              {userLevel === 'system' ? (
                <span className="text-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> All Systems Operational
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {stats.maleStudents} Male</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> {stats.femaleStudents} Female</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Teachers/Schools (or Active Students for System) */}
        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-success/20 hover:border-success/50 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-colors duration-500" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userLevel === 'school' ? 'Staff Members' : userLevel === 'system' ? 'Total Students' : 'Schools'}
            </CardTitle>
            <div className="h-10 w-10 bg-success/10 rounded-xl flex items-center justify-center text-success group-hover:scale-110 group-hover:bg-success group-hover:text-white transition-all duration-300 shadow-sm">
              {userLevel === 'school' ? (
                <GraduationCap className="h-5 w-5" />
              ) : userLevel === 'system' ? (
                <Users className="h-5 w-5" />
              ) : (
                <School className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {loading ? '...' : (userLevel === 'school' ? stats.totalTeachers : userLevel === 'system' ? stats.totalStudents.toLocaleString() : stats.totalSchools)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {userLevel === 'school'
                ? `${stats.totalTeachers} Active Staff`
                : userLevel === 'system'
                  ? 'Across all schools'
                  : 'Educational Institutions'
              }
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Classes/Active (or Total Teachers for System) */}
        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-warning/20 hover:border-warning/50 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-warning/10 rounded-full blur-2xl group-hover:bg-warning/20 transition-colors duration-500" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userLevel === 'school' ? 'Classes' : userLevel === 'system' ? 'Total Staff' : 'Active Students'}
            </CardTitle>
            <div className="h-10 w-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning group-hover:scale-110 group-hover:bg-warning group-hover:text-white transition-all duration-300 shadow-sm">
              {userLevel === 'school' ? (
                <BookOpen className="h-5 w-5" />
              ) : userLevel === 'system' ? (
                <GraduationCap className="h-5 w-5" />
              ) : (
                <UserCheck className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {loading ? '...' : (userLevel === 'school' ? stats.totalClasses : userLevel === 'system' ? stats.totalTeachers.toLocaleString() : stats.activeStudents)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {userLevel === 'school' ? 'Active Classes' : userLevel === 'system' ? 'Across all schools' : 'Currently Enrolled'}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Unassigned/Special (or Expiring Subs for System) */}
        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-destructive/20 hover:border-destructive/50 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-colors duration-500" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userLevel === 'school' ? 'Unassigned' : userLevel === 'system' ? 'Total Classes' : 'Special Needs'}
            </CardTitle>
            <div className="h-10 w-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive group-hover:scale-110 group-hover:bg-destructive group-hover:text-white transition-all duration-300 shadow-sm">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {loading ? '...' : (userLevel === 'school'
                ? stats.unassignedStudents
                : userLevel === 'system'
                  ? stats.totalClasses
                  : stats.specialNeedsStudents)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {userLevel === 'school' ? 'Students without class' : userLevel === 'system' ? 'System-wide' : 'Students with disability'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* School Specific Information */}
      {userLevel === 'school' && user.school && (
        <>
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-success" />
            <CardHeader>
              <CardTitle className="text-xl">School Information</CardTitle>
              <CardDescription>
                Current school details and capacity utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="text-3xl font-bold text-primary">{user.school.standardCapacity}</div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Standard Capacity</p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="text-3xl font-bold text-foreground">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Current Enrollment</p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-foreground">{capacityUtilization}%</div>
                    <div className="text-sm text-muted-foreground mb-1.5">Utilization</div>
                  </div>
                  <Progress
                    value={capacityUtilization}
                    className="mt-3 h-2"
                    indicatorClassName={capacityUtilization > 100 ? "bg-destructive" : capacityUtilization > 90 ? "bg-warning" : "bg-success"}
                  />
                </div>
              </div>
              <div className="mt-6 p-5 bg-secondary/20 rounded-2xl border border-border/50">
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Center Number</span>
                    <span className="font-semibold">{user.school.centerNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Type</span>
                    <span className="font-semibold">{user.school.type}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Location</span>
                    <span className="font-semibold">{user.school.ward}, {user.school.district}, {user.school.province}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution Chart */}
          {stats.gradeDistribution.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Student Distribution by Grade
                </CardTitle>
                <CardDescription>Visual breakdown of student enrollment across grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.gradeDistribution.map(({ grade, count }) => {
                    const percentage = (count / stats.totalStudents) * 100;
                    return (
                      <div key={grade} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Grade {grade}</span>
                          <span className="text-muted-foreground">{count} students ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>New enrollments and key metrics from the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{stats.recentEnrollments}</div>
                  <p className="text-sm text-muted-foreground mt-1">New Enrollments (30 days)</p>
                </div>
                <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                  <div className="text-2xl font-bold text-success">{stats.activeStudents}</div>
                  <p className="text-sm text-muted-foreground mt-1">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}