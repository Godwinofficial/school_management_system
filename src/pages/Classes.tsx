import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorageService, Class, Teacher, Student } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { Search, Plus, Users, BookOpen, User, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function Classes() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  useEffect(() => {
    const schoolId = userLevel === 'school' ? user?.school?.id : undefined;
    const loadedClasses = StorageService.getClasses(schoolId);
    const loadedTeachers = StorageService.getTeachers(schoolId);
    const loadedStudents = StorageService.getStudents(schoolId);
    
    setClasses(loadedClasses);
    setTeachers(loadedTeachers);
    setStudents(loadedStudents);
    setFilteredClasses(loadedClasses);
  }, [user?.school?.id, userLevel]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.level.toString().includes(searchTerm) ||
        cls.stream.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes]);

  const handleDeleteClass = async (classId: string) => {
    try {
      // First, unassign students from this class
      const studentsInClass = students.filter(s => s.classId === classId);
      studentsInClass.forEach(student => {
        const updatedStudent = { ...student, classId: undefined };
        StorageService.saveStudent(updatedStudent);
      });
      
      StorageService.deleteClass(classId);
      const updatedClasses = classes.filter(c => c.id !== classId);
      setClasses(updatedClasses);
      setFilteredClasses(updatedClasses);
      
      // Refresh students data
      const refreshedStudents = StorageService.getStudents(user?.school?.id);
      setStudents(refreshedStudents);
      
      toast({
        title: "Class deleted",
        description: "Class has been successfully deleted and students unassigned.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedClass) return;

    try {
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        const updatedStudent = { ...student, classId: selectedClass };
        StorageService.saveStudent(updatedStudent);
        
        // Refresh students data
        const refreshedStudents = StorageService.getStudents(user?.school?.id);
        setStudents(refreshedStudents);
        
        setSelectedStudent("");
        setSelectedClass("");
        
        toast({
          title: "Student assigned",
          description: `${student.firstName} ${student.surname} has been assigned to the class.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign student to class.",
        variant: "destructive",
      });
    }
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return "No teacher assigned";
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.surname}` : "Unknown teacher";
  };

  const getStudentsInClass = (classId: string) => {
    return students.filter(s => s.classId === classId);
  };

  const getUnassignedStudents = () => {
    return students.filter(s => !s.classId && s.status === 'Active');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Class Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage classes, assign teachers and students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Assign Students
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Student to Class</DialogTitle>
                <DialogDescription>
                  Select a student and assign them to a class
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnassignedStudents().map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.surname} - Level {student.currentLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} (Level {cls.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignStudent} className="w-full">
                  Assign Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild className="bg-gradient-to-r from-primary to-success">
            <Link to="/classes/add">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {students.filter(s => s.classId).length}
            </div>
            <p className="text-xs text-muted-foreground">Students Assigned</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {getUnassignedStudents().length}
            </div>
            <p className="text-xs text-muted-foreground">Unassigned Students</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {classes.reduce((sum, cls) => sum + cls.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Class List
          </CardTitle>
          <CardDescription>
            Overview of all classes and their assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by class name, level, or stream..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No classes found matching your search." : "No classes created yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((cls) => {
                    const studentsInClass = getStudentsInClass(cls.id);
                    const utilizationPercentage = Math.round((studentsInClass.length / cls.capacity) * 100);
                    
                    return (
                      <TableRow key={cls.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cls.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Stream {cls.stream}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {cls.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getTeacherName(cls.teacherId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{studentsInClass.length}</span>
                            <Badge 
                              variant={utilizationPercentage > 90 ? "destructive" : utilizationPercentage > 75 ? "secondary" : "default"}
                              className="text-xs"
                            >
                              {utilizationPercentage}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">{cls.capacity}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {cls.subjects.length} subjects
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/classes/${cls.id}`}>
                                <BookOpen className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/classes/${cls.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Class</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {cls.name}? 
                                    This will unassign all students from this class.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClass(cls.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Students Alert */}
      {getUnassignedStudents().length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning flex items-center gap-2">
              <Users className="h-5 w-5" />
              Unassigned Students
            </CardTitle>
            <CardDescription>
              There are {getUnassignedStudents().length} students not assigned to any class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {getUnassignedStudents().slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <span className="text-sm">
                    {student.firstName} {student.surname} - Level {student.currentLevel}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        Assign
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ))}
              {getUnassignedStudents().length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  And {getUnassignedStudents().length - 5} more students...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}