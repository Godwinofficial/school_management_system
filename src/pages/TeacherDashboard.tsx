import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { SupabaseService, TeacherData, ClassData, Exam, Assessment } from "@/lib/SupabaseService";
import { StudentService } from "@/lib/StudentService";
import { Users, BookOpen, BookMarked, Clock, Calendar, CheckCircle, AlertCircle, BookText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ClassPerformance {
  subjects: Array<{
    name: string;
    averageScore: number;
    topPerformer: {
      name: string;
      score: number;
    };
    improvementNeeded: {
      name: string;
      score: number;
    };
  }>;
  overallAverage: number;
  classRank?: number;
}

export default function TeacherDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    teacherData: TeacherData;
    classData: ClassData | null;
    upcomingExams: Exam[];
    pendingAssessments: Assessment[];
    studentPerformance: ClassPerformance | null;
  } | null>(null);

  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        // 1. Get Teacher Profile
        const teacherProfile = await SupabaseService.getTeacherProfile(user.id);

        // If no teacher profile found in DB, we might need fallback or error
        // For now, let's construct a basic one if missing (using user details)
        const teacherId = teacherProfile?.id || user.id;
        const subjects = teacherProfile?.subjects && typeof teacherProfile.subjects === 'object'
          ? (Array.isArray(teacherProfile.subjects) ? teacherProfile.subjects : Object.keys(teacherProfile.subjects))
          : ['General'];

        // 2. Get Schedule
        const { data: scheduleData } = await SupabaseService.getTeacherSchedule(teacherId);
        const todaysSchedule = scheduleData?.map((s: any) => ({
          time: `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
          subject: s.subject?.name || s.subject_id || 'Class',
          class: s.class?.name || s.class_id || 'Unknown',
          type: 'class',
          topic: ''
        })) || [];

        const constructedTeacherData: TeacherData = {
          id: teacherId,
          assignedClass: teacherProfile?.assigned_class_ids?.[0] || 'Unknown',
          subjects: subjects,
          todaysSchedule
        };

        // 3. Get Class Data (Aggregation of all assigned classes)
        const assignedClassIds = teacherProfile?.assigned_class_ids || [];

        // Fetch all students in the school
        let allStudents = [];
        if (user.school?.id) {
          allStudents = await StudentService.getStudents(user.school.id);
        }

        // Filter students belonging to any of the teacher's assigned classes
        // If no classes assigned, filter by teacher's primary classId if valid
        let myStudents = [];
        if (assignedClassIds.length > 0) {
          myStudents = allStudents.filter(s => s.classId && assignedClassIds.includes(s.classId));
        } else if (user.classId) {
          myStudents = allStudents.filter(s => s.classId === user.classId);
        }

        // Calculate stats
        const totalStudents = myStudents.length;
        const maleCount = myStudents.filter(s => s.gender === 'Male').length;
        const femaleCount = myStudents.filter(s => s.gender === 'Female').length;

        // Find students needing attention (mock logic or based on performance)
        const studentsNeedingAttention = myStudents
          .filter(s => s.overallPerformance === 'Poor' || s.overallPerformance === 'Below Average')
          .map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.surname}`,
            subject: 'General', // We don't have subject specific performance in student object yet
            issue: `Performance is ${s.overallPerformance}`,
            severity: s.overallPerformance === 'Poor' ? 'high' : 'medium'
          }));

        const classData: ClassData = {
          id: 'aggregated',
          name: 'My Classes',
          totalStudents,
          genderStats: {
            male: maleCount,
            female: femaleCount
          },
          studentsNeedingAttention: studentsNeedingAttention as any
        };


        // 4. Exams & Assessments
        const schoolId = user.school?.id;
        const upcomingExams = schoolId ? await SupabaseService.getUpcomingExams(schoolId) : [];
        const pendingAssessments = await SupabaseService.getPendingAssessments(teacherId);

        // 5. Performance (Mock for now as backend calculation is complex)
        const studentPerformance: ClassPerformance = {
          subjects: subjects.map((sub: string) => ({
            name: sub,
            averageScore: Math.floor(Math.random() * 30) + 60,
            topPerformer: { name: 'Student A', score: 95 },
            improvementNeeded: { name: 'Student B', score: 45 }
          })),
          overallAverage: 70,
          classRank: 1
        };

        setDashboardData({
          teacherData: constructedTeacherData,
          classData,
          upcomingExams,
          pendingAssessments,
          studentPerformance
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome!';
    const timeOfDay = new Date().getHours() < 12 ? 'Morning' :
      new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
    return `Good ${timeOfDay}, ${user.firstName || 'Teacher'}!`;
  };

  if (!user) {
    return <div className="p-4">Please log in to view the dashboard</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="p-4">No data available</div>;
  }

  const { teacherData, classData, upcomingExams, pendingAssessments, studentPerformance } = dashboardData;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">{getWelcomeMessage()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {teacherData.assignedClass && teacherData.assignedClass !== 'Unknown' ? teacherData.assignedClass : 'Subject Teacher'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {teacherData.subjects?.join(', ') || 'No subjects'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {classData?.genderStats?.male || 0} Boys, {classData?.genderStats?.female || 0} Girls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherData.subjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {teacherData.subjects?.join(', ') || 'No subjects'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingExams?.[0]?.subject ? `Next: ${upcomingExams[0].subject}` : 'No upcoming exams'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingAssessments?.reduce((sum, item) => sum + (item.pendingGrading || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingAssessments?.length || 0} assignments to grade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Class Performance
            </CardTitle>
            <CardDescription>Overall performance in your subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {studentPerformance?.subjects && studentPerformance.subjects.length > 0 ? (
              <div className="space-y-4">
                {studentPerformance.subjects.map((subject) => (
                  <div key={subject.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <span className="text-sm">{subject.averageScore}%</span>
                    </div>
                    <Progress value={subject.averageScore} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No performance data available yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes and activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            {teacherData.todaysSchedule?.length > 0 ? (
              <div className="space-y-3">
                {teacherData.todaysSchedule.map((item, index) => (
                  <div key={index} className="flex items-start p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.subject} - {item.class}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                      {item.topic && <p className="text-xs mt-1">Topic: {item.topic}</p>}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <p className="text-muted-foreground text-sm">No classes scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students Needing Attention */}
      {classData?.studentsNeedingAttention?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Students Needing Attention
            </CardTitle>
            <CardDescription>Students who may need extra support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classData.studentsNeedingAttention.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.subject}: {student.issue}
                    </p>
                  </div>
                  <Badge variant={student.severity === 'high' ? 'destructive' : 'secondary'}>
                    {student.severity === 'high' ? 'High Priority' : 'Needs Attention'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
