import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { TrendingUp, Users, Award, AlertTriangle, RefreshCw, Target } from "lucide-react";
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

interface StatsData {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  activeStudents: number;
  transferred: number;
  droppedOut: number;
  graduated: number;
  orphans: number;
  withDisability: number;
  statusStats: {
    active: number;
    transferred: number;
    droppedOut: number;
    graduated: number;
  };
  specialStats: {
    orphans: number;
    withDisability: number;
    married: number;
  };
  performanceStats: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
}

export default function Statistics() {
  const [timeFilter, setTimeFilter] = useState("current");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    activeStudents: 0,
    transferred: 0,
    droppedOut: 0,
    graduated: 0,
    orphans: 0,
    withDisability: 0,
    statusStats: {
      active: 0,
      transferred: 0,
      droppedOut: 0,
      graduated: 0
    },
    specialStats: {
      orphans: 0,
      withDisability: 0,
      married: 0
    },
    performanceStats: {
      excellent: 0,
      good: 0,
      average: 0,
      belowAverage: 0,
      poor: 0
    }
  });

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  useEffect(() => {
    fetchStatistics();
  }, [user?.school?.id, userLevel]);

  /* 
   * Main function to fetch statistics data from Supabase.
   * Based on the user's role (School or System), it fetches relevant student data.
   * It populates the stats state with aggregated metrics and nested objects for
   * status, special categories, and performance.
   */
  const fetchStatistics = async () => {
    try {
      setLoading(true);

      if (userLevel === 'school' && user?.school?.id) {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', user.school.id);

        if (students) {
          setStats({
            totalStudents: students.length,
            maleStudents: students.filter(s => s.gender === 'Male').length,
            femaleStudents: students.filter(s => s.gender === 'Female').length,
            activeStudents: students.filter(s => s.status === 'active').length,
            transferred: students.filter(s => s.status === 'transferred').length,
            droppedOut: students.filter(s => s.status === 'dropped_out').length,
            graduated: students.filter(s => s.status === 'graduated').length,
            orphans: students.filter(s => s.orphan_status === 'orphan' || s.orphan_status === 'vulnerable').length,
            withDisability: students.filter(s => s.special_needs === true).length,
            statusStats: {
              active: students.filter(s => s.status === 'active').length,
              transferred: students.filter(s => s.status === 'transferred').length,
              droppedOut: students.filter(s => s.status === 'dropped_out').length,
              graduated: students.filter(s => s.status === 'graduated').length
            },
            specialStats: {
              orphans: students.filter(s => s.orphan_status === 'orphan' || s.orphan_status === 'vulnerable').length,
              withDisability: students.filter(s => s.special_needs === true).length,
              married: 0
            },
            performanceStats: {
              excellent: 0,
              good: 0,
              average: 0,
              belowAverage: 0,
              poor: 0
            }
          });
        }
      } else if (userLevel === 'system') {
        const { data: students } = await supabase
          .from('students')
          .select('*');

        if (students) {
          setStats({
            totalStudents: students.length,
            maleStudents: students.filter(s => s.gender === 'Male').length,
            femaleStudents: students.filter(s => s.gender === 'Female').length,
            activeStudents: students.filter(s => s.status === 'active').length,
            transferred: students.filter(s => s.status === 'transferred').length,
            droppedOut: students.filter(s => s.status === 'dropped_out').length,
            graduated: students.filter(s => s.status === 'graduated').length,
            orphans: students.filter(s => s.orphan_status === 'orphan' || s.orphan_status === 'vulnerable').length,
            withDisability: students.filter(s => s.special_needs === true).length,
            statusStats: {
              active: students.filter(s => s.status === 'active').length,
              transferred: students.filter(s => s.status === 'transferred').length,
              droppedOut: students.filter(s => s.status === 'dropped_out').length,
              graduated: students.filter(s => s.status === 'graduated').length
            },
            specialStats: {
              orphans: students.filter(s => s.orphan_status === 'orphan' || s.orphan_status === 'vulnerable').length,
              withDisability: students.filter(s => s.special_needs === true).length,
              married: 0
            },
            performanceStats: {
              excellent: 0,
              good: 0,
              average: 0,
              belowAverage: 0,
              poor: 0
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
  };

  const getTrendData = () => {
    return [
      { name: "Jan", enrollment: Math.round(stats.totalStudents * 0.85), performance: 75 },
      { name: "Feb", enrollment: Math.round(stats.totalStudents * 0.88), performance: 78 },
      { name: "Mar", enrollment: Math.round(stats.totalStudents * 0.92), performance: 82 },
      { name: "Apr", enrollment: Math.round(stats.totalStudents * 0.95), performance: 80 },
      { name: "May", enrollment: stats.totalStudents, performance: 85 }
    ];
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
      value: `${calculatePercentage(stats.activeStudents, stats.totalStudents)}%`,
      change: "+3.2%",
      status: "excellent",
      description: "Active students vs total capacity"
    },
    {
      title: "Gender Parity",
      value: stats.maleStudents > 0 ? (stats.femaleStudents / stats.maleStudents).toFixed(2) : 'N/A',
      change: "+2.1%",
      status: "good",
      description: "Female to male ratio"
    },
    {
      title: "Retention Rate",
      value: `${calculatePercentage(stats.totalStudents - stats.droppedOut, stats.totalStudents)}%`,
      change: "-0.8%",
      status: "warning",
      description: "Students continuing education"
    },
    {
      title: "Special Support",
      value: `${calculatePercentage(stats.orphans + stats.withDisability, stats.totalStudents)}%`,
      change: "+1.2%",
      status: "good",
      description: "Students requiring special attention"
    }
  ];

  const genderData = [
    { name: 'Male', value: stats.maleStudents },
    { name: 'Female', value: stats.femaleStudents },
  ];

  const COLORS = ['#3b82f6', '#ec4899']; // Blue for Male, Pink for Female

  const statusData = [
    { name: 'Active', value: stats.activeStudents, color: '#10b981' },
    { name: 'Transferred', value: stats.transferred, color: '#f59e0b' },
    { name: 'Dropped Out', value: stats.droppedOut, color: '#ef4444' },
    { name: 'Graduated', value: stats.graduated, color: '#3b82f6' },
  ];

  if (!AuthService.hasPermission('view_statistics')) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          You do not have permission to view school statistics. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
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
              <SelectItem value="quarterly">Termly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
            className="hover:bg-primary/10 transition-colors"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric, index) => (
          <Card
            key={index}
            className={`border-0 shadow-soft bg-gradient-to-br from-card to-card/50 animate-slide-up delay-${index * 100} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
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
        <Card className="border-0 shadow-soft hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gender Distribution
            </CardTitle>
            <CardDescription>Student enrollment by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm font-medium">Gender Parity Index</div>
              <div className="text-2xl font-bold text-primary">
                {stats.maleStudents > 0 ? (stats.femaleStudents / stats.maleStudents).toFixed(2) : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Female to Male ratio</div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Performance Breakdown */}
        <Card className="border-0 shadow-soft hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Student Status Distribution
            </CardTitle>
            <CardDescription>Enrollment status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="border-0 shadow-soft hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>Enrollment and performance trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="enrollment" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Enrollment" />
                <Line yAxisId="right" type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={2} name="Avg Performance (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Student Status Analysis */}
      <Card className="border-0 shadow-soft hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Analysis
          </CardTitle>
          <CardDescription>Student status and risk indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Status Distribution */}
            <div className="space-y-4">
              <h4 className="font-medium">Enrollment Status</h4>
              {Object.entries(stats.statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
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
                <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
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
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors">
                  <div className="font-medium text-destructive">High Risk</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.statusStats.droppedOut} students dropped out
                  </div>
                </div>
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg hover:bg-warning/20 transition-colors">
                  <div className="font-medium text-warning">Medium Risk</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.performanceStats.poor + stats.performanceStats.belowAverage} underperforming
                  </div>
                </div>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
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

      {/* Comparative Analysis */}
      {userLevel !== 'school' && (
        <Card className="border-0 shadow-soft hover:shadow-lg transition-shadow duration-300">
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
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Comparative analysis data will be available when multiple {userLevel === 'district' ? 'schools' : 'units'} are registered</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}