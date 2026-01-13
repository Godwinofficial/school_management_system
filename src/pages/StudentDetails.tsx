import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StudentService } from "@/lib/StudentService";
import { StorageService, Student, School } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, BookOpen, GraduationCap, Calendar, FileText, Edit, Loader2, ArrowRightLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function StudentDetails() {
    const { schoolSlug, id } = useParams<{ schoolSlug: string, id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Transfer State
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [targetSchoolId, setTargetSchoolId] = useState<string>("");
    const [availableSchools, setAvailableSchools] = useState<School[]>([]);

    const user = AuthService.getCurrentUser();
    const userLevel = AuthService.getUserLevel();

    useEffect(() => {
        const loadStudent = async () => {
            if (id) {
                try {
                    const foundStudent = await StudentService.getStudent(id);
                    if (foundStudent) {
                        setStudent(foundStudent);
                    } else {
                        // navigate("/students"); // Don't redirect immediately to allow debugging
                    }
                } catch (error) {
                    console.error("Failed to load student", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadStudent();

        // Load schools for transfer functionality
        setAvailableSchools(StorageService.getSchools());
    }, [id, navigate]);

    const handleTransferStudent = async () => {
        if (!student || !targetSchoolId) return;

        const targetSchool = availableSchools.find(s => s.id === targetSchoolId);
        if (!targetSchool) return;

        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const newEnrolmentNumber = `${targetSchool.centerNumber}/${year}/${random}`;

        const updatedStudent: Student = {
            ...student,
            schoolId: targetSchoolId,
            enrolmentNumber: newEnrolmentNumber,
            status: 'Active', // Reset to Active in new school
            classId: undefined, // Clear class assignment
            academicPerformance: student.academicPerformance || {} // Preserve history
        };

        await StudentService.saveStudent(updatedStudent);

        setTransferDialogOpen(false);
        setTargetSchoolId("");

        toast({
            title: "Transfer Successful",
            description: `Student transferred to ${targetSchool.name}. New ID: ${newEnrolmentNumber}`,
            className: "bg-blue-500 text-white border-none"
        });

        // Redirect back to students list since this student is no longer in this school context
        navigate(`/${schoolSlug}/students`);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!student) return <div className="p-8">Student not found</div>;

    // Helper to get guardian info safely
    const guardianName = student.guardian?.firstName ? `${student.guardian.firstName} ${student.guardian.surname}`
        : student.father?.firstName ? `${student.father.firstName} ${student.father.surname}`
            : student.mother?.firstName ? `${student.mother.firstName} ${student.mother.surname}`
                : 'N/A';

    const guardianContact = student.guardian?.contactNumber
        || student.father?.contactNumber
        || student.mother?.contactNumber
        || 'N/A';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/${schoolSlug}/students`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
                    <p className="text-muted-foreground">View and manage student information</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => setTransferDialogOpen(true)}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Transfer
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/${schoolSlug}/students/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                            <AvatarFallback className="text-2xl">{student.firstName[0]}{student.surname[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{student.firstName} {student.surname}</h2>
                                <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                                    {student.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {student.enrolmentNumber}
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Grade {student.currentLevel}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academic">Academic Records</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block">Gender</span>
                                        <span className="font-medium">{student.gender}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Nationality</span>
                                        <span className="font-medium">Zambian</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Guardian</span>
                                        <span className="font-medium">{guardianName}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Contact</span>
                                        <span className="font-medium">{guardianContact}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block">Current Class</span>
                                        <span className="font-medium">Grade {student.currentLevel}A</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Performance</span>
                                        <Badge variant="outline" className="mt-1">{student.overallPerformance}</Badge>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Attendance Rate</span>
                                        <span className="font-medium text-success">94%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="academic">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic History</CardTitle>
                            <CardDescription>Past performance and grades</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No academic records found for this student.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Record</CardTitle>
                            <CardDescription>Class attendance history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No attendance records found for this student.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Transfer Dialog */}
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Student</DialogTitle>
                        <DialogDescription>
                            Move {student.firstName} to another school. This will change their enrollment status and school assignment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="target-school">Target School</Label>
                            <Select value={targetSchoolId} onValueChange={setTargetSchoolId}>
                                <SelectTrigger id="target-school">
                                    <SelectValue placeholder="Select destination school" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSchools
                                        .filter(s => s.id !== student.schoolId)
                                        .map(school => (
                                            <SelectItem key={school.id} value={school.id}>
                                                {school.name} ({school.district})
                                            </SelectItem>
                                        ))}
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
