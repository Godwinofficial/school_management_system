import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, ArrowRight, Wallet, LogOut, Users } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Student } from "@/lib/storage";
import { StudentService } from "@/lib/StudentService";

export default function ParentPortal() {
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();
    const [children, setChildren] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            // Check if we already have children loaded to avoid flicker
            if (children.length > 0) {
                setLoading(false);
                // We could return here, but let's allow a background refresh if needed.
                // Ideally, we just don't set loading to true blindly.
            }

            if (user?.role === 'guardian') {
                try {
                    // Only show loading spinner if we don't have data yet
                    if (children.length === 0) {
                        setLoading(true);
                    }

                    // We use the phone number (user.email) to find all linked children
                    const phoneNumber = user.email; // The identifier used to login
                    const linkedChildren = await StudentService.getStudentsByGuardianPhone(phoneNumber);
                    setChildren(linkedChildren);
                } catch (e) {
                    console.error("Failed to load children", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchChildren();
    }, [user?.email]);

    if (!user || user.role !== 'guardian') return null;

    const handleLogout = () => {
        AuthService.logout();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Parent Portal
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome, {user.firstName} {user.lastName}
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                    </Button>
                </div>

                {/* Children List */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
                        <Users className="h-5 w-5" />
                        <h3>Your Children ({children.length})</h3>
                    </div>

                    {loading ? (
                        <Card className="p-12 text-center border-dashed">
                            <p className="text-muted-foreground">Loading student information...</p>
                        </Card>
                    ) : children.length > 0 ? (
                        children.map(student => (
                            <Card key={student.id} className="border-0 shadow-lg bg-white overflow-hidden transition-all hover:shadow-xl">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {student.status || 'Active'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    Grade {student.currentLevel}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-2xl font-bold text-slate-900">
                                                {student.firstName} {student.surname}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <User className="h-4 w-4" />
                                                Enrolment ID: {student.enrolmentNumber}
                                            </CardDescription>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-slate-100 border flex items-center justify-center">
                                            <span className="text-xl font-bold text-slate-500">
                                                {student.firstName ? student.firstName[0] : ''}{student.surname ? student.surname[0] : ''}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-6 py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm font-medium">Year</span>
                                            </div>
                                            <p className="text-lg font-semibold">{new Date().getFullYear()}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <BookOpen className="h-4 w-4" />
                                                <span className="text-sm font-medium">School</span>
                                            </div>
                                            <p className="text-lg font-semibold truncate" title={student.school?.name}>
                                                {student.school?.name || 'School Name'}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Wallet className="h-4 w-4" />
                                                <span className="text-sm font-medium">Fee Status</span>
                                            </div>
                                            <p className="text-lg font-semibold text-emerald-600">Up to Date</p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="bg-slate-50/50 p-6 flex flex-col sm:flex-row gap-3">
                                    <Button
                                        className="w-full flex-1 h-12 text-base shadow-md shadow-primary/20"
                                        // We need to pass the student ID to results page somehow, but the results page relies on Auth user context...
                                        // This is a tricky part. The Results page uses `AuthService.getCurrentUser()`.
                                        // For a Guardian with multiple kids, we need to context switch or pass param.
                                        // Let's rely on navigating to a url with query param? No, app routing uses params.
                                        // But Results page is /:slug/student/results.
                                        // We might need to update Auth Metadata to "select" this child before navigating.
                                        onClick={() => {
                                            // Update metadata to selected child
                                            const updatedUser = {
                                                ...user,
                                                metadata: { ...user.metadata, studentId: student.id }
                                            };
                                            localStorage.setItem('nrs_user', JSON.stringify(updatedUser));
                                            // Trigger event to ensuring sync? Not strictly needed for page nav but good practice.
                                            // window.dispatchEvent(new Event('authChange'));

                                            // Navigate
                                            const slug = student.school?.slug || user.school?.slug || 'national';
                                            navigate(`/${slug}/student/results`);
                                        }}
                                    >
                                        <BookOpen className="mr-2 h-5 w-5" />
                                        View Academic Results
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full flex-1 h-12 text-base bg-white"
                                        onClick={() => {
                                            // Same "Select Child" logic
                                            const updatedUser = {
                                                ...user,
                                                metadata: { ...user.metadata, studentId: student.id }
                                            };
                                            localStorage.setItem('nrs_user', JSON.stringify(updatedUser));

                                            const slug = student.school?.slug || user.school?.slug || 'national';
                                            navigate(`/${slug}/student`);
                                        }}
                                    >
                                        <User className="mr-2 h-5 w-5" />
                                        View Full Profile
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-12 text-center border-dashed">
                            <div className="flex justify-center mb-4">
                                <Users className="h-12 w-12 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No Children Linked</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                We couldn't find any students linked to your phone number ({user.email}). Please contact the school administration to verify your details are correct.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
