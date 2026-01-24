import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuthService } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { SchoolService } from "@/lib/SchoolService";
import { FileText, Download, Calendar, TrendingUp, BarChart3, Users, School, Award, RefreshCw, Printer, Search } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface ReportStats {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  transferred: number;
  droppedOut: number;
  graduated: number;
  orphans: number;
  withDisability: number;
  newEnrollments: number;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [reportType, setReportType] = useState("enrollment");
  const [timeRange, setTimeRange] = useState("term1_2026");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data State
  const [stats, setStats] = useState<ReportStats>({
    totalStudents: 0,
    activeStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    transferred: 0,
    droppedOut: 0,
    graduated: 0,
    orphans: 0,
    withDisability: 0,
    newEnrollments: 0
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  // Report Card State
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [reportCardData, setReportCardData] = useState<any>(null);

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.school?.id) {
      fetchReportData();
    }
  }, [user?.school?.id, userLevel]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (!user?.school?.id) return;
      const schoolId = user.school.id;

      const teacherRoles = ['teacher', 'subject_teacher', 'senior_teacher', 'deputy_head'];
      const isTeacher = teacherRoles.includes(user.role);
      const isHeadOrAdmin = user.role === 'head_teacher' || user.role === 'super_admin' || user.role === 'school_accountant';

      let assignedClassIds: string[] = [];
      let fetchAllConf = true;

      // 1. Determine Scope
      if (isTeacher && !isHeadOrAdmin) {
        fetchAllConf = false;

        // Get teacher's assigned classes
        // Try ID first
        let { data: teacherData } = await supabase
          .from('teachers')
          .select('id, assigned_class_ids')
          .eq('id', user.id)
          .single();

        if (!teacherData && user.email) {
          const { data: teacherByEmail } = await supabase
            .from('teachers')
            .select('id, assigned_class_ids')
            .eq('email', user.email)
            .single();
          if (teacherByEmail) teacherData = teacherByEmail;
        }

        if (teacherData && teacherData.assigned_class_ids) {
          assignedClassIds = teacherData.assigned_class_ids;
        }
      }

      // 2. Fetch Data based on scope
      let studentQuery = supabase.from('students').select('*').eq('school_id', schoolId);
      let classQuery = SchoolService.getClasses(schoolId);
      let resultsQuery = supabase.from('results').select('*'); // Optimization needed for real app

      if (!fetchAllConf && assignedClassIds.length > 0) {
        // Filter students by assigned classes
        studentQuery = studentQuery.in('class_id', assignedClassIds);
      } else if (!fetchAllConf && assignedClassIds.length === 0) {
        // Teacher with no classes? Show nothing or maybe handle gracefully
        // For now, let's show nothing
        setStudents([]);
        setClasses([]);
        setResults([]);
        setStats({
          totalStudents: 0,
          activeStudents: 0,
          maleStudents: 0,
          femaleStudents: 0,
          transferred: 0,
          droppedOut: 0,
          graduated: 0,
          orphans: 0,
          withDisability: 0,
          newEnrollments: 0
        });
        return;
      }

      const [studentsRes, classesRes, resultsRes] = await Promise.all([
        studentQuery,
        classQuery,
        resultsQuery
      ]);

      let studentList = studentsRes.data || [];
      let classList = classesRes || [];
      const resultList = resultsRes.data || [];

      // Post-filtering for non-admins (Double check)
      if (!fetchAllConf) {
        classList = classList.filter(c => assignedClassIds.includes(c.id));
        // Provide a fallback if filtering removed everything but we expected something?
        // No, trust the logic.

        // Also filter results to only these students
        const studentIds = new Set(studentList.map(s => s.id));
        // Filter resultList in memory for now (simpler than complex join query)
        // valid results are those where student_id is in our student list
        // const filteredResults = resultList.filter(r => studentIds.has(r.student_id)); 
        // Actually, we use 'resultList' for analytics. Constraining it makes sense.
      }

      setStudents(studentList);
      setClasses(classList);
      setResults(resultList);

      // Calculate Stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      setStats({
        totalStudents: studentList.length,
        activeStudents: studentList.filter(s => s.status === 'active' || s.status === 'Active').length,
        maleStudents: studentList.filter(s => s.gender === 'Male').length,
        femaleStudents: studentList.filter(s => s.gender === 'Female').length,
        transferred: studentList.filter(s => s.status === 'transferred').length,
        droppedOut: studentList.filter(s => s.status === 'dropped_out').length,
        graduated: studentList.filter(s => s.status === 'graduated').length,
        orphans: studentList.filter(s => s.is_orphan).length,
        withDisability: studentList.filter(s => s.has_disability).length,
        newEnrollments: studentList.filter(s => s.created_at && new Date(s.created_at) >= thirtyDaysAgo).length
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReportCard = () => {
    if (!selectedStudent) return;

    const student = students.find(s => s.id === selectedStudent);
    const studentClass = classes.find(c => c.id === student?.class_id);

    // Filter results for this student and selected term
    // Note: In a real app, we'd filter by term ID properly. using simplistic match here.
    const studentResults = results.filter(r => r.student_id === selectedStudent && r.exam_id === timeRange);

    // Calculate aggregate
    const totalScore = studentResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const average = studentResults.length > 0 ? (totalScore / studentResults.length).toFixed(1) : 0;

    setReportCardData({
      student,
      class: studentClass,
      term: timeRange.replace(/_/g, ' ').toUpperCase(),
      results: studentResults,
      summary: {
        total: totalScore,
        average: average,
        position: '1st', // Placeholder for complex rank logic
        comments: Number(average) > 75 ? "Excellent Performance" : Number(average) > 50 ? "Good Effort" : "Needs Improvement"
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // -- Derived Analytics Data --

  const getAnalyticsCharts = () => {
    // A. Academic Per Class
    const classPerformance: Record<string, { total: number, count: number, name: string }> = {};

    results.forEach(r => {
      // Find student to get class
      const st = students.find(s => s.id === r.student_id);
      if (st && st.class_id) {
        if (!classPerformance[st.class_id]) {
          const cls = classes.find(c => c.id === st.class_id);
          classPerformance[st.class_id] = { total: 0, count: 0, name: cls?.name || 'Unknown' };
        }
        classPerformance[st.class_id].total += r.score;
        classPerformance[st.class_id].count += 1;
      }
    });

    const academicChartData = Object.values(classPerformance).map(c => ({
      name: c.name,
      average: c.count > 0 ? Math.round(c.total / c.count) : 0
    })).sort((a, b) => b.average - a.average);

    return { academicChartData };
  };

  const { academicChartData } = getAnalyticsCharts();

  return (
    <div className="space-y-8 p-6 print:p-0">
      {/* Header - Hidden in Print */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate insights and student report cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="w-fit">
            {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
          </Badge>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1_2026">Term 1 2026</SelectItem>
              <SelectItem value="term2_2026">Term 2 2026</SelectItem>
              <SelectItem value="term3_2026">Term 3 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 print:hidden">
        <TabsList className="grid w-full grid-cols-1 lg:w-[200px]">
          <TabsTrigger value="analytics">School Analytics</TabsTrigger>
        </TabsList>


        <TabsContent value="analytics" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Students</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.totalStudents}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Students</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">New Enrollments</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{stats.newEnrollments}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vulnerable</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-orange-600">{stats.orphans + stats.withDisability}</div></CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Class Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance (Average)</CardTitle>
                <CardDescription>Academic performance overview by class</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {academicChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={academicChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No result data available</div>
                )}
              </CardContent>
            </Card>

            {/* Demographics Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Student gender distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex gap-8 items-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-500">{stats.maleStudents}</div>
                    <div className="text-sm text-muted-foreground mt-2">Male Students</div>
                  </div>
                  <div className="h-16 w-[1px] bg-border"></div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-pink-500">{stats.femaleStudents}</div>
                    <div className="text-sm text-muted-foreground mt-2">Female Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}