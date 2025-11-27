import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, CreditCard, FileText, User } from "lucide-react";

export default function ParentPortal() {
    // Mock data
    const student = {
        name: "Peter Ng'andu",
        grade: "7A",
        attendance: "95%",
        feesDue: "K0.00"
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Parent Portal
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome, Mr. Ng'andu. Viewing profile for {student.name}.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Student</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{student.name}</div>
                        <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{student.attendance}</div>
                        <p className="text-xs text-muted-foreground">Term 1, 2024</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fees Due</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{student.feesDue}</div>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">Paid in Full</Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">New</div>
                        <p className="text-xs text-muted-foreground">Term 1 Report Available</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="academics" className="w-full">
                <TabsList>
                    <TabsTrigger value="academics">Academics</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                </TabsList>

                <TabsContent value="academics" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Results</CardTitle>
                            <CardDescription>Academic performance for Term 1</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { subject: "Mathematics", score: 85, grade: "A" },
                                    { subject: "English", score: 78, grade: "B+" },
                                    { subject: "Science", score: 92, grade: "A+" },
                                    { subject: "Social Studies", score: 70, grade: "B" }
                                ].map((subject, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{subject.subject}</p>
                                                <p className="text-sm text-muted-foreground">Test 1</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{subject.score}%</p>
                                            <Badge variant="secondary">{subject.grade}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card className="p-12 text-center text-muted-foreground border-dashed">
                        Detailed attendance history will appear here.
                    </Card>
                </TabsContent>

                <TabsContent value="fees">
                    <Card className="p-12 text-center text-muted-foreground border-dashed">
                        Fee statements and payment history will appear here.
                    </Card>
                </TabsContent>

                <TabsContent value="communication">
                    <Card className="p-12 text-center text-muted-foreground border-dashed">
                        Messages from teachers and school administration will appear here.
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
