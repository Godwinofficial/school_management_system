import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Check, X, Clock, AlertCircle, Printer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StorageService, Class, Student, AttendanceRecord, Teacher } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Attendance() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);

    const user = AuthService.getCurrentUser();
    const userLevel = AuthService.getUserLevel();

    useEffect(() => {
        const schoolId = userLevel === 'school' ? user?.school?.id : undefined;
        let loadedClasses = StorageService.getClasses(schoolId);

        // Load current teacher data if user is a teacher
        if (user?.role === 'teacher') {
            const teacher = StorageService.getTeacher(user.id);
            setCurrentTeacher(teacher);

            // Filter classes based on teacher's assignments
            if (teacher?.assignedClassIds && teacher.assignedClassIds.length > 0) {
                loadedClasses = loadedClasses.filter(cls =>
                    teacher.assignedClassIds?.includes(cls.id) || cls.teacherId === teacher.id
                );
            } else {
                // If no assigned classes, show classes where they are the class teacher
                loadedClasses = loadedClasses.filter(cls => cls.teacherId === teacher?.id);
            }
        } else {
            setCurrentTeacher(null);
        }

        setClasses(loadedClasses);
    }, [user?.school?.id, user?.role, user?.id, userLevel]);

    useEffect(() => {
        if (selectedGroupId) {
            let allStudents = StorageService.getStudents(user?.school?.id);

            if (selectedGroupId === 'unassigned') {
                allStudents = allStudents.filter(s => !s.classId);
            } else if (selectedGroupId.startsWith('grade-')) {
                const level = parseInt(selectedGroupId.split('-')[1]);
                allStudents = allStudents.filter(s => s.currentLevel === level);
            } else {
                allStudents = allStudents.filter(s => s.classId === selectedGroupId);
            }
            setStudents(allStudents);
        } else {
            setStudents([]);
        }
    }, [selectedGroupId, user?.school?.id]);

    useEffect(() => {
        if (selectedGroupId && date && students.length > 0) {
            const dateStr = format(date, 'yyyy-MM-dd');
            const existingRecords = StorageService.getAttendance(dateStr);

            // Initialize attendance data
            // If records exist, use them. If not, default to 'Present' for all students
            const initialData: AttendanceRecord[] = students.map(student => {
                const existing = existingRecords.find(r => r.studentId === student.id);
                return existing || {
                    id: crypto.randomUUID(),
                    studentId: student.id,
                    classId: student.classId,
                    date: dateStr,
                    status: 'Present',
                    remarks: ''
                };
            });
            setAttendanceData(initialData);
        } else {
            setAttendanceData([]);
        }
    }, [selectedGroupId, date, students]);

    const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
        setAttendanceData(prev => prev.map(record =>
            record.studentId === studentId ? { ...record, status } : record
        ));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setAttendanceData(prev => prev.map(record =>
            record.studentId === studentId ? { ...record, remarks } : record
        ));
    };

    const saveAttendance = () => {
        setIsSaving(true);
        try {
            StorageService.saveAttendance(attendanceData);
            toast.success("Attendance saved successfully");
        } catch (error) {
            toast.error("Failed to save attendance");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const getStudentRecord = (studentId: string) => {
        return attendanceData.find(r => r.studentId === studentId);
    };

    const getStats = () => {
        return {
            present: attendanceData.filter(r => r.status === 'Present').length,
            absent: attendanceData.filter(r => r.status === 'Absent').length,
            late: attendanceData.filter(r => r.status === 'Late').length,
            sick: attendanceData.filter(r => r.status === 'Sick').length,
            excused: attendanceData.filter(r => r.status === 'Excused').length,
            total: attendanceData.length
        };
    };

    const stats = getStats();
    const attendanceRate = stats.total > 0
        ? Math.round(((stats.present + stats.late) / stats.total) * 100)
        : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Sick': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Excused': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const isRealClass = (id: string) => {
        return id && id !== 'unassigned' && !id.startsWith('grade-');
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Attendance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage daily student attendance.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isRealClass(selectedGroupId) && (
                        <Button variant="outline" asChild>
                            <Link to={`/classes/${selectedGroupId}/register`}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Register
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline">Download Report</Button>
                    <Button onClick={saveAttendance} disabled={isSaving || !selectedGroupId}>
                        {isSaving ? "Saving..." : "Save Attendance"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selection</CardTitle>
                            <CardDescription>Choose class/group and date</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Class / Group</label>
                                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class or group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned" className="font-medium text-orange-600">
                                            Unassigned Students
                                        </SelectItem>

                                        <div className="my-1 border-t" />
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            By Grade Level
                                        </div>
                                        {[...Array(12)].map((_, i) => (
                                            <SelectItem key={`grade-${i + 1}`} value={`grade-${i + 1}`}>
                                                Grade {i + 1} (All Streams)
                                            </SelectItem>
                                        ))}

                                        <div className="my-1 border-t" />
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            By Class
                                        </div>
                                        {classes.length === 0 ? (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                                                No classes found
                                            </div>
                                        ) : (
                                            classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.name} (Stream {cls.stream})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <span className="text-sm">Present</span>
                                </div>
                                <span className="font-bold">{stats.present}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-sm">Absent</span>
                                </div>
                                <span className="font-bold">{stats.absent}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                    <span className="text-sm">Late</span>
                                </div>
                                <span className="font-bold">{stats.late}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                                    <span className="text-sm">Sick</span>
                                </div>
                                <span className="font-bold">{stats.sick}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    <span className="text-sm">Excused</span>
                                </div>
                                <span className="font-bold">{stats.excused}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Attendance Rate</span>
                                    <span className="font-bold text-emerald-600">{attendanceRate}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>
                            {selectedGroupId === 'unassigned'
                                ? "Marking attendance for unassigned students"
                                : selectedGroupId.startsWith('grade-')
                                    ? `Marking attendance for Grade ${selectedGroupId.split('-')[1]}`
                                    : "Mark attendance for the selected class"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedGroupId ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Remarks</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No students found in this selection.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student) => {
                                            const record = getStudentRecord(student.id);
                                            const status = record?.status || 'Present';

                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>{student.firstName.substring(0, 1)}{student.surname.substring(0, 1)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{student.firstName} {student.surname}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {student.classId ?
                                                                        classes.find(c => c.id === student.classId)?.name
                                                                        : "Unassigned"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={getStatusColor(status)}>
                                                            {status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            className="h-8 w-[200px]"
                                                            placeholder="Add remarks..."
                                                            value={record?.remarks || ''}
                                                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant={status === 'Present' ? "default" : "ghost"}
                                                                className={cn("h-8 w-8", status === 'Present' ? "bg-emerald-600 hover:bg-emerald-700" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50")}
                                                                onClick={() => handleStatusChange(student.id, 'Present')}
                                                                title="Present"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant={status === 'Absent' ? "default" : "ghost"}
                                                                className={cn("h-8 w-8", status === 'Absent' ? "bg-red-600 hover:bg-red-700" : "text-red-600 hover:text-red-700 hover:bg-red-50")}
                                                                onClick={() => handleStatusChange(student.id, 'Absent')}
                                                                title="Absent"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant={status === 'Late' ? "default" : "ghost"}
                                                                className={cn("h-8 w-8", status === 'Late' ? "bg-yellow-600 hover:bg-yellow-700" : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50")}
                                                                onClick={() => handleStatusChange(student.id, 'Late')}
                                                                title="Late"
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant={status === 'Sick' ? "default" : "ghost"}
                                                                className={cn("h-8 w-8", status === 'Sick' ? "bg-orange-600 hover:bg-orange-700" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50")}
                                                                onClick={() => handleStatusChange(student.id, 'Sick')}
                                                                title="Sick"
                                                            >
                                                                <AlertCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                                <p>Please select a class or group to view the student list.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
