import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Teacher } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, BookOpen, GraduationCap, Calendar, Edit, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeacherDetails() {
    const { schoolSlug, id } = useParams<{ schoolSlug: string, id: string }>();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [assignedClasses, setAssignedClasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchTeacher = async () => {
            if (id) {
                const { data, error } = await supabase
                    .from('teachers')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    // Map snake_case to camelCase
                    const teacherData: Teacher = {
                        id: data.id,
                        schoolId: data.school_id,
                        employeeNumber: data.employee_number,
                        firstName: data.first_name,
                        surname: data.surname,
                        otherNames: data.other_names,
                        gender: data.gender,
                        dateOfBirth: data.date_of_birth,
                        nationalId: data.national_id,
                        contactNumber: data.contact_number,
                        email: data.email,
                        qualification: data.qualification,
                        subjects: Array.isArray(data.subjects) ? data.subjects : [],
                        assignedClassIds: data.assigned_class_ids,
                        position: data.position,
                        dateEmployed: data.date_employed,
                        status: data.status
                    };
                    setTeacher(teacherData);

                    // Fetch class details if any
                    if (data.assigned_class_ids && data.assigned_class_ids.length > 0) {
                        const { data: classData } = await supabase
                            .from('classes')
                            .select('id, name, level, stream')
                            .in('id', data.assigned_class_ids);

                        if (classData) {
                            setAssignedClasses(classData);
                        }
                    }
                } else {
                    navigate(`/${schoolSlug}/teachers`);
                }
            }
        };
        fetchTeacher();
    }, [id, navigate, schoolSlug]);


    if (!teacher) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/${schoolSlug}/teachers`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Teacher Profile</h1>
                    <p className="text-muted-foreground">View and manage teacher information</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/${schoolSlug}/teachers/${id}/edit`)}>
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

                <TabsContent value="classes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Subjects</CardTitle>
                            <CardDescription>Subjects currently taught by this teacher</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.length > 0 ? (
                                    teacher.subjects.map((subject, index) => (
                                        <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                                            {subject}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No subjects assigned.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Classes</CardTitle>
                            <CardDescription>Classes this teacher is responsible for</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {assignedClasses.length > 0 ? (
                                    assignedClasses.map((cls) => (
                                        <div key={cls.id} className="flex items-center p-3 border rounded-lg bg-card shadow-sm">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{cls.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Grade {cls.level} {cls.stream ? `- ${cls.stream}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground col-span-2">No classes assigned.</p>
                                )}
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
