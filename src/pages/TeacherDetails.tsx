import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StorageService, Teacher } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, BookOpen, GraduationCap, Calendar, Edit, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeacherDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<Teacher | null>(null);

    useEffect(() => {
        if (id) {
            const foundTeacher = StorageService.getTeachers().find(t => t.id === id);
            if (foundTeacher) {
                setTeacher(foundTeacher);
            } else {
                navigate("/teachers");
            }
        }
    }, [id, navigate]);

    if (!teacher) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/teachers")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Teacher Profile</h1>
                    <p className="text-muted-foreground">View and manage teacher information</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/teachers/${id}/edit`)}>
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
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`} />
                            <AvatarFallback className="text-2xl">{teacher.firstName[0]}{teacher.surname[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{teacher.firstName} {teacher.surname}</h2>
                                <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                                    {teacher.status}
                                </Badge>
                            </div>
                            <p className="text-lg text-muted-foreground">{teacher.position}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    {teacher.qualification}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {teacher.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {teacher.contactNumber}
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
                    <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Professional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground block">Employee Number</span>
                                        <span className="font-medium">{teacher.employeeNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">NRC Number</span>
                                        <span className="font-medium">{teacher.nrcNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Date of Birth</span>
                                        <span className="font-medium">{new Date(teacher.dateOfBirth).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Gender</span>
                                        <span className="font-medium">{teacher.gender}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <p className="text-sm leading-relaxed">
                                        {teacher.address}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="classes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Subjects</CardTitle>
                            <CardDescription>Subjects currently taught by this teacher</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.map((subject, index) => (
                                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>Class timetable</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No schedule available for this teacher.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
