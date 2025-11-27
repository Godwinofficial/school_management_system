import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  class: string;
  dueDate: string;
  status: 'draft' | 'published' | 'graded' | 'overdue';
  submissions: {
    total: number;
    submitted: number;
    graded: number;
  };
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call
    const loadAssignments = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockAssignments: Assignment[] = [
          {
            id: 'asg1',
            title: 'Algebra Quiz',
            subject: 'Mathematics',
            class: '10A',
            dueDate: '2023-12-15',
            status: 'published',
            submissions: {
              total: 32,
              submitted: 28,
              graded: 15
            }
          },
          {
            id: 'asg2',
            title: 'Physics Lab Report',
            subject: 'Physics',
            class: '11B',
            dueDate: '2023-12-10',
            status: 'overdue',
            submissions: {
              total: 28,
              submitted: 22,
              graded: 22
            }
          },
          {
            id: 'asg3',
            title: 'History Essay',
            subject: 'History',
            class: '10C',
            dueDate: '2023-12-20',
            status: 'draft',
            submissions: {
              total: 30,
              submitted: 0,
              graded: 0
            }
          },
          {
            id: 'asg4',
            title: 'Chemistry Worksheet',
            subject: 'Chemistry',
            class: '11A',
            dueDate: '2023-12-05',
            status: 'graded',
            submissions: {
              total: 30,
              submitted: 30,
              graded: 30
            }
          }
        ];
        
        setAssignments(mockAssignments);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.class.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-gray-300 bg-gray-100 text-gray-700">Draft</Badge>;
      case 'graded':
        return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Graded</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleViewAssignment = (id: string) => {
    navigate(`/assignment/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Create and manage assignments for your classes
          </p>
        </div>
        <Button onClick={() => navigate('/create-assignment')}>
          <Plus className="mr-2 h-4 w-4" /> New Assignment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Assignment List</span>
          </CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(assignment.status)}
                        {assignment.title}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.subject}</TableCell>
                    <TableCell>Grade {assignment.class}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-sm">
                          {assignment.submissions.submitted}/{assignment.submissions.total} submitted
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.submissions.graded} graded
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAssignment(assignment.id)}
                      >
                        {assignment.status === 'published' || assignment.status === 'overdue' 
                          ? 'Grade' 
                          : assignment.status === 'graded'
                            ? 'View Grades'
                            : 'Edit'
                        }
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No assignments found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">across all your classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.reduce((sum, asg) => sum + (asg.submissions.submitted - asg.submissions.graded), 0)}
            </div>
            <p className="text-xs text-muted-foreground">submissions need grading</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.length > 0 
                ? new Date(assignments[0].dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {assignments.length > 0 ? assignments[0].title : 'No upcoming deadlines'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
