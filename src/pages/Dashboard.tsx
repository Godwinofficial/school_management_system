import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { Users, School, TrendingUp, Award, BookOpen, AlertCircle, GraduationCap, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();
  
  if (!user) return null;

  // Get statistics based on user level
  const stats = StorageService.getStatistics(
    userLevel === 'student' ? 'school' : userLevel, 
    userLevel === 'school' || userLevel === 'student' ? user.school?.id : undefined
  );

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 
                     new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
    return `Good ${timeOfDay}, ${user.firstName}!`;
  };

  const getLevelTitle = () => {
    switch (userLevel) {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            {getLevelTitle()}
          </h1>
          <p className="text-muted-foreground mt-1">{getWelcomeMessage()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={userLevel === 'national' ? 'default' : 'secondary'} className="text-xs">
            {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.genderStats.male} Male, {stats.genderStats.female} Female
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userLevel === 'school' ? 'Teachers' : 'Schools'}
            </CardTitle>
            {userLevel === 'school' ? (
              <GraduationCap className="h-4 w-4 text-success" />
            ) : (
              <School className="h-4 w-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userLevel === 'school' ? stats.totalTeachers : stats.totalSchools}
            </div>
            <p className="text-xs text-muted-foreground">
              {userLevel === 'school' 
                ? `${stats.teacherStats?.active || 0} Active Teachers`
                : 'Educational Institutions'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userLevel === 'school' ? 'Classes' : 'Active Students'}
            </CardTitle>
            {userLevel === 'school' ? (
              <BookOpen className="h-4 w-4 text-warning" />
            ) : (
              <TrendingUp className="h-4 w-4 text-warning" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userLevel === 'school' ? stats.totalClasses : stats.statusStats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {userLevel === 'school' 
                ? `Capacity: ${stats.capacityStats?.totalCapacity || 0}`
                : 'Currently enrolled'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.performanceStats.excellent + stats.performanceStats.good}
            </div>
            <p className="text-xs text-muted-foreground">
              Excellent & Good performers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Performance Overview */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Academic Performance
            </CardTitle>
            <CardDescription>
              Student performance distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.performanceStats).map(([level, count]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{level.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Progress 
                  value={stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Special Needs & Status */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Special Attention
            </CardTitle>
            <CardDescription>
              Students requiring special attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Orphaned Students</span>
                <Badge variant="outline">{stats.specialStats.orphans}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Students with Disabilities</span>
                <Badge variant="outline">{stats.specialStats.withDisability}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Married Students</span>
                <Badge variant="outline">{stats.specialStats.married}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Dropped Out</span>
                <Badge variant="destructive">{stats.statusStats.droppedOut}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff & Capacity Info (School Level Only) */}
        {userLevel === 'school' && (
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-success" />
                Staff & Capacity
              </CardTitle>
              <CardDescription>
                Teacher status and class capacity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Active Teachers</span>
                  <Badge variant="default">{stats.teacherStats?.active || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">On Leave</span>
                  <Badge variant="secondary">{stats.teacherStats?.onLeave || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Students in Classes</span>
                  <Badge variant="outline">{stats.capacityStats?.studentsInClasses || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Unassigned Students</span>
                  <Badge variant={stats.capacityStats?.unassignedStudents > 0 ? "destructive" : "outline"}>
                    {stats.capacityStats?.unassignedStudents || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* School Specific Information */}
      {userLevel === 'school' && user.school && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>School Information</CardTitle>
            <CardDescription>
              Current school details and capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-2xl font-bold">{user.school.standardCapacity}</div>
                <p className="text-xs text-muted-foreground">Standard Capacity</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.school.totalEnrolment}</div>
                <p className="text-xs text-muted-foreground">Current Enrollment</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{capacityUtilization}%</div>
                <p className="text-xs text-muted-foreground">Capacity Utilization</p>
                <Progress value={capacityUtilization} className="mt-2" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid gap-2 text-sm">
                <div><strong>Center Number:</strong> {user.school.centerNumber}</div>
                <div><strong>Type:</strong> {user.school.type}</div>
                <div><strong>Location:</strong> {user.school.ward}, {user.school.district}, {user.school.province}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}