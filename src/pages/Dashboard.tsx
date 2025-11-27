import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { Users, School, TrendingUp, Award, BookOpen, AlertCircle, GraduationCap, UserCheck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  if (!user) return null;

  // Get statistics based on user level
  const stats = StorageService.getStatistics(
    userLevel === 'student' ? 'school' : userLevel === 'system' ? 'national' : userLevel,
    userLevel === 'school' || userLevel === 'student' ? user.school?.id : undefined
  );

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
    Math.round((user.school.totalEnrolment / user.school.standardCapacity) * 100) : 0;

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
            <p className="text-sm font-bold text-foreground">Term 1, 2025</p>
          </div>
          <div className="h-8 w-[1px] bg-border hidden md:block" />
          <Badge variant={userLevel === 'national' || userLevel === 'system' ? 'default' : 'secondary'} className="text-xs px-3 py-1 h-8 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3 h-3" />
            {userLevel === 'system' ? 'Super Admin' : userLevel.charAt(0).toUpperCase() + userLevel.slice(1) + ' Level'}
          </Badge>
        </div>
      </div>

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
              {userLevel === 'system' ? stats.totalSchools.toLocaleString() : stats.totalStudents.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
              {userLevel === 'system' ? (
                <span className="text-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> All Systems Operational
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {stats.genderStats.male} Male</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> {stats.genderStats.female} Female</span>
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
              {userLevel === 'school' ? 'Teachers' : userLevel === 'system' ? 'Total Students' : 'Schools'}
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
              {userLevel === 'school' ? stats.totalTeachers : userLevel === 'system' ? stats.totalStudents.toLocaleString() : stats.totalSchools}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {userLevel === 'school'
                ? `${stats.teacherStats?.active || 0} Active Teachers`
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
              {userLevel === 'school' ? 'Classes' : userLevel === 'system' ? 'Total Teachers' : 'Active Students'}
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
              {userLevel === 'school' ? stats.totalClasses : userLevel === 'system' ? stats.totalTeachers.toLocaleString() : stats.statusStats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {userLevel === 'school' ? 'Total Classes' : userLevel === 'system' ? 'Across all schools' : 'Currently Enrolled'}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Unassigned/Special (or Expiring Subs for System) */}
        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-destructive/20 hover:border-destructive/50 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-destructive/10 rounded-full blur-2xl group-hover:bg-destructive/20 transition-colors duration-500" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {userLevel === 'school' ? 'Unassigned' : userLevel === 'system' ? 'Expiring Subscriptions' : 'Special Needs'}
            </CardTitle>
            <div className="h-10 w-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive group-hover:scale-110 group-hover:bg-destructive group-hover:text-white transition-all duration-300 shadow-sm">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {userLevel === 'school'
                ? (stats.capacityStats?.unassignedStudents || 0)
                : userLevel === 'system'
                  ? 3 // Mocked value for expiring subscriptions
                  : (stats.specialStats?.withDisability || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {userLevel === 'school' ? 'Students without class' : userLevel === 'system' ? 'Renewals due this week' : 'Students with disability'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* School Specific Information */}
      {userLevel === 'school' && user.school && (
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
                <div className="text-3xl font-bold text-foreground">{user.school.totalEnrolment}</div>
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
      )}
    </div>
  );
}