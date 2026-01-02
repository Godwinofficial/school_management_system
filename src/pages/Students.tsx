import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StorageService, Student, School, Teacher, Class } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import {
    Search,
    UserPlus,
    Eye,
    Edit,
    Trash2,
    Upload,
    Download,
    LayoutGrid,
    List,
    Filter,
    MoreHorizontal,
    GraduationCap,
    Users,
    UserCheck,
    UserX,
    FileSpreadsheet,
    ArrowRightLeft
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Students() {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
    const [targetSchoolId, setTargetSchoolId] = useState<string>("");
    const [availableSchools, setAvailableSchools] = useState<School[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [genderFilter, setGenderFilter] = useState<string>("all");
    const [levelFilter, setLevelFilter] = useState<string>("all");

    const user = AuthService.getCurrentUser();
    const userLevel = AuthService.getUserLevel();

    useEffect(() => {
        // Load students based on user level and role
        let loadedStudents = StorageService.getStudents(
            userLevel === 'school' ? user?.school?.id : undefined
        );

        // Filter students for regular teachers - only show students in their assigned classes
        if (user?.role === 'teacher') {
            const teacher = StorageService.getTeacher(user.id);
            if (teacher?.assignedClassIds && teacher.assignedClassIds.length > 0) {
                // Show students only from assigned classes
                loadedStudents = loadedStudents.filter(student =>
                    student.classId && teacher.assignedClassIds?.includes(student.classId)
                );
            } else {
                // Show students where teacher is the class teacher
                const teacherClasses = StorageService.getClasses(user?.school?.id)
                    .filter(cls => cls.teacherId === teacher?.id)
                    .map(cls => cls.id);
                loadedStudents = loadedStudents.filter(student =>
                    student.classId && teacherClasses.includes(student.classId)
                );
            }
        }
        // Head Teachers, Deputy Heads, Senior Teachers, and admins see all students

        setStudents(loadedStudents);

        // Load schools for transfer
        setAvailableSchools(StorageService.getSchools());
    }, [user?.school?.id, user?.role, user?.id, userLevel]);

    useEffect(() => {
        // Filter students
        let result = students;

        // Search
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            result = result.filter(student =>
                student.firstName.toLowerCase().includes(term) ||
                student.surname.toLowerCase().includes(term) ||
                student.enrolmentNumber.toLowerCase().includes(term) ||
                (student.otherNames && student.otherNames.toLowerCase().includes(term))
            );
        }

        // Status Filter
        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter);
        }

        // Gender Filter
        if (genderFilter !== "all") {
            result = result.filter(s => s.gender === genderFilter);
        }

        // Level Filter
        if (levelFilter !== "all") {
            result = result.filter(s => s.currentLevel.toString() === levelFilter);
        }

        setFilteredStudents(result);
    }, [searchTerm, students, statusFilter, genderFilter, levelFilter]);

    const handleDeleteStudent = async (studentId: string) => {
        try {
            StorageService.deleteStudent(studentId);
            const updatedStudents = students.filter(s => s.id !== studentId);
            setStudents(updatedStudents);
            toast({
                title: "Student deleted",
                description: "Student record has been successfully deleted.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete student record.",
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: Student['status']) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'Transferred': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'Dropped Out': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'Graduated': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    const getPerformanceColor = (performance: Student['overallPerformance']) => {
        switch (performance) {
            case 'Excellent': return 'text-emerald-600 dark:text-emerald-400 font-medium';
            case 'Good': return 'text-blue-600 dark:text-blue-400 font-medium';
            case 'Average': return 'text-yellow-600 dark:text-yellow-400 font-medium';
            case 'Below Average': return 'text-orange-600 dark:text-orange-400 font-medium';
            case 'Poor': return 'text-red-600 dark:text-red-400 font-medium';
            default: return 'text-gray-500';
        }
    };

    const getInitials = (firstName: string, surname: string) => {
        return `${firstName.charAt(0)}${surname.charAt(0)}`;
    };

    // Import handler
    const handleImportStudents = async (importedStudents: any[]) => {
        try {
            // Convert imported data to app format
            const newStudents = importedStudents.map(s => ({
                ...s,
                id: crypto.randomUUID(),
                schoolId: user?.school?.id || '',
                enrolmentNumber: s.studentId || `ENR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                currentLevel: s.gradeLevel,
                surname: s.lastName,
                otherNames: '',
                status: 'Active' as const,
                overallPerformance: 'Average' as const,
                dateOfBirth: s.dateOfBirth,
                placeOfBirth: '',
                nationality: 'Zambian',
                religion: '',
                languageSpoken: '',
                previousSchool: '',
                dateOfAdmission: s.enrollmentDate || new Date().toISOString().split('T')[0],
                classId: '',
                parentGuardian: {
                    name: s.guardianName || '',
                    relationship: 'Parent',
                    phoneNumber: s.guardianPhone || '',
                    email: s.guardianEmail || '',
                    address: s.address || '',
                    occupation: ''
                },
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phoneNumber: ''
                },
                medicalInfo: {
                    bloodGroup: '',
                    allergies: s.medicalInfo || '',
                    chronicConditions: '',
                    medications: ''
                },
                documents: []
            }));

            // Save to storage
            newStudents.forEach(student => {
                StorageService.saveStudent(student);
            });

            // Reload data
            const loadedStudents = StorageService.getStudents(
                userLevel === 'school' ? user?.school?.id : undefined
            );
            setStudents(loadedStudents);

            toast({
                title: "Import Successful",
                description: `Successfully imported ${newStudents.length} student(s).`,
                className: "bg-emerald-500 text-white border-none"
            });
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "Failed to import students. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Export handler
    const handleExportStudents = () => {
        return students.map(s => ({
            studentId: s.enrolmentNumber,
            firstName: s.firstName,
            lastName: s.surname,
            dateOfBirth: s.dateOfBirth,
            gender: s.gender,
            gradeLevel: s.currentLevel,
            stream: '',
            guardianName: s.parentGuardian?.name || '',
            guardianPhone: s.parentGuardian?.phoneNumber || '',
            guardianEmail: s.parentGuardian?.email || '',
            address: s.parentGuardian?.address || '',
            medicalInfo: s.medicalInfo?.allergies || '',
            enrollmentDate: s.dateOfAdmission
        }));
    };

    const handleTransferStudent = () => {
        if (!studentToTransfer || !targetSchoolId) return;

        const targetSchool = availableSchools.find(s => s.id === targetSchoolId);
        if (!targetSchool) return;

        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const newEnrolmentNumber = `${targetSchool.centerNumber}/${year}/${random}`;

        const updatedStudent: Student = {
            ...studentToTransfer,
            schoolId: targetSchoolId,
            enrolmentNumber: newEnrolmentNumber,
            status: 'Active', // Reset to Active in new school
            classId: undefined, // Clear class assignment
            academicPerformance: studentToTransfer.academicPerformance || {} // Preserve history
        };

        StorageService.saveStudent(updatedStudent);

        // Update local state
        if (userLevel === 'school') {
            // Remove from current view if viewing a specific school
            setStudents(students.filter(s => s.id !== studentToTransfer.id));
        } else {
            // Update in place if viewing all
            setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        }

        setTransferDialogOpen(false);
        setStudentToTransfer(null);
        setTargetSchoolId("");

        toast({
            title: "Transfer Successful",
            description: `Student transferred to ${targetSchool.name}. New ID: ${newEnrolmentNumber}`,
            className: "bg-blue-500 text-white border-none"
        });
    };

    // Check permissions
    const canImportExport = user?.permissions?.includes('manage_students') ||
        user?.role === 'head_teacher' ||
        user?.role === 'senior_teacher';

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Students
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your school's student population, records, and performance.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild className="bg-primary hover:bg-primary/90 shadow-sm">
                        <Link to="/students/add">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Student
                        </Link>
                    </Button>
                    {canImportExport && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="shadow-sm">
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Data Management</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Registered in system
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Active</p>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold">
                            {students.filter(s => s.status === 'Active').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently enrolled
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Graduated</p>
                            <GraduationCap className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold">
                            {students.filter(s => s.status === 'Graduated').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Alumni
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Transferred</p>
                            <UserX className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold">
                            {students.filter(s => s.status === 'Transferred').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Moved to other schools
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Student Directory</CardTitle>

                        {/* View Toggle */}
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
                        Browse and manage all student records. Use filters to narrow down your search.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Filters Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by name, ID, or keyword..."
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

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Transferred">Transferred</SelectItem>
                                    <SelectItem value="Dropped Out">Dropped Out</SelectItem>
                                    <SelectItem value="Graduated">Graduated</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="w-[130px] bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Genders</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>

                            {(searchTerm || statusFilter !== 'all' || genderFilter !== 'all' || levelFilter !== 'all') && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setGenderFilter("all");
                                        setLevelFilter("all");
                                    }}
                                    className="px-3"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content Display */}
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium">No students found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                We couldn't find any students matching your current filters. Try adjusting your search or filters.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                    setGenderFilter("all");
                                    setLevelFilter("all");
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
                                                <TableHead className="w-[250px]">Student</TableHead>
                                                <TableHead>ID Number</TableHead>
                                                <TableHead>Level</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Performance</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.map((student) => (
                                                <TableRow key={student.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 border">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName} ${student.surname}`} />
                                                                <AvatarFallback>{getInitials(student.firstName, student.surname)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                                                    {student.firstName} {student.surname}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {student.otherNames}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {student.enrolmentNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-normal">
                                                            Grade {student.currentLevel}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{student.gender}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${getStatusColor(student.status)} border`}>
                                                            {student.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`text-sm ${getPerformanceColor(student.overallPerformance)}`}>
                                                            {student.overallPerformance}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link to={`/students/${student.id}`} className="flex items-center cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link to={`/students/${student.id}/edit`} className="flex items-center cursor-pointer">
                                                                        <Edit className="mr-2 h-4 w-4" /> Edit Record
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setStudentToTransfer(student);
                                                                        setTransferDialogOpen(true);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
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
                                                                            <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete {student.firstName} {student.surname}'s record?
                                                                                This action cannot be undone.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteStudent(student.id)}
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {filteredStudents.map((student) => (
                                        <Card key={student.id} className="overflow-hidden hover:shadow-md transition-all group">
                                            <div className={`h-2 w-full ${getStatusColor(student.status).split(' ')[0]}`} />
                                            <CardHeader className="pb-2 pt-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName} ${student.surname}`} />
                                                            <AvatarFallback>{getInitials(student.firstName, student.surname)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                {student.firstName} {student.surname}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs font-mono mt-0.5">
                                                                {student.enrolmentNumber}
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
                                                                <Link to={`/students/${student.id}`} className="flex items-center cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/students/${student.id}/edit`} className="flex items-center cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit Record
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setStudentToTransfer(student);
                                                                    setTransferDialogOpen(true);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
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
                                                                        <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete {student.firstName} {student.surname}'s record?
                                                                            This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteStudent(student.id)}
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
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                                        <span className="text-muted-foreground block mb-0.5">Level</span>
                                                        <span className="font-medium">Grade {student.currentLevel}</span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                                        <span className="text-muted-foreground block mb-0.5">Gender</span>
                                                        <span className="font-medium">{student.gender}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className="text-muted-foreground text-xs">Performance</span>
                                                    <span className={`text-xs font-medium ${getPerformanceColor(student.overallPerformance)}`}>
                                                        {student.overallPerformance}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className="text-muted-foreground text-xs">Status</span>
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 h-5 ${getStatusColor(student.status)} border`}>
                                                        {student.status}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-0 pb-4">
                                                <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                                                    <Link to={`/students/${student.id}`}>
                                                        View Profile
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Import/Export Dialogs */}
            <ImportExportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mode="import"
                type="students"
                onImport={handleImportStudents}
            />

            <ImportExportDialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                mode="export"
                type="students"
                onExport={handleExportStudents}
            />

            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Student</DialogTitle>
                        <DialogDescription>
                            Transfer {studentToTransfer?.firstName} {studentToTransfer?.surname} to another school.
                            This will generate a new student ID for the new school.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="school">Destination School</Label>
                            <Select value={targetSchoolId} onValueChange={setTargetSchoolId}>
                                <SelectTrigger id="school">
                                    <SelectValue placeholder="Select school..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSchools
                                        .filter(s => s.id !== user?.school?.id) // Exclude current school
                                        .map(school => (
                                            <SelectItem key={school.id} value={school.id}>
                                                {school.name} ({school.district})
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleTransferStudent} disabled={!targetSchoolId}>Confirm Transfer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
