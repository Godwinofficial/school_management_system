import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { FileText, Download, Calendar, TrendingUp, BarChart3, Users, School, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Reports() {
  const [reportType, setReportType] = useState("enrollment");
  const [timeRange, setTimeRange] = useState("current");
  const [generating, setGenerating] = useState(false);

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  const stats = StorageService.getStatistics(
    userLevel === 'student' ? 'school' : userLevel, 
    userLevel === 'school' || userLevel === 'student' ? user?.school?.id : undefined
  );

  const reportTypes = [
    { value: "enrollment", label: "Enrollment Report", icon: Users },
    { value: "academic", label: "Academic Performance Report", icon: Award },
    { value: "attendance", label: "Attendance Report", icon: Calendar },
    { value: "demographic", label: "Demographic Analysis", icon: BarChart3 },
    { value: "capacity", label: "Capacity Utilization", icon: School },
    { value: "trends", label: "Trend Analysis", icon: TrendingUp }
  ];

  const timeRanges = [
    { value: "current", label: "Current Term" },
    { value: "quarterly", label: "Last Quarter" },
    { value: "annual", label: "Annual Report" },
    { value: "custom", label: "Custom Range" }
  ];

  const generateReport = async () => {
    setGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    
    // In a real app, this would generate and download the actual report
    const fileName = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log(`Generated report: ${fileName}`);
  };

  const getReportData = () => {
    switch (reportType) {
      case "enrollment":
        return {
          title: "Enrollment Analysis",
          data: [
            { label: "Total Students", value: stats.totalStudents, change: "+5.2%" },
            { label: "Active Students", value: stats.statusStats.active, change: "+3.1%" },
            { label: "New Enrollments", value: Math.floor(stats.totalStudents * 0.1), change: "+12.3%" },
            { label: "Transfers", value: stats.statusStats.transferred, change: "-2.1%" }
          ]
        };
      case "academic":
        return {
          title: "Academic Performance Overview",
          data: [
            { label: "Excellent Performance", value: stats.performanceStats.excellent, change: "+8.5%" },
            { label: "Good Performance", value: stats.performanceStats.good, change: "+4.2%" },
            { label: "Average Performance", value: stats.performanceStats.average, change: "-1.3%" },
            { label: "Below Average", value: stats.performanceStats.belowAverage, change: "-5.7%" }
          ]
        };
      case "demographic":
        return {
          title: "Demographic Breakdown",
          data: [
            { label: "Male Students", value: stats.genderStats.male, change: "+2.1%" },
            { label: "Female Students", value: stats.genderStats.female, change: "+3.4%" },
            { label: "Orphaned Students", value: stats.specialStats.orphans, change: "+1.2%" },
            { label: "Students with Disabilities", value: stats.specialStats.withDisability, change: "+0.8%" }
          ]
        };
      default:
        return {
          title: "General Report",
          data: [
            { label: "Total Records", value: stats.totalStudents, change: "+2.5%" },
            { label: "Active Records", value: stats.statusStats.active, change: "+1.8%" }
          ]
        };
    }
  };

  const reportData = getReportData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive reports and insights
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Level
        </Badge>
      </div>

      {/* Report Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-soft">
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
              className="w-full"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {reportData.title} - {timeRanges.find(r => r.value === timeRange)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-2xl font-bold text-primary">{item.value}</div>
                  </div>
                  <Badge 
                    variant={item.change.startsWith('+') ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {item.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>
            Pre-configured reports for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map(type => (
              <Card key={type.value} className="border cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <type.icon className="h-5 w-5" />
                    {type.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
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

      {/* Recent Reports */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Previously generated reports and downloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Enrollment Report - Q4 2024", date: "2024-12-15", size: "2.3 MB", status: "Ready" },
              { name: "Academic Performance - Annual", date: "2024-12-10", size: "4.1 MB", status: "Ready" },
              { name: "Demographic Analysis - Monthly", date: "2024-12-05", size: "1.8 MB", status: "Ready" },
              { name: "Capacity Utilization - Term 3", date: "2024-11-28", size: "0.9 MB", status: "Archived" }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated on {report.date} • {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Automated insights from your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="font-medium text-success">Positive Trend</div>
              <p className="text-sm text-muted-foreground mt-1">
                Student enrollment has increased by 5.2% compared to last term
              </p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="font-medium text-warning">Attention Needed</div>
              <p className="text-sm text-muted-foreground mt-1">
                Academic performance shows decline in Level 9 mathematics
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="font-medium text-primary">Opportunity</div>
              <p className="text-sm text-muted-foreground mt-1">
                Capacity utilization is at 85%, room for strategic expansion
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Report Schedule</CardTitle>
            <CardDescription>Automated report generation schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Weekly Enrollment Summary", frequency: "Every Monday", next: "2024-12-23" },
              { name: "Monthly Performance Report", frequency: "1st of each month", next: "2025-01-01" },
              { name: "Quarterly Analytics", frequency: "End of quarter", next: "2025-03-31" }
            ].map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{schedule.name}</div>
                  <div className="text-sm text-muted-foreground">{schedule.frequency}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Next: {schedule.next}</div>
                  <Badge variant="outline" className="text-xs">Automated</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}