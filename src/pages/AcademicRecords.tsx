import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuthService } from "@/lib/auth";
import { StorageService, Student } from "@/lib/storage";
import { BookOpen, Search, Filter, TrendingUp, Award, Users, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AcademicRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [performanceFilter, setPerformanceFilter] = useState<string>("all");

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  useEffect(() => {
    const allStudents = StorageService.getStudents(
      userLevel === 'school' && user?.school?.id ? user.school.id : undefined
    );
    setStudents(allStudents);
    setFilteredStudents(allStudents);
  }, [user, userLevel]);

  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrolmentNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === "all" || student.currentLevel.toString() === levelFilter;
      const matchesPerformance = performanceFilter === "all" || student.overallPerformance === performanceFilter;
      
      return matchesSearch && matchesLevel && matchesPerformance;
    });
    
    setFilteredStudents(filtered);
  }, [students, searchTerm, levelFilter, performanceFilter]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'bg-success text-success-foreground';
      case 'Good': return 'bg-primary text-primary-foreground';
      case 'Average': return 'bg-warning text-warning-foreground';
      case 'Below Average': return 'bg-muted text-muted-foreground';
      case 'Poor': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLatestGrades = (student: Student) => {
    const levels = Object.keys(student.academicPerformance).map(Number).sort((a, b) => b - a);
    return levels.length > 0 ? student.academicPerformance[levels[0]] : null;
  };

  const calculateGPA = (grades: { A: number; B: number; C: number }) => {
    const total = grades.A + grades.B + grades.C;
    if (total === 0) return 0;
    return ((grades.A * 4 + grades.B * 3 + grades.C * 2) / total).toFixed(2);
  };

  const levelStats = students.reduce((acc, student) => {
    acc[student.currentLevel] = (acc[student.currentLevel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const performanceStats = students.reduce((acc, student) => {
    acc[student.overallPerformance] = (acc[student.overallPerformance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Academic Records
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive academic performance tracking and analysis
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {filteredStudents.length} Students
        </Badge>
      </div>

      {/* Overview Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceStats['Excellent'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">Excellent performers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((performanceStats['Excellent'] || 0) + (performanceStats['Good'] || 0) / students.length * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Above average rate</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date().getFullYear()}</div>
            <p className="text-xs text-muted-foreground">Current year</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Array.from({length: 12}, (_, i) => i + 1).map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Average">Average</SelectItem>
                <SelectItem value="Below Average">Below Average</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setLevelFilter("all");
                setPerformanceFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Academic Records Table */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Student Academic Records
          </CardTitle>
          <CardDescription>
            Detailed academic performance for all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Enrollment #</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Latest Grades</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const latestGrades = getLatestGrades(student);
                  const gpa = latestGrades ? calculateGPA(latestGrades) : 'N/A';
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.surname}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.gender}, Age {new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {student.currentLevel}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.enrolmentNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPerformanceColor(student.overallPerformance)}>
                          {student.overallPerformance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {latestGrades ? (
                          <div className="text-sm">
                            <span className="text-success font-medium">A: {latestGrades.A}</span>
                            {" | "}
                            <span className="text-primary font-medium">B: {latestGrades.B}</span>
                            {" | "}
                            <span className="text-warning font-medium">C: {latestGrades.C}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{gpa}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Overall academic performance breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(performanceStats).map(([performance, count]) => (
              <div key={performance} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{performance}</span>
                  <span className="text-sm text-muted-foreground">{count} students</span>
                </div>
                <Progress 
                  value={students.length > 0 ? (count / students.length) * 100 : 0} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Level Distribution</CardTitle>
            <CardDescription>Students per academic level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(levelStats)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, count]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Level {level}</span>
                  <span className="text-sm text-muted-foreground">{count} students</span>
                </div>
                <Progress 
                  value={students.length > 0 ? (count / students.length) * 100 : 0} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}