import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StorageService, School, Student, Teacher } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Users, School as SchoolIcon, TrendingUp, AlertTriangle, Phone, Mail } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SchoolDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [school, setSchool] = useState<School | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        if (id) {
            const foundSchool = StorageService.getSchools().find(s => s.id === id);
            if (foundSchool) {
                setSchool(foundSchool);
                // In a real app, we would filter students and teachers by school ID
                // For this demo, we'll just get all of them as a placeholder or filter if possible
                setStudents(StorageService.getStudents(id));
                setTeachers(StorageService.getTeachers().filter(t => t.schoolId === id));
            } else {
                navigate("/schools");
            }
        }
    }, [id, navigate]);

    if (!school) return null;

    const utilization = Math.round((school.totalEnrolment / school.standardCapacity) * 100);

    const getCapacityStatus = (utilization: number) => {
        if (utilization > 100) return { status: 'Over Capacity', color: 'destructive' };
        if (utilization > 90) return { status: 'Near Capacity', color: 'warning' };
        if (utilization > 70) return { status: 'Good Utilization', color: 'default' };
        return { status: 'Under Capacity', color: 'secondary' };
    };

    const capacityStatus = getCapacityStatus(utilization);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/schools")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">School Details</h1>
                    <p className="text-muted-foreground">View and manage school information</p>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="h-24 w-24 rounded-lg bg-white shadow-sm flex items-center justify-center border">
                            <SchoolIcon className="h-12 w-12 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{school.name}</h2>
                                <Badge variant={school.type === 'GRZ' ? 'default' : 'secondary'}>
                                    {school.type}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {school.district}, {school.province}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">Center No:</span>
                                    {school.centerNumber}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">EMIS No:</span>
                                    {school.emisNumber}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">Zone:</span>
                                    {school.zone}
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
                    <TabsTrigger value="staff">Staff ({teachers.length})</TabsTrigger>
                    <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{school.totalEnrolment.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Active students</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Capacity</CardTitle>
                                <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{school.standardCapacity.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Standard capacity</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilization</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{utilization}%</div>
                                <Progress value={utilization} className="mt-2 h-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-sm">{capacityStatus.status}</div>
                                <Badge variant={capacityStatus.color as any} className="mt-1">
                                    {capacityStatus.status}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>+260 211 123456</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>info@{school.name.toLowerCase().replace(/\s+/g, '')}.edu.zm</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <span>
                                        {school.name}<br />
                                        {school.zone} Zone<br />
                                        {school.district}, {school.province}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Infrastructure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Classrooms</span>
                                        <p className="font-medium">24</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Laboratories</span>
                                        <p className="font-medium">3</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Library</span>
                                        <p className="font-medium">Yes</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Sports Fields</span>
                                        <p className="font-medium">2</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="staff">
                    <Card>
                        <CardHeader>
                            <CardTitle>Teaching Staff</CardTitle>
                            <CardDescription>Teachers assigned to this school</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {teachers.length > 0 ? (
                                <div className="space-y-4">
                                    {teachers.map(teacher => (
                                        <div key={teacher.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{teacher.firstName} {teacher.surname}</p>
                                                <p className="text-sm text-muted-foreground">{teacher.position}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/teachers/${teacher.id}`)}>
                                                View Profile
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No teachers found for this school.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Body</CardTitle>
                            <CardDescription>Enrolled students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {students.length > 0 ? (
                                <div className="space-y-4">
                                    {students.slice(0, 10).map(student => (
                                        <div key={student.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{student.firstName} {student.surname}</p>
                                                <p className="text-sm text-muted-foreground">Grade {student.currentLevel}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/students/${student.id}`)}>
                                                View Profile
                                            </Button>
                                        </div>
                                    ))}
                                    {students.length > 10 && (
                                        <Button variant="ghost" className="w-full mt-4">
                                            View All {students.length} Students
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No students found for this school.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
