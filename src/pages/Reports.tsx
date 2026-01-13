import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Download, Calendar, TrendingUp, BarChart3, Users, School, Award, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
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
  const [reportType, setReportType] = useState("enrollment");
  const [timeRange, setTimeRange] = useState("term1");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  useEffect(() => {
    fetchReportData();
  }, [user?.school?.id, userLevel]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      if (userLevel === 'school' && user?.school?.id) {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', user.school.id);

        if (students) {
          // Calculate 30 days ago for new enrollments
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          setStats({
            totalStudents: students.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            maleStudents: students.filter(s => s.gender === 'Male').length,
            femaleStudents: students.filter(s => s.gender === 'Female').length,
            transferred: students.filter(s => s.status === 'transferred').length,
            droppedOut: students.filter(s => s.status === 'dropped_out').length,
            graduated: students.filter(s => s.status === 'graduated').length,
            orphans: students.filter(s => s.orphan_status === 'orphan' || s.orphan_status === 'vulnerable').length,
            withDisability: students.filter(s => s.special_needs === true).length,
            newEnrollments: students.filter(s => s.created_at && new Date(s.created_at) >= thirtyDaysAgo).length
          });
        }
      } else if (userLevel === 'system') {
        const { data: students } = await supabase
          .from('students')
          .select('*');

        if (students) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          setStats({
            totalStudents: students.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            maleStudents: students.filter(s => s.gender === 'Male').length,
            femaleStudents: students.filter(s => s.gender === 'Female').length,
            transferred: students.filter(s => s.status === 'transferred').length,
            droppedOut: students.filter(s => s.status === 'dropped_out').length,
            graduated: students.filter(s => s.status === 'graduated').length,
            orphans: students.filter(s => s.orphan_status === 'orphan' || s.orphan_status === 'vulnerable').length,
            withDisability: students.filter(s => s.special_needs === true).length,
            newEnrollments: students.filter(s => s.created_at && new Date(s.created_at) >= thirtyDaysAgo).length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: "enrollment", label: "Enrollment Report", icon: Users },
    { value: "academic", label: "Academic Performance Report", icon: Award },
    { value: "attendance", label: "Attendance Report", icon: Calendar },
    { value: "demographic", label: "Demographic Analysis", icon: BarChart3 },
    { value: "capacity", label: "Capacity Utilization", icon: School },
    { value: "trends", label: "Trend Analysis", icon: TrendingUp }
  ];

  const timeRanges = [
    { value: "term1", label: "Term One" },
    { value: "term2", label: "Term Two" },
    { value: "term3", label: "Term Three" },
    { value: "annual", label: "Annual Report" }
  ];

  const generateReport = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);

    const fileName = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log(`Generated report: ${fileName}`);
  };

  const getReportData = () => {
    const enrollmentGrowth = stats.newEnrollments > 0 ? `+${((stats.newEnrollments / stats.totalStudents) * 100).toFixed(1)}%` : "+0%";
    const activeRate = stats.totalStudents > 0 ? `+${((stats.activeStudents / stats.totalStudents) * 100).toFixed(1)}%` : "+0%";

    switch (reportType) {
      case "enrollment":
        return {
          title: "Enrollment Analysis",
          data: [
            { label: "Total Students", value: stats.totalStudents, change: enrollmentGrowth },
            { label: "Active Students", value: stats.activeStudents, change: activeRate },
            { label: "New Enrollments (30d)", value: stats.newEnrollments, change: enrollmentGrowth },
            { label: "Transfers", value: stats.transferred, change: "-2.1%" }
          ],
          chartData: [
            { name: "Active", value: stats.activeStudents, color: "#10b981" },
            { name: "Transferred", value: stats.transferred, color: "#f59e0b" },
            { name: "Dropped Out", value: stats.droppedOut, color: "#ef4444" },
            { name: "Graduated", value: stats.graduated, color: "#3b82f6" }
          ]
        };
      case "demographic":
        return {
          title: "Demographic Breakdown",
          data: [
            { label: "Male Students", value: stats.maleStudents, change: "+2.1%" },
            { label: "Female Students", value: stats.femaleStudents, change: "+3.4%" },
            { label: "Orphaned/Vulnerable", value: stats.orphans, change: "+1.2%" },
            { label: "Students with Disabilities", value: stats.withDisability, change: "+0.8%" }
          ],
          chartData: [
            { name: "Male", value: stats.maleStudents, color: "#3b82f6" },
            { name: "Female", value: stats.femaleStudents, color: "#ec4899" }
          ]
        };
      default:
        return {
          title: "General Report",
          data: [
            { label: "Total Records", value: stats.totalStudents, change: "+2.5%" },
            { label: "Active Records", value: stats.activeStudents, change: "+1.8%" }
          ],
          chartData: []
        };
    }
  };

  const reportData = getReportData();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive reports and insights from real-time data
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
        </Badge>
      </div>

      {/* Report Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-soft animate-slide-up delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Configuration
            </CardTitle>
            <CardDescription>
              Select report type and parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateReport}
              disabled={generating}
              className="w-full transition-all active:scale-95"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft animate-slide-up delay-200">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {reportData.title} - {timeRanges.find(r => r.value === timeRange)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading data...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {reportData.data.map((item, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="font-medium text-sm text-muted-foreground">{item.label}</div>
                      <div className="flex items-end justify-between mt-1">
                        <div className="text-xl font-bold text-primary">{item.value}</div>
                        <Badge
                          variant={item.change.startsWith('+') ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {item.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {reportData.chartData.length > 0 && (
                  <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                          {reportData.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card className="border-0 shadow-soft animate-slide-up delay-300">
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>
            Pre-configured reports for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((type) => (
              <Card
                key={type.value}
                className="border cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                onClick={() => setReportType(type.value)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <type.icon className="h-5 w-5 text-primary" />
                    {type.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportType(type.value);
                      generateReport();
                    }}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated insights from your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg hover:bg-success/20 transition-colors">
            <div className="font-medium text-success">Positive Trend</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.newEnrollments} new students enrolled in the last 30 days
            </p>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
            <div className="font-medium text-primary">Gender Balance</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.maleStudents} male and {stats.femaleStudents} female students ({stats.femaleStudents > 0 ? ((stats.femaleStudents / (stats.maleStudents + stats.femaleStudents)) * 100).toFixed(1) : 0}% female)
            </p>
          </div>
          {stats.withDisability > 0 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg hover:bg-warning/20 transition-colors">
              <div className="font-medium text-warning">Special Support</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.withDisability} students with special needs requiring additional support
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}