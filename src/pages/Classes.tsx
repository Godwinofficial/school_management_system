import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorageService, Class, Teacher, Student } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import {
  Search,
  Plus,
  Users,
  BookOpen,
  User,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  MoreHorizontal,
  GraduationCap,
  School,
  UserPlus
} from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Classes() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filters
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [streamFilter, setStreamFilter] = useState<string>("all");

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
  }, [user?.school?.id, userLevel]);

  useEffect(() => {
    let result = classes;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(cls =>
        cls.name.toLowerCase().includes(term) ||
        cls.level.toString().includes(term) ||
        cls.stream.toLowerCase().includes(term)
      );
    }

    if (levelFilter !== "all") {
      result = result.filter(c => c.level.toString() === levelFilter);
    }

    if (streamFilter !== "all") {
      result = result.filter(c => c.stream === streamFilter);
    }

    setFilteredClasses(result);
  }, [searchTerm, classes, levelFilter, streamFilter]);

  const handleDeleteClass = async (classId: string) => {
    try {
      const studentsInClass = students.filter(s => s.classId === classId);
      studentsInClass.forEach(student => {
        const updatedStudent = { ...student, classId: undefined };
        StorageService.saveStudent(updatedStudent);
      });

      StorageService.deleteClass(classId);
      const updatedClasses = classes.filter(c => c.id !== classId);
      setClasses(updatedClasses);

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

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage class structures, assign teachers, and organize students.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Student
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
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-sm">
            <Link to="/classes/add">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
              <School className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active classes</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Students Assigned</p>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold">
              {students.filter(s => s.classId).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled in classes</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
              <UserPlus className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">
              {getUnassignedStudents().length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Students needing placement</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
              <GraduationCap className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, cls) => sum + cls.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Student seats available</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Class Directory</CardTitle>
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 lg:px-3"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 lg:px-3"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            Browse and manage all classes. Use filters to narrow down your search.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by class name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-950"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={streamFilter} onValueChange={setStreamFilter}>
                <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streams</SelectItem>
                  <SelectItem value="A">Stream A</SelectItem>
                  <SelectItem value="B">Stream B</SelectItem>
                  <SelectItem value="C">Stream C</SelectItem>
                  <SelectItem value="D">Stream D</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || levelFilter !== 'all' || streamFilter !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setLevelFilter("all");
                    setStreamFilter("all");
                  }}
                  className="px-3"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium">No classes found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                We couldn't find any classes matching your current filters.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSearchTerm("");
                  setLevelFilter("all");
                  setStreamFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                      <TableRow>
                        <TableHead className="w-[200px]">Class Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((cls) => {
                        const studentsInClass = getStudentsInClass(cls.id);
                        const utilizationPercentage = Math.round((studentsInClass.length / cls.capacity) * 100);

                        return (
                          <TableRow key={cls.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials(cls.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {cls.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Stream {cls.stream}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal">
                                Grade {cls.level}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{getTeacherName(cls.teacherId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{studentsInClass.length}</span>
                                <Badge
                                  variant={utilizationPercentage > 90 ? "destructive" : utilizationPercentage > 75 ? "secondary" : "default"}
                                  className="text-[10px] h-5 px-1.5"
                                >
                                  {utilizationPercentage}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {cls.capacity}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/classes/${cls.id}`} className="flex items-center cursor-pointer">
                                      <BookOpen className="mr-2 h-4 w-4" /> View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/classes/${cls.id}/edit`} className="flex items-center cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" /> Edit Class
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
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
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredClasses.map((cls) => {
                    const studentsInClass = getStudentsInClass(cls.id);
                    const utilizationPercentage = Math.round((studentsInClass.length / cls.capacity) * 100);

                    return (
                      <Card key={cls.id} className="overflow-hidden hover:shadow-md transition-all group">
                        <div className="h-2 w-full bg-primary/10" />
                        <CardHeader className="pb-2 pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(cls.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">
                                  {cls.name}
                                </CardTitle>
                                <CardDescription className="text-xs font-mono mt-0.5">
                                  Stream {cls.stream}
                                </CardDescription>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/classes/${cls.id}`} className="flex items-center cursor-pointer">
                                    <BookOpen className="mr-2 h-4 w-4" /> View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/classes/${cls.id}/edit`} className="flex items-center cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" /> Edit Class
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 cursor-pointer">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3 text-sm space-y-2">
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium truncate">{getTeacherName(cls.teacherId)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-muted-foreground text-xs">Occupancy</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{studentsInClass.length}/{cls.capacity}</span>
                              <Badge
                                variant={utilizationPercentage > 90 ? "destructive" : utilizationPercentage > 75 ? "secondary" : "default"}
                                className="text-[10px] h-5 px-1.5"
                              >
                                {utilizationPercentage}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 pb-4">
                          <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                            <Link to={`/classes/${cls.id}`}>
                              View Class
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}