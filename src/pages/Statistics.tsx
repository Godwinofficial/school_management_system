import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { BarChart3, TrendingUp, Users, Award, AlertTriangle, Calendar, Target, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Statistics() {
  const [timeFilter, setTimeFilter] = useState("current");
  const [refreshing, setRefreshing] = useState(false);

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  const stats = StorageService.getStatistics(
    userLevel === 'student' ? 'school' : userLevel, 
    userLevel === 'school' || userLevel === 'student' ? user?.school?.id : undefined
  );

  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getTrendData = () => {
    // Simulate trend data for demonstration
    return {
      enrollment: [
        { period: "Jan", value: stats.totalStudents * 0.85 },
        { period: "Feb", value: stats.totalStudents * 0.88 },
        { period: "Mar", value: stats.totalStudents * 0.92 },
        { period: "Apr", value: stats.totalStudents * 0.95 },
        { period: "May", value: stats.totalStudents }
      ],
      performance: [
        { period: "Term 1", excellent: stats.performanceStats.excellent * 0.8, good: stats.performanceStats.good * 0.9 },
        { period: "Term 2", excellent: stats.performanceStats.excellent * 0.9, good: stats.performanceStats.good * 0.95 },
        { period: "Term 3", excellent: stats.performanceStats.excellent, good: stats.performanceStats.good }
      ]
    };
  };

  const trendData = getTrendData();

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';  
      case 'warning': return 'text-warning';
      case 'danger': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const keyMetrics = [
    {
      title: "Enrollment Rate",
      value: `${calculatePercentage(stats.statusStats.active, stats.totalStudents)}%`,
      change: "+3.2%",
      status: "excellent",
      description: "Active students vs total capacity"
    },
    {
      title: "Academic Excellence",
      value: `${calculatePercentage(stats.performanceStats.excellent + stats.performanceStats.good, stats.totalStudents)}%`,
      change: "+5.1%", 
      status: "good",
      description: "Students with excellent/good performance"
    },
    {
      title: "Retention Rate", 
      value: `${calculatePercentage(stats.totalStudents - stats.statusStats.droppedOut, stats.totalStudents)}%`,
      change: "-0.8%",
      status: "warning",
      description: "Students continuing education"
    },
    {
      title: "Special Support",
      value: `${calculatePercentage(stats.specialStats.orphans + stats.specialStats.withDisability, stats.totalStudents)}%`,
      change: "+1.2%",
      status: "good", 
      description: "Students requiring special attention"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Statistical Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive data insights and trend analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Term</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <Badge 
                  variant={metric.change.startsWith('+') ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gender Distribution */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gender Distribution
            </CardTitle>
            <CardDescription>Student enrollment by gender</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Male Students</span>
                <span className="text-sm text-muted-foreground">
                  {stats.genderStats.male} ({calculatePercentage(stats.genderStats.male, stats.totalStudents)}%)
                </span>
              </div>
              <Progress 
                value={calculatePercentage(stats.genderStats.male, stats.totalStudents)} 
                className="h-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Female Students</span>
                <span className="text-sm text-muted-foreground">
                  {stats.genderStats.female} ({calculatePercentage(stats.genderStats.female, stats.totalStudents)}%)
                </span>
              </div>
              <Progress 
                value={calculatePercentage(stats.genderStats.female, stats.totalStudents)} 
                className="h-3"
              />
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Gender Parity Index</div>
              <div className="text-2xl font-bold text-primary">
                {stats.genderStats.male > 0 ? (stats.genderStats.female / stats.genderStats.male).toFixed(2) : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Female to Male ratio</div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Performance Breakdown */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Academic Performance
            </CardTitle>
            <CardDescription>Performance level distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.performanceStats).map(([level, count]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {level.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {count} ({calculatePercentage(count, stats.totalStudents)}%)
                  </span>
                </div>
                <Progress 
                  value={calculatePercentage(count, stats.totalStudents)} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Student Status Analysis */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Status Analysis
          </CardTitle>
          <CardDescription>Comprehensive breakdown of student status and special categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Status Distribution */}
            <div className="space-y-4">
              <h4 className="font-medium">Enrollment Status</h4>
              {Object.entries(stats.statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm capitalize">{status.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="text-right">
                    <div className="font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {calculatePercentage(count, stats.totalStudents)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Categories */}
            <div className="space-y-4">
              <h4 className="font-medium">Special Categories</h4>
              {Object.entries(stats.specialStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm capitalize">
                    {category === 'withDisability' ? 'With Disability' : 
                     category === 'orphans' ? 'Orphans' : category}
                  </span>
                  <div className="text-right">
                    <div className="font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {calculatePercentage(count, stats.totalStudents)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Indicators */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Risk Indicators
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="font-medium text-destructive">High Risk</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.statusStats.droppedOut} students dropped out
                  </div>
                </div>
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="font-medium text-warning">Medium Risk</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.performanceStats.poor + stats.performanceStats.belowAverage} underperforming
                  </div>
                </div>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="font-medium text-primary">Attention Needed</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.specialStats.orphans + stats.specialStats.withDisability} need support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>Historical data trends and projections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-4">Enrollment Trends</h4>
              <div className="space-y-3">
                {trendData.enrollment.map((data, index) => (
                  <div key={data.period} className="flex items-center justify-between">
                    <span className="text-sm">{data.period}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(data.value / stats.totalStudents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-12 text-right">
                        {Math.round(data.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Performance Trends</h4>
              <div className="space-y-3">
                {trendData.performance.map((data, index) => (
                  <div key={data.period} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <span className="text-xs text-muted-foreground">
                        Excellent: {Math.round(data.excellent)} | Good: {Math.round(data.good)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1 bg-muted rounded h-2">
                        <div 
                          className="bg-success h-2 rounded transition-all duration-300"
                          style={{ width: `${(data.excellent / stats.totalStudents) * 100}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-muted rounded h-2">
                        <div 
                          className="bg-primary h-2 rounded transition-all duration-300"
                          style={{ width: `${(data.good / stats.totalStudents) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparative Analysis */}
      {userLevel !== 'school' && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Comparative Analysis
            </CardTitle>
            <CardDescription>
              Performance comparison across {userLevel === 'district' ? 'schools' : userLevel === 'provincial' ? 'districts' : 'provinces'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Comparative analysis data will be available when multiple {userLevel === 'district' ? 'schools' : 'units'} are registered</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}