import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StorageService, Teacher } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { Search, UserPlus, Eye, Edit, Trash2, Users, GraduationCap, Phone, Mail } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  useEffect(() => {
    const loadedTeachers = StorageService.getTeachers(
      userLevel === 'school' ? user?.school?.id : undefined
    );
    setTeachers(loadedTeachers);
    setFilteredTeachers(loadedTeachers);
  }, [user?.school?.id, userLevel]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(teacher =>
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      StorageService.deleteTeacher(teacherId);
      const updatedTeachers = teachers.filter(t => t.id !== teacherId);
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
      toast({
        title: "Teacher deleted",
        description: "Teacher record has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher record.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Teacher['status']) => {
    switch (status) {
      case 'Active': return 'bg-success text-success-foreground';
      case 'On Leave': return 'bg-warning text-warning-foreground';
      case 'Transferred': return 'bg-primary text-primary-foreground';
      case 'Resigned': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPositionColor = (position: Teacher['position']) => {
    switch (position) {
      case 'Head Teacher': return 'bg-primary text-primary-foreground';
      case 'Deputy Head': return 'bg-secondary text-secondary-foreground';
      case 'Senior Teacher': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Teacher Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage teaching staff and their assignments
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-success">
          <Link to="/teachers/add">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">Total Teachers</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {teachers.filter(t => t.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active Teachers</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {teachers.filter(t => t.position === 'Senior Teacher').length}
            </div>
            <p className="text-xs text-muted-foreground">Senior Teachers</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {teachers.filter(t => ['Head Teacher', 'Deputy Head'].includes(t.position)).length}
            </div>
            <p className="text-xs text-muted-foreground">Leadership</p>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teaching Staff
          </CardTitle>
          <CardDescription>
            Manage teacher profiles and subject assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, employee number, or subject..."
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
                  <TableHead>Teacher</TableHead>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No teachers found matching your search." : "No teachers registered yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {teacher.firstName} {teacher.surname}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {teacher.qualification}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {teacher.employeeNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPositionColor(teacher.position)}>
                          {teacher.position}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.slice(0, 2).map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {teacher.subjects.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{teacher.subjects.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {teacher.contactNumber}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(teacher.status)}>
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/teachers/${teacher.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/teachers/${teacher.id}/edit`}>
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
                                <AlertDialogTitle>Delete Teacher Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {teacher.firstName} {teacher.surname}'s record? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTeacher(teacher.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}