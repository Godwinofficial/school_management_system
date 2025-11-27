import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, BookMarked, Calendar } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  students: number;
  grade: string;
  room: string;
}

export default function MyClasses() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClasses = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in a real app, this would come from an API
        const mockClasses: ClassInfo[] = [
          {
            id: 'class1',
            name: 'Mathematics 10A',
            subject: 'Mathematics',
            schedule: 'Mon, Wed, Fri - 9:00 AM',
            students: 32,
            grade: '10',
            room: 'Room 101'
          },
          {
            id: 'class2',
            name: 'Physics 11B',
            subject: 'Physics',
            schedule: 'Tue, Thu - 11:00 AM',
            students: 28,
            grade: '11',
            room: 'Lab 3'
          },
          {
            id: 'class3',
            name: 'Mathematics 10B',
            subject: 'Mathematics',
            schedule: 'Mon, Wed, Fri - 1:00 PM',
            students: 30,
            grade: '10',
            room: 'Room 105'
          }
        ];
        
        setClasses(mockClasses);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, []);

  const handleViewClass = (classId: string) => {
    navigate(`/class/${classId}`);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            View and manage all your assigned classes
          </p>
        </div>
        <Button onClick={() => navigate('/create-class')}>
          <BookOpen className="mr-2 h-4 w-4" /> New Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Class List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium">{classItem.name}</TableCell>
                  <TableCell>{classItem.subject}</TableCell>
                  <TableCell>{classItem.schedule}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {classItem.students} students
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Grade {classItem.grade}</Badge>
                  </TableCell>
                  <TableCell>{classItem.room}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewClass(classItem.id)}
                    >
                      View Class
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">across all subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, cls) => sum + cls.students, 0)}
            </div>
            <p className="text-xs text-muted-foreground">across all your classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mathematics 10A</div>
            <p className="text-xs text-muted-foreground">Tomorrow at 9:00 AM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
