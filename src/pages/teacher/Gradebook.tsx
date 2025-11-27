import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, BarChart3, Plus, User, BookOpen, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  assignmentsCompleted: number;
  totalAssignments: number;
  averageScore: number;
  lastActive: string;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
  assignments: Array<{
    id: string;
    title: string;
    score: number | null;
    maxScore: number;
    status: 'submitted' | 'graded' | 'missing' | 'late';
    subject: string;
    dueDate: string;
  }>;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  grade: string;
  students: number;
  averageGrade: number;
  assignments: Array<{
    id: string;
    title: string;
    maxScore: number;
    averageScore: number;
    dueDate: string;
  }>;
}

export default function Gradebook() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'overview' | 'detailed'>('overview');
  
  // Mock data
  const classes: ClassInfo[] = [
    {
      id: 'class1',
      name: 'Mathematics 10A',
      subject: 'Mathematics',
      grade: '10',
      students: 32,
      averageGrade: 78.5,
      assignments: [
        { id: 'asg1', title: 'Algebra Quiz', maxScore: 20, averageScore: 16.2, dueDate: '2023-12-15' },
        { id: 'asg2', title: 'Geometry Test', maxScore: 50, averageScore: 38.7, dueDate: '2023-12-22' },
        { id: 'asg3', title: 'Trigonometry Assignment', maxScore: 30, averageScore: 24.1, dueDate: '2024-01-05' },
      ]
    },
    {
      id: 'class2',
      name: 'Physics 11B',
      subject: 'Physics',
      grade: '11',
      students: 28,
      averageGrade: 82.3,
      assignments: [
        { id: 'asg4', title: 'Lab Report: Motion', maxScore: 30, averageScore: 25.6, dueDate: '2023-12-10' },
        { id: 'asg5', title: 'Forces Test', maxScore: 50, averageScore: 41.8, dueDate: '2023-12-18' },
      ]
    }
  ];

  const students: Student[] = [
    {
      id: 'stu1',
      name: 'John Mwansa',
      assignmentsCompleted: 5,
      totalAssignments: 5,
      averageScore: 88.5,
      lastActive: '2023-12-10',
      performance: 'excellent',
      assignments: [
        { id: 'asg1', title: 'Algebra Quiz', score: 18, maxScore: 20, status: 'graded', subject: 'Mathematics', dueDate: '2023-12-15' },
        { id: 'asg2', title: 'Geometry Test', score: 45, maxScore: 50, status: 'graded', subject: 'Mathematics', dueDate: '2023-12-22' },
        { id: 'asg4', title: 'Lab Report: Motion', score: 27, maxScore: 30, status: 'graded', subject: 'Physics', dueDate: '2023-12-10' },
        { id: 'asg5', title: 'Forces Test', score: 48, maxScore: 50, status: 'graded', subject: 'Physics', dueDate: '2023-12-18' },
        { id: 'asg3', title: 'Trigonometry Assignment', score: 28, maxScore: 30, status: 'graded', subject: 'Mathematics', dueDate: '2024-01-05' },
      ]
    },
    // Add more students as needed
  ];

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClassData = classes.find(cls => cls.id === selectedClass) || classes[0];
  const selectedStudentData = students.find(stu => stu.id === selectedStudent) || students[0];

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Good</Badge>;
      case 'average':
        return <Badge variant="outline">Average</Badge>;
      case 'needs_improvement':
        return <Badge variant="destructive">Needs Improvement</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600 font-medium';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gradebook</h1>
          <p className="text-muted-foreground">
            Track and manage student grades and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView(view === 'overview' ? 'detailed' : 'overview')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {view === 'overview' ? 'Detailed View' : 'Overview'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Class</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} (Grade {cls.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Search Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {selectedClassData.averageGrade.toFixed(1)}%
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {selectedClassData.students} students
                </div>
              </div>
            </div>
            <Progress 
              value={selectedClassData.averageGrade} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {view === 'overview' ? (
        <Card>
          <CardHeader>
            <CardTitle>Student Grades</CardTitle>
            <CardDescription>
              Performance overview of all students in {selectedClassData.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Average</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div>{student.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {student.assignmentsCompleted}/{student.totalAssignments} assignments
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${getGradeColor(student.averageScore)}`}>
                          {student.averageScore.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(student.assignmentsCompleted / student.totalAssignments) * 100} 
                            className="h-2 w-24" 
                          />
                          <span className="text-sm text-muted-foreground">
                            {Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(student.performance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student.id);
                            setView('detailed');
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Student Details</CardTitle>
                <CardDescription>
                  Detailed performance for {selectedStudentData?.name || 'selected student'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setView('overview')}>
                Back to Overview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {selectedStudentData.averageScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {getPerformanceBadge(selectedStudentData.performance)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {selectedStudentData.assignmentsCompleted}/{selectedStudentData.totalAssignments}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {Math.round((selectedStudentData.assignmentsCompleted / selectedStudentData.totalAssignments) * 100)}% completion rate
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {new Date(selectedStudentData.lastActive).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedStudentData.assignments.filter(a => a.status === 'graded').length} graded assignments
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Assignment History</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudentData.assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>{assignment.subject}</TableCell>
                          <TableCell>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {assignment.score !== null ? (
                              <span className={getGradeColor(assignment.score)}>
                                {assignment.score}/{assignment.maxScore}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {assignment.status === 'graded' ? (
                              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                Graded
                              </Badge>
                            ) : assignment.status === 'submitted' ? (
                              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                Submitted
                              </Badge>
                            ) : assignment.status === 'late' ? (
                              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                Late
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                                Missing
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Subject Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from(new Set(selectedStudentData.assignments.map(a => a.subject))).map(subject => {
                        const subjectAssignments = selectedStudentData.assignments.filter(a => a.subject === subject && a.score !== null);
                        const avgScore = subjectAssignments.length > 0
                          ? subjectAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / subjectAssignments.length
                          : 0;
                        
                        return (
                          <div key={subject} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{subject}</span>
                              <span className={`font-medium ${getGradeColor(avgScore)}`}>
                                {avgScore.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={avgScore} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Top Performer</p>
                          <p className="text-sm text-muted-foreground">
                            Ranked #1 in {selectedClassData.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Award className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Perfect Score</p>
                          <p className="text-sm text-muted-foreground">
                            Scored 100% on Algebra Quiz
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Award className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Most Improved</p>
                          <p className="text-sm text-muted-foreground">
                            Improved by 15% this term
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
