import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Examinations() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Examinations Management</h1>
                <p className="text-muted-foreground">
                    National examinations scheduling and results processing
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Upcoming Examinations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                <div>
                                    <div className="font-semibold">Grade 7 Composite Exam</div>
                                    <div className="text-xs text-muted-foreground">November 4th - 8th, 2025</div>
                                </div>
                                <Badge>Scheduled</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                <div>
                                    <div className="font-semibold">Junior Secondary (Grade 9)</div>
                                    <div className="text-xs text-muted-foreground">November 18th - 29th, 2025</div>
                                </div>
                                <Badge>Scheduled</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                <div>
                                    <div className="font-semibold">School Certificate (Grade 12)</div>
                                    <div className="text-xs text-muted-foreground">October 1st - November 15th, 2025</div>
                                </div>
                                <Badge>Scheduled</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-success" />
                            Results Processing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                <div>
                                    <div className="font-semibold">2024 GCE Exams</div>
                                    <div className="text-xs text-muted-foreground">Results released on Aug 20, 2024</div>
                                </div>
                                <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/30">Published</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border">
                                <div>
                                    <div className="font-semibold">2024 Grade 9 External</div>
                                    <div className="text-xs text-muted-foreground">Processing centers active</div>
                                </div>
                                <Badge variant="outline" className="border-warning text-warning">In Progress</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
