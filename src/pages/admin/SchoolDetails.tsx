import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard, Users, GraduationCap, BookOpen, Key, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SchoolService, type School } from "@/lib/SchoolService";
import { toast } from "@/hooks/use-toast";

export default function SchoolDetails() {
    const { id } = useParams<{ id: string }>();
    const [school, setSchool] = useState<School | null>(null);

    useEffect(() => {
        if (id) {
            const schoolData = SchoolService.getSchoolById(id);
            setSchool(schoolData);
        }
    }, [id]);

    if (!school) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">School not found</p>
                <Link to="/admin/schools">
                    <Button className="mt-4" variant="outline">Back to Schools</Button>
                </Link>
            </div>
        );
    }

    const daysUntilExpiry = Math.ceil(
        (new Date(school.subscription.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const studentUsagePercent = typeof school.subscription.plan.features.maxStudents === 'number'
        ? (school.stats.totalStudents / school.subscription.plan.features.maxStudents) * 100
        : 0;

    const teacherUsagePercent = typeof school.subscription.plan.features.maxTeachers === 'number'
        ? (school.stats.totalTeachers / school.subscription.plan.features.maxTeachers) * 100
        : 0;

    const copyCredentials = (email: string, password: string, role: string) => {
        const text = `${role}\nEmail: ${email}\nPassword: ${password}`;
        navigator.clipboard.writeText(text);
        toast({
            title: "Credentials Copied",
            description: `${role} credentials copied to clipboard`,
        });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/schools">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{school.name}</h1>
                        <p className="text-muted-foreground mt-1">Center Number: {school.centerNumber}</p>
                    </div>
                </div>
                <Badge variant={school.status === 'active' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                    {school.status}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* School Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            School Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{school.contact.email}</p>
                            </div>
                        </div>
                        {school.contact.phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{school.contact.phone}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium">
                                    {school.location.district}, {school.location.province}
                                    {school.location.ward && `, Ward ${school.location.ward}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <BookOpen className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">School Type</p>
                                <p className="font-medium">{school.type}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Subscription Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Plan</p>
                            <p className="font-medium text-lg">{school.subscription.plan.name}</p>
                            <p className="text-sm text-muted-foreground">${school.subscription.plan.price}/{school.subscription.billingCycle}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="font-medium">{school.subscription.startDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Expiry Date</p>
                                <p className="font-medium">{school.subscription.expiryDate}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Days Until Expiry</p>
                            <div className="flex items-center gap-3">
                                <Progress value={Math.max(0, 100 - (daysUntilExpiry / 365 * 100))} className="flex-1" />
                                <span className={`font-bold ${daysUntilExpiry <= 30 ? 'text-destructive' : 'text-green-600'}`}>
                                    {daysUntilExpiry} days
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">Extend Subscription</Button>
                            <Button size="sm" variant="outline" className="flex-1">Change Plan</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                    <CardDescription>Current usage vs subscription limits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Students</span>
                                <span className="text-sm text-muted-foreground">
                                    {school.stats.totalStudents} / {school.subscription.plan.features.maxStudents}
                                </span>
                            </div>
                            <Progress value={studentUsagePercent} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Teachers</span>
                                <span className="text-sm text-muted-foreground">
                                    {school.stats.totalTeachers} / {school.subscription.plan.features.maxTeachers}
                                </span>
                            </div>
                            <Progress value={teacherUsagePercent} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Storage</span>
                                <span className="text-sm text-muted-foreground">
                                    {school.stats.storageUsed} / {school.subscription.plan.features.storage}
                                </span>
                            </div>
                            <Progress value={10} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* School Structure */}
            <Card>
                <CardHeader>
                    <CardTitle>School Structure</CardTitle>
                    <CardDescription>Initialized academic structure</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-3xl font-bold text-purple-600">{school.structure.grades.length}</p>
                            <p className="text-sm text-purple-700">Grades</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-3xl font-bold text-indigo-600">{school.stats.totalClasses}</p>
                            <p className="text-sm text-indigo-700">Classes</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-3xl font-bold text-blue-600">{school.structure.subjects.length}</p>
                            <p className="text-sm text-blue-700">Subjects</p>
                        </div>
                        <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                            <p className="text-3xl font-bold text-cyan-600">{school.structure.academicYear}</p>
                            <p className="text-sm text-cyan-700">Academic Year</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Generated Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Generated Login Accounts
                    </CardTitle>
                    <CardDescription>Auto-generated credentials for school administrators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Head Teacher */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-purple-900">Head Teacher</h4>
                            <Badge className="bg-purple-600">Primary Admin</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-purple-700">Email:</span>
                                <span className="ml-2 font-mono">{school.generatedAccounts.headTeacher.email}</span>
                            </div>
                            <div>
                                <span className="text-purple-700">Password:</span>
                                <span className="ml-2 font-mono">{school.generatedAccounts.headTeacher.temporaryPassword}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyCredentials(
                                    school.generatedAccounts.headTeacher.email,
                                    school.generatedAccounts.headTeacher.temporaryPassword,
                                    'Head Teacher'
                                )}
                            >
                                Copy Credentials
                            </Button>
                            <Button size="sm" variant="outline">Reset Password</Button>
                        </div>
                    </div>

                    {/* Senior Teacher */}
                    {school.generatedAccounts.seniorTeacher && (
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-indigo-900">Senior Teacher</h4>
                                <Badge className="bg-indigo-600">Deputy Admin</Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-indigo-700">Email:</span>
                                    <span className="ml-2 font-mono">{school.generatedAccounts.seniorTeacher.email}</span>
                                </div>
                                <div>
                                    <span className="text-indigo-700">Password:</span>
                                    <span className="ml-2 font-mono">{school.generatedAccounts.seniorTeacher.temporaryPassword}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyCredentials(
                                        school.generatedAccounts.seniorTeacher!.email,
                                        school.generatedAccounts.seniorTeacher!.temporaryPassword,
                                        'Senior Teacher'
                                    )}
                                >
                                    Copy Credentials
                                </Button>
                                <Button size="sm" variant="outline">Reset Password</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Button variant="outline" className="justify-start">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <Calendar className="w-4 h-4 mr-2" />
                            Extend Subscription
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <Users className="w-4 h-4 mr-2" />
                            View Users
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            View Students
                        </Button>
                        <Button variant="outline" className="justify-start text-orange-600 hover:text-orange-700">
                            Deactivate School
                        </Button>
                        <Button variant="outline" className="justify-start text-destructive hover:text-destructive">
                            Delete School
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
