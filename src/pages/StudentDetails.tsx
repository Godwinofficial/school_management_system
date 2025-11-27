import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StorageService, Student } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, BookOpen, GraduationCap, Calendar, FileText, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);

    useEffect(() => {
        if (id) {
            const foundStudent = StorageService.getStudent(id);
            if (foundStudent) {
                setStudent(foundStudent);
            } else {
                navigate("/students");
            }
        }
    }, [id, navigate]);

    if (!student) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
                    <p className="text-muted-foreground">View and manage student information</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/students/${id}/edit`)}>
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
                                    Level {student.currentLevel}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
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
                                        <span className="font-medium">{student.guardianName}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Contact</span>
                                        <span className="font-medium">{student.guardianContact}</span>
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
        </div>
    );
}
